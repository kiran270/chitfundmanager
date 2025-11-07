from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import uuid
from datetime import datetime, date
import bcrypt
import jwt
from functools import wraps
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'
DATABASE = 'chitfund.db'



def get_db_connection():
    conn = sqlite3.connect(DATABASE, timeout=20.0)
    conn.row_factory = sqlite3.Row
    # Enable WAL mode for better concurrency
    conn.execute('PRAGMA journal_mode=WAL;')
    # Set busy timeout
    conn.execute('PRAGMA busy_timeout=30000;')
    return conn

from contextlib import contextmanager
import time

@contextmanager
def get_db():
    """Context manager for database connections with retry logic"""
    max_retries = 3
    retry_delay = 0.1
    
    for attempt in range(max_retries):
        try:
            conn = get_db_connection()
            yield conn
            conn.close()
            return
        except sqlite3.OperationalError as e:
            if "database is locked" in str(e) and attempt < max_retries - 1:
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
                continue
            else:
                if 'conn' in locals():
                    conn.close()
                raise e
        except Exception as e:
            if 'conn' in locals():
                conn.rollback()
                conn.close()
            raise e



def migrate_db():
    """Add missing columns to existing tables"""
    conn = get_db_connection()
    try:
        # Add createdBy column to users table if it doesn't exist
        conn.execute('ALTER TABLE users ADD COLUMN createdBy TEXT')
        conn.commit()
        print("Added createdBy column to users table")
    except sqlite3.OperationalError:
        # Column already exists
        pass
    finally:
        conn.close()

