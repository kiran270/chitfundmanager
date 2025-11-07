#!/usr/bin/env python3
"""
Script to distribute existing members among different admins for testing
This will create additional admin accounts and assign existing members to them
"""

import sqlite3
import uuid
import bcrypt
import random
import os
DATABASE = os.path.join(os.path.dirname(__file__), 'chitfund.db')

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def create_additional_admins():
    """Create additional admin accounts for testing"""
    conn = get_db_connection()
    
    admins = [
        {
            'name': 'Admin Manager',
            'email': 'manager@chitfund.com',
            'password': 'admin123',
            'phone': '+91-9876543211'
        },
        {
            'name': 'Admin Supervisor',
            'email': 'supervisor@chitfund.com', 
            'password': 'admin123',
            'phone': '+91-9876543212'
        },
        {
            'name': 'Admin Director',
            'email': 'director@chitfund.com',
            'password': 'admin123', 
            'phone': '+91-9876543213'
        }
    ]
    
    created_admins = []
    
    for admin_data in admins:
        # Check if admin already exists
        existing = conn.execute(
            'SELECT * FROM users WHERE email = ?', (admin_data['email'],)
        ).fetchone()
        
        if existing:
            print(f"Admin {admin_data['email']} already exists")
            created_admins.append(existing['userId'])
            continue
            
        # Create new admin
        password_hash = bcrypt.hashpw(admin_data['password'].encode('utf-8'), bcrypt.gensalt())
        admin_id = str(uuid.uuid4())
        
        conn.execute('''
            INSERT INTO users (userId, name, email, phoneNumber, passwordHash, role)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (admin_id, admin_data['name'], admin_data['email'], 
              admin_data['phone'], password_hash.decode('utf-8'), 'admin'))
        
        created_admins.append(admin_id)
        print(f"Created admin: {admin_data['email']} / {admin_data['password']}")
    
    conn.commit()
    conn.close()
    return created_admins

def get_existing_admin():
    """Get the existing main admin"""
    conn = get_db_connection()
    admin = conn.execute(
        'SELECT * FROM users WHERE email = ?', ('admin@chitfund.com',)
    ).fetchone()
    conn.close()
    return admin['userId'] if admin else None

def distribute_members_to_admins(admin_ids):
    """Distribute existing members among the admins"""
    conn = get_db_connection()
    
    # Get all members that don't have a createdBy value
    members = conn.execute('''
        SELECT userId, name, email FROM users 
        WHERE role = 'member' AND (createdBy IS NULL OR createdBy = '')
    ''').fetchall()
    
    if not members:
        print("No members found to distribute")
        conn.close()
        return
    
    print(f"Found {len(members)} members to distribute among {len(admin_ids)} admins")
    
    # Shuffle members for random distribution
    member_list = list(members)
    random.shuffle(member_list)
    
    # Distribute members evenly among admins
    for i, member in enumerate(member_list):
        admin_id = admin_ids[i % len(admin_ids)]
        
        conn.execute('''
            UPDATE users SET createdBy = ? WHERE userId = ?
        ''', (admin_id, member['userId']))
        
        # Get admin name for logging
        admin = conn.execute('SELECT name FROM users WHERE userId = ?', (admin_id,)).fetchone()
        print(f"Assigned {member['name']} ({member['email']}) to {admin['name']}")
    
    conn.commit()
    conn.close()
    print(f"Successfully distributed {len(member_list)} members")

def show_distribution():
    """Show the current distribution of members per admin"""
    conn = get_db_connection()
    
    distribution = conn.execute('''
        SELECT 
            a.name as admin_name,
            a.email as admin_email,
            COUNT(m.userId) as member_count
        FROM users a
        LEFT JOIN users m ON a.userId = m.createdBy AND m.role = 'member'
        WHERE a.role = 'admin'
        GROUP BY a.userId, a.name, a.email
        ORDER BY member_count DESC
    ''').fetchall()
    
    print("\n" + "="*60)
    print("MEMBER DISTRIBUTION BY ADMIN")
    print("="*60)
    
    for row in distribution:
        print(f"{row['admin_name']:20} ({row['admin_email']:25}) - {row['member_count']:3} members")
    
    print("="*60)
    conn.close()

def main():
    print("🚀 Starting member distribution...")
    print("="*50)
    
    # Get existing main admin
    main_admin_id = get_existing_admin()
    if not main_admin_id:
        print("❌ Main admin not found! Please ensure admin@chitfund.com exists")
        return
    
    # Create additional admins
    print("\n📝 Creating additional admin accounts...")
    additional_admins = create_additional_admins()
    
    # Combine all admin IDs
    all_admin_ids = [main_admin_id] + additional_admins
    print(f"\n👥 Total admins available: {len(all_admin_ids)}")
    
    # Distribute members
    print("\n🔄 Distributing members to admins...")
    distribute_members_to_admins(all_admin_ids)
    
    # Show final distribution
    show_distribution()
    
    print("\n✅ Member distribution completed!")
    print("\n🔑 Admin Login Credentials:")
    print("   • admin@chitfund.com / admin123 (Main Admin)")
    print("   • manager@chitfund.com / admin123")
    print("   • supervisor@chitfund.com / admin123") 
    print("   • director@chitfund.com / admin123")
    print("\n💡 Each admin will now see only their assigned members!")

if __name__ == '__main__':
    main()