def init_db():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    
    # Users table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            userId TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phoneNumber TEXT,
            address TEXT,
            passwordHash TEXT NOT NULL,
            role TEXT DEFAULT 'member',
            createdBy TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (createdBy) REFERENCES users (userId)
        )
    ''')
    
    # ChitGroups table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS chitgroups (
            groupId TEXT PRIMARY KEY,
            groupName TEXT NOT NULL,
            chitValue DECIMAL(10,2) NOT NULL,
            installmentAmount DECIMAL(10,2) NOT NULL,
            memberCount INTEGER NOT NULL,
            durationMonths INTEGER NOT NULL,
            commissionPercent FLOAT DEFAULT 5.0,
            startDate DATE,
            status TEXT DEFAULT 'Pending',
            foremanId TEXT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (foremanId) REFERENCES users (userId)
        )
    ''')
    
    # GroupMembers table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS groupmembers (
            membershipId TEXT PRIMARY KEY,
            groupId TEXT NOT NULL,
            userId TEXT NOT NULL,
            ticketNumber INTEGER NOT NULL,
            joinDate DATE DEFAULT CURRENT_DATE,
            FOREIGN KEY (groupId) REFERENCES chitgroups (groupId),
            FOREIGN KEY (userId) REFERENCES users (userId),
            UNIQUE(groupId, ticketNumber)
        )
    ''')
    
    # Auctions table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS auctions (
            auctionId TEXT PRIMARY KEY,
            groupId TEXT NOT NULL,
            auctionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            auctionMonth INTEGER NOT NULL,
            winningBidAmount DECIMAL(10,2),
            winnerId TEXT,
            winnerName TEXT,
            foremanCommission DECIMAL(10,2),
            dividend DECIMAL(10,2),
            netInstallment DECIMAL(10,2),
            auctionDetails TEXT,
            whatsappSent BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (groupId) REFERENCES chitgroups (groupId),
            FOREIGN KEY (winnerId) REFERENCES users (userId)
        )
    ''')
    

    
    # Migrations: Add missing columns if they don't exist
    try:
        # Check existing columns
        cursor = conn.execute("PRAGMA table_info(auctions)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add missing columns
        if 'winnerName' not in columns:
            conn.execute('ALTER TABLE auctions ADD COLUMN winnerName TEXT')
        if 'auctionDetails' not in columns:
            conn.execute('ALTER TABLE auctions ADD COLUMN auctionDetails TEXT')
        if 'whatsappSent' not in columns:
            conn.execute('ALTER TABLE auctions ADD COLUMN whatsappSent BOOLEAN DEFAULT FALSE')
            
        conn.commit()
    except sqlite3.OperationalError:
        # Columns already exist, ignore
        pass
    
    conn.commit()
    conn.close()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['userId']
            current_user_role = data['role']
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user_id, current_user_role, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            if data['role'] != 'admin':
                return jsonify({'message': 'Admin access required'}), 403
            current_user_id = data['userId']
            current_user_role = data['role']
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user_id, current_user_role, *args, **kwargs)
    return decorated

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Hash password
    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    conn = get_db_connection()
    try:
        user_id = str(uuid.uuid4())
        conn.execute('''
            INSERT INTO users (userId, name, email, phoneNumber, address, passwordHash, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, data['name'], data['email'], data.get('phoneNumber'), 
              data.get('address'), password_hash.decode('utf-8'), data.get('role', 'member')))
        conn.commit()
        
        # Generate token
        token = jwt.encode({
            'userId': user_id,
            'email': data['email'],
            'role': data.get('role', 'member')
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'userId': user_id,
                'name': data['name'],
                'email': data['email'],
                'role': data.get('role', 'member')
            }
        }), 201
        
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Email already exists'}), 400
    finally:
        conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE email = ?', (data['email'],)
    ).fetchone()
    conn.close()
    
    if user and bcrypt.checkpw(data['password'].encode('utf-8'), user['passwordHash'].encode('utf-8')):
        token = jwt.encode({
            'userId': user['userId'],
            'email': user['email'],
            'role': user['role']
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'userId': user['userId'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            }
        })
    
    return jsonify({'message': 'Invalid credentials'}), 401

# Chit Groups Routes
@app.route('/api/chitgroups', methods=['GET'])
@token_required
def get_chit_groups(current_user_id, current_user_role):
    conn = get_db_connection()
    
    if current_user_role == 'admin':
        # Admins only see groups they created
        groups = conn.execute('''
            SELECT cg.*, u.name as foremanName 
            FROM chitgroups cg 
            JOIN users u ON cg.foremanId = u.userId
            WHERE cg.foremanId = ?
            ORDER BY cg.createdAt DESC
        ''', (current_user_id,)).fetchall()
    else:
        # Members see all groups (for browsing)
        groups = conn.execute('''
            SELECT cg.*, u.name as foremanName 
            FROM chitgroups cg 
            JOIN users u ON cg.foremanId = u.userId
            ORDER BY cg.createdAt DESC
        ''').fetchall()
    
    conn.close()
    return jsonify([dict(group) for group in groups])

@app.route('/api/chitgroups/browse', methods=['GET'])
@token_required
def browse_all_groups(current_user_id, current_user_role):
    """Endpoint for members to browse all available groups"""
    conn = get_db_connection()
    groups = conn.execute('''
        SELECT cg.*, u.name as foremanName 
        FROM chitgroups cg 
        JOIN users u ON cg.foremanId = u.userId
        WHERE cg.status = 'Pending'
        ORDER BY cg.createdAt DESC
    ''').fetchall()
    conn.close()
    
    return jsonify([dict(group) for group in groups])

@app.route('/api/chitgroups', methods=['POST'])
@admin_required
def create_chit_group(current_user_id, current_user_role):
    data = request.get_json()
    
    conn = get_db_connection()
    group_id = str(uuid.uuid4())
    
    conn.execute('''
        INSERT INTO chitgroups (groupId, groupName, chitValue, installmentAmount, 
                               memberCount, durationMonths, commissionPercent, 
                               startDate, foremanId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (group_id, data['groupName'], data['chitValue'], data['installmentAmount'],
          data['memberCount'], data['durationMonths'], data.get('commissionPercent', 5.0),
          data.get('startDate'), current_user_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Chit group created successfully', 'groupId': group_id}), 201

@app.route('/api/chitgroups/<group_id>/members', methods=['GET'])
@token_required
def get_group_members(current_user_id, current_user_role, group_id):
    conn = get_db_connection()
    members = conn.execute('''
        SELECT gm.*, u.name, u.email, u.phoneNumber
        FROM groupmembers gm
        JOIN users u ON gm.userId = u.userId
        WHERE gm.groupId = ?
        ORDER BY gm.ticketNumber
    ''', (group_id,)).fetchall()
    conn.close()
    
    return jsonify([dict(member) for member in members])

@app.route('/api/chitgroups/<group_id>/add-member', methods=['POST'])
@admin_required
def add_member_to_group(current_user_id, current_user_role, group_id):
    data = request.get_json()
    
    conn = get_db_connection()
    
    # Check if group exists and has space
    group = conn.execute('SELECT * FROM chitgroups WHERE groupId = ?', (group_id,)).fetchone()
    if not group:
        conn.close()
        return jsonify({'message': 'Group not found'}), 404
    
    # Check if user exists
    user = conn.execute('SELECT * FROM users WHERE email = ?', (data['email'],)).fetchone()
    if not user:
        conn.close()
        return jsonify({'message': 'User not found'}), 404
    
    # Check if user is already a member
    existing_member = conn.execute(
        'SELECT * FROM groupmembers WHERE groupId = ? AND userId = ?', 
        (group_id, user['userId'])
    ).fetchone()
    
    if existing_member:
        conn.close()
        return jsonify({'message': 'User is already a member of this group'}), 400
    
    # Check current member count
    current_members = conn.execute(
        'SELECT COUNT(*) as count FROM groupmembers WHERE groupId = ?', (group_id,)
    ).fetchone()
    
    if current_members['count'] >= group['memberCount']:
        conn.close()
        return jsonify({'message': 'Group is full'}), 400
    
    # Get next ticket number
    next_ticket = conn.execute(
        'SELECT COALESCE(MAX(ticketNumber), 0) + 1 as nextTicket FROM groupmembers WHERE groupId = ?',
        (group_id,)
    ).fetchone()
    
    membership_id = str(uuid.uuid4())
    conn.execute('''
        INSERT INTO groupmembers (membershipId, groupId, userId, ticketNumber)
        VALUES (?, ?, ?, ?)
    ''', (membership_id, group_id, user['userId'], next_ticket['nextTicket']))
    
    # Check if group is now full and auto-activate
    new_member_count = conn.execute(
        'SELECT COUNT(*) as count FROM groupmembers WHERE groupId = ?', (group_id,)
    ).fetchone()
    
    group_full = False
    if new_member_count['count'] >= group['memberCount'] and group['status'] == 'Pending':
        conn.execute('''
            UPDATE chitgroups SET status = 'Active' WHERE groupId = ?
        ''', (group_id,))
        group_full = True
    
    conn.commit()
    conn.close()
    
    response_data = {
        'message': 'Member added successfully', 
        'ticketNumber': next_ticket['nextTicket'],
        'memberName': user['name']
    }
    
    if group_full:
        response_data['groupActivated'] = True
        response_data['message'] += ' - Group is now full and has been activated!'
    
    return jsonify(response_data), 201

# Get all users for admin to add to groups
@app.route('/api/users', methods=['GET'])
@admin_required
def get_all_users(current_user_id, current_user_role):
    conn = get_db_connection()
    users = conn.execute('''
        SELECT userId, name, email, phoneNumber, role, createdAt
        FROM users
        WHERE role = 'member' AND createdBy = ?
        ORDER BY name
    ''', (current_user_id,)).fetchall()
    conn.close()
    
    return jsonify([dict(user) for user in users])

# Admin creates member
@app.route('/api/admin/members', methods=['POST'])
@admin_required
def create_member(current_user_id, current_user_role):
    data = request.get_json()
    
    # Hash password
    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    conn = get_db_connection()
    try:
        user_id = str(uuid.uuid4())
        conn.execute('''
            INSERT INTO users (userId, name, email, phoneNumber, address, passwordHash, role, createdBy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, data['name'], data['email'], data.get('phoneNumber'), 
              data.get('address'), password_hash.decode('utf-8'), 'member', current_user_id))
        conn.commit()
        
        return jsonify({
            'message': 'Member created successfully',
            'user': {
                'userId': user_id,
                'name': data['name'],
                'email': data['email'],
                'role': 'member'
            }
        }), 201
        
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Email already exists'}), 400
    except Exception as e:
        return jsonify({'message': 'Registration failed'}), 500
    finally:
        conn.close()

# Member Groups Route
@app.route('/api/members/<user_id>/groups', methods=['GET'])
@token_required
def get_member_groups(current_user_id, current_user_role, user_id):
    # Members can only see their own groups, admins can see any member's groups
    if current_user_role != 'admin' and current_user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    conn = get_db_connection()
    groups = conn.execute('''
        SELECT cg.*, gm.ticketNumber, gm.joinDate,
               u.name as foremanName,
               COUNT(a.auctionId) as completedAuctions,
               CASE WHEN EXISTS(
                   SELECT 1 FROM auctions a2 WHERE a2.groupId = cg.groupId AND a2.winnerId = ?
               ) THEN 1 ELSE 0 END as hasWonAuction
        FROM chitgroups cg
        JOIN groupmembers gm ON cg.groupId = gm.groupId
        JOIN users u ON cg.foremanId = u.userId
        LEFT JOIN auctions a ON cg.groupId = a.groupId
        WHERE gm.userId = ?
        GROUP BY cg.groupId, gm.membershipId
        ORDER BY gm.joinDate DESC
    ''', (user_id, user_id)).fetchall()
    conn.close()
    
    return jsonify([dict(group) for group in groups])

# Auctions Routes
@app.route('/api/chitgroups/<group_id>/auctions', methods=['GET'])
@token_required
def get_group_auctions(current_user_id, current_user_role, group_id):
    conn = get_db_connection()
    auctions = conn.execute('''
        SELECT a.*, u.name as winnerName
        FROM auctions a
        LEFT JOIN users u ON a.winnerId = u.userId
        WHERE a.groupId = ?
        ORDER BY a.auctionMonth DESC
    ''', (group_id,)).fetchall()
    conn.close()
    
    return jsonify([dict(auction) for auction in auctions])

@app.route('/api/chitgroups/<group_id>/auctions', methods=['POST'])
@admin_required
def create_auction(current_user_id, current_user_role, group_id):
    data = request.get_json()
    
    conn = get_db_connection()
    
    # Verify user is foreman of this group
    group = conn.execute(
        'SELECT * FROM chitgroups WHERE groupId = ? AND foremanId = ?',
        (group_id, current_user_id)
    ).fetchone()
    
    if not group:
        conn.close()
        return jsonify({'message': 'Unauthorized or group not found'}), 403
    
    # Calculate commission and dividend
    winning_bid = float(data['winningBidAmount'])
    commission = winning_bid * (group['commissionPercent'] / 100)
    dividend = (winning_bid - commission) / group['memberCount']
    net_installment = group['installmentAmount'] - dividend
    
    auction_id = str(uuid.uuid4())
    conn.execute('''
        INSERT INTO auctions (auctionId, groupId, auctionMonth, winningBidAmount,
                             winnerId, winnerName, foremanCommission, dividend, 
                             netInstallment, auctionDetails)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (auction_id, group_id, data['auctionMonth'], winning_bid,
          data.get('winnerId'), data.get('winnerName'), commission, dividend, 
          net_installment, data.get('auctionDetails', '')))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'message': 'Auction created successfully',
        'auctionId': auction_id,
        'dividend': dividend,
        'netInstallment': net_installment
    }), 201

@app.route('/api/chitgroups/<group_id>/activate', methods=['POST'])
@admin_required
def activate_chit_group(current_user_id, current_user_role, group_id):
    conn = get_db_connection()
    
    # Verify user is foreman of this group
    group = conn.execute(
        'SELECT * FROM chitgroups WHERE groupId = ? AND foremanId = ?',
        (group_id, current_user_id)
    ).fetchone()
    
    if not group:
        conn.close()
        return jsonify({'message': 'Unauthorized or group not found'}), 403
    
    # Check if group has enough members
    member_count = conn.execute(
        'SELECT COUNT(*) as count FROM groupmembers WHERE groupId = ?', (group_id,)
    ).fetchone()
    
    if member_count['count'] < group['memberCount']:
        conn.close()
        return jsonify({
            'message': f'Cannot activate group. Need {group["memberCount"]} members, currently have {member_count["count"]}'
        }), 400
    
    # Activate the group
    conn.execute('''
        UPDATE chitgroups SET status = 'Active' WHERE groupId = ?
    ''', (group_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Group activated successfully'})

@app.route('/api/chitgroups/<group_id>/deactivate', methods=['POST'])
@admin_required
def deactivate_chit_group(current_user_id, current_user_role, group_id):
    conn = get_db_connection()
    
    # Verify user is foreman of this group
    group = conn.execute(
        'SELECT * FROM chitgroups WHERE groupId = ? AND foremanId = ?',
        (group_id, current_user_id)
    ).fetchone()
    
    if not group:
        conn.close()
        return jsonify({'message': 'Unauthorized or group not found'}), 403
    
    # Deactivate the group
    conn.execute('''
        UPDATE chitgroups SET status = 'Pending' WHERE groupId = ?
    ''', (group_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Group deactivated successfully'})
# Member Dashboard Routes
@app.route('/api/member/dashboard', methods=['GET'])
@token_required
def member_dashboard(current_user_id, current_user_role):
    conn = get_db_connection()
    
    # Get user's groups
    groups = conn.execute('''
        SELECT cg.*, gm.ticketNumber, u.name as foremanName
        FROM chitgroups cg
        JOIN groupmembers gm ON cg.groupId = gm.groupId
        JOIN users u ON cg.foremanId = u.userId
        WHERE gm.userId = ?
        ORDER BY cg.createdAt DESC
    ''', (current_user_id,)).fetchall()
    
    dashboard_data = []
    for group in groups:
        # Get latest auction for this group
        latest_auction = conn.execute('''
            SELECT * FROM auctions 
            WHERE groupId = ? 
            ORDER BY auctionMonth DESC 
            LIMIT 1
        ''', (group['groupId'],)).fetchone()
        
        group_data = dict(group)
        group_data['latestAuction'] = dict(latest_auction) if latest_auction else None
        dashboard_data.append(group_data)
    
    conn.close()
    return jsonify(dashboard_data)

@app.route('/api/member/groups/<group_id>', methods=['GET'])
@token_required
def get_member_group_details(current_user_id, current_user_role, group_id):
    conn = get_db_connection()
    
    # Verify user is a member of this group
    membership = conn.execute('''
        SELECT gm.*, cg.*, u.name as foremanName
        FROM groupmembers gm
        JOIN chitgroups cg ON gm.groupId = cg.groupId
        JOIN users u ON cg.foremanId = u.userId
        WHERE gm.groupId = ? AND gm.userId = ?
    ''', (group_id, current_user_id)).fetchone()
    
    if not membership:
        conn.close()
        return jsonify({'message': 'Group not found or access denied'}), 404
    
    # Get all auctions for this group
    auctions = conn.execute('''
        SELECT a.*, u.name as winnerName
        FROM auctions a
        LEFT JOIN users u ON a.winnerId = u.userId
        WHERE a.groupId = ?
        ORDER BY a.auctionMonth DESC
    ''', (group_id,)).fetchall()
    
    conn.close()
    
    group_data = dict(membership)
    group_data['auctions'] = [dict(auction) for auction in auctions]
    
    return jsonify(group_data)

if __name__ == '__main__':
    init_db()
    migrate_db()
    app.run(debug=True, port=5001)