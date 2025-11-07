#!/usr/bin/env python3
"""
Script to populate the database with dummy data for testing
Run this script to add 10-15 groups and 100-150 members with sample auctions
"""

import sqlite3
import uuid
import bcrypt
from datetime import datetime, date, timedelta
import random
import json

# Configuration
DATABASE = 'chitfund.db'

# Sample data
FIRST_NAMES = [
    'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Kavya', 'Arjun', 'Meera', 'Rohit', 'Anita',
    'Suresh', 'Lakshmi', 'Kiran', 'Deepa', 'Manoj', 'Sita', 'Ravi', 'Geetha', 'Anil', 'Radha',
    'Prakash', 'Usha', 'Santosh', 'Prema', 'Dinesh', 'Shanti', 'Ramesh', 'Kamala', 'Ashok', 'Vani',
    'Mohan', 'Saroja', 'Ganesh', 'Parvathi', 'Naresh', 'Sudha', 'Mahesh', 'Latha', 'Venkat', 'Padma',
    'Srinivas', 'Manjula', 'Kishore', 'Vasantha', 'Bhaskar', 'Sharada', 'Murali', 'Jayanti', 'Sunil', 'Rekha',
    'Chandran', 'Indira', 'Gopal', 'Savitha', 'Harish', 'Nirmala', 'Jagdish', 'Pushpa', 'Naveen', 'Shobha',
    'Raghav', 'Sumitra', 'Ajay', 'Malathi', 'Vinod', 'Bharathi', 'Sachin', 'Yamuna', 'Nitin', 'Saraswathi',
    'Deepak', 'Vijaya', 'Sanjay', 'Rukmini', 'Praveen', 'Gayathri', 'Rajiv', 'Shailaja', 'Arun', 'Vasudha',
    'Krishnan', 'Lalitha', 'Madhav', 'Sushma', 'Ramesh', 'Vidya', 'Sudhir', 'Kalpana', 'Raman', 'Sujatha',
    'Balaji', 'Revathi', 'Sagar', 'Nandini', 'Tarun', 'Swathi', 'Vivek', 'Pooja', 'Akash', 'Divya',
    'Karthik', 'Sneha', 'Rahul', 'Priyanka', 'Aryan', 'Shreya', 'Dev', 'Aarti', 'Rohan', 'Neha',
    'Varun', 'Ritu', 'Yash', 'Kavita', 'Nikhil', 'Seema', 'Abhay', 'Nisha', 'Gaurav', 'Riya',
    'Sameer', 'Tanya', 'Vishal', 'Megha', 'Ankit', 'Simran', 'Kunal', 'Payal', 'Harsh', 'Jyoti',
    'Manish', 'Komal', 'Pankaj', 'Sweta', 'Rohit', 'Isha', 'Siddharth', 'Aditi', 'Mayank', 'Richa'
]

LAST_NAMES = [
    'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Jain', 'Bansal', 'Mittal', 'Goel',
    'Shah', 'Mehta', 'Joshi', 'Verma', 'Agrawal', 'Saxena', 'Srivastava', 'Tiwari', 'Pandey', 'Mishra',
    'Rao', 'Reddy', 'Nair', 'Menon', 'Iyer', 'Krishnan', 'Subramanian', 'Venkatesh', 'Raman', 'Naidu',
    'Chandra', 'Bhat', 'Shetty', 'Kamath', 'Hegde', 'Kulkarni', 'Desai', 'Joshi', 'Patil', 'Shinde',
    'Ghosh', 'Chatterjee', 'Mukherjee', 'Banerjee', 'Roy', 'Das', 'Sen', 'Bose', 'Dutta', 'Chakraborty'
]

GROUP_NAMES = [
    'Prosperity Circle', 'Golden Future Fund', 'Unity Chit Group', 'Success Partners', 'Dream Achievers',
    'Fortune Builders', 'Wealth Creators', 'Victory Fund', 'Progress Circle', 'Elite Investors',
    'Prime Savers', 'Royal Fund', 'Diamond Group', 'Platinum Circle', 'Excellence Fund',
    'Champion Investors', 'Star Performers', 'Premium Savers', 'Elite Circle', 'Golden Opportunity'
]

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def create_admin_user():
    """Create an admin user for testing"""
    conn = get_db_connection()
    
    # Check if admin already exists
    existing_admin = conn.execute(
        'SELECT * FROM users WHERE email = ?', ('admin@chitfund.com',)
    ).fetchone()
    
    if existing_admin:
        print("Admin user already exists")
        admin_id = existing_admin['userId']
    else:
        # Create admin user
        password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
        admin_id = str(uuid.uuid4())
        
        conn.execute('''
            INSERT INTO users (userId, name, email, phoneNumber, address, passwordHash, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (admin_id, 'Admin User', 'admin@chitfund.com', '+91-9876543210', 
              'Admin Office, Mumbai', password_hash.decode('utf-8'), 'admin'))
        
        conn.commit()
        print("Created admin user: admin@chitfund.com / admin123")
    
    conn.close()
    return admin_id

def create_dummy_members(count=150):
    """Create dummy member users"""
    conn = get_db_connection()
    member_ids = []
    
    print(f"Creating {count} dummy members...")
    
    for i in range(count):
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        name = f"{first_name} {last_name}"
        email = f"{first_name.lower()}.{last_name.lower()}{i+1}@email.com"
        phone = f"+91-{random.randint(7000000000, 9999999999)}"
        
        # Generate address
        cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad']
        address = f"{random.randint(1, 999)} {random.choice(['MG Road', 'Park Street', 'Main Road', 'Gandhi Nagar'])}, {random.choice(cities)}"
        
        # Create password hash
        password_hash = bcrypt.hashpw('member123'.encode('utf-8'), bcrypt.gensalt())
        member_id = str(uuid.uuid4())
        
        try:
            conn.execute('''
                INSERT INTO users (userId, name, email, phoneNumber, address, passwordHash, role)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (member_id, name, email, phone, address, password_hash.decode('utf-8'), 'member'))
            
            member_ids.append(member_id)
            
            if (i + 1) % 20 == 0:
                print(f"Created {i + 1} members...")
                
        except sqlite3.IntegrityError:
            # Skip if email already exists
            continue
    
    conn.commit()
    conn.close()
    print(f"Successfully created {len(member_ids)} members")
    return member_ids

def create_dummy_groups(admin_id, member_ids, count=15):
    """Create dummy chit fund groups"""
    conn = get_db_connection()
    group_ids = []
    
    print(f"Creating {count} dummy groups...")
    
    for i in range(count):
        group_name = f"{random.choice(GROUP_NAMES)} {i+1}"
        
        # Random group parameters
        chit_values = [50000, 100000, 200000, 500000, 1000000, 2000000]
        chit_value = random.choice(chit_values)
        
        member_counts = [10, 15, 20, 25, 30]
        member_count = random.choice(member_counts)
        
        duration_months = random.choice([12, 18, 24, 30, 36])
        installment_amount = chit_value // duration_months
        commission_percent = random.choice([3.0, 4.0, 5.0, 6.0, 7.0])
        
        # Random start date in the past 6 months
        start_date = date.today() - timedelta(days=random.randint(30, 180))
        
        # Determine status based on start date
        status = 'Active' if random.random() > 0.3 else 'Pending'
        
        group_id = str(uuid.uuid4())
        
        conn.execute('''
            INSERT INTO chitgroups (groupId, groupName, chitValue, installmentAmount, 
                                   memberCount, durationMonths, commissionPercent, 
                                   startDate, status, foremanId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (group_id, group_name, chit_value, installment_amount, member_count, 
              duration_months, commission_percent, start_date, status, admin_id))
        
        group_ids.append({
            'groupId': group_id,
            'memberCount': member_count,
            'status': status,
            'durationMonths': duration_months,
            'chitValue': chit_value,
            'commissionPercent': commission_percent
        })
    
    conn.commit()
    conn.close()
    print(f"Successfully created {len(group_ids)} groups")
    return group_ids

def add_members_to_groups(groups, member_ids):
    """Add members to groups"""
    conn = get_db_connection()
    
    print("Adding members to groups...")
    
    for group in groups:
        group_id = group['groupId']
        required_members = group['memberCount']
        
        # Select random members for this group
        selected_members = random.sample(member_ids, min(required_members, len(member_ids)))
        
        for i, member_id in enumerate(selected_members):
            membership_id = str(uuid.uuid4())
            ticket_number = i + 1
            join_date = date.today() - timedelta(days=random.randint(1, 90))
            
            conn.execute('''
                INSERT INTO groupmembers (membershipId, groupId, userId, ticketNumber, joinDate)
                VALUES (?, ?, ?, ?, ?)
            ''', (membership_id, group_id, member_id, ticket_number, join_date))
    
    conn.commit()
    conn.close()
    print("Successfully added members to all groups")

def create_dummy_auctions(groups, member_ids):
    """Create dummy auctions for active groups"""
    conn = get_db_connection()
    
    print("Creating dummy auctions...")
    
    for group in groups:
        if group['status'] != 'Active':
            continue
            
        group_id = group['groupId']
        duration_months = group['durationMonths']
        chit_value = group['chitValue']
        commission_percent = group['commissionPercent']
        
        # Get members of this group
        group_members = conn.execute('''
            SELECT gm.userId, u.name, gm.ticketNumber
            FROM groupmembers gm
            JOIN users u ON gm.userId = u.userId
            WHERE gm.groupId = ?
        ''', (group_id,)).fetchall()
        
        if not group_members:
            continue
        
        # Create 2-5 random auctions for each active group
        num_auctions = random.randint(2, min(5, duration_months))
        
        for month in range(1, num_auctions + 1):
            # Random winning bid (10% to 80% of chit value)
            winning_bid = random.randint(int(chit_value * 0.1), int(chit_value * 0.8))
            
            # Calculate commission and dividend
            commission = winning_bid * (commission_percent / 100)
            dividend = (winning_bid - commission) / len(group_members)
            net_installment = (chit_value / duration_months) - dividend
            
            # Select random winner
            winner = random.choice(group_members)
            
            # Random auction date in the past
            auction_date = datetime.now() - timedelta(days=random.randint(30, 150))
            
            auction_details = [
                "Regular monthly auction conducted successfully",
                "Competitive bidding with multiple participants",
                "Auction completed with fair bidding process",
                "Winner selected through transparent bidding",
                "Monthly auction as per schedule"
            ]
            
            auction_id = str(uuid.uuid4())
            
            conn.execute('''
                INSERT INTO auctions (auctionId, groupId, auctionDate, auctionMonth, 
                                     winningBidAmount, winnerId, winnerName, foremanCommission, 
                                     dividend, netInstallment, auctionDetails)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (auction_id, group_id, auction_date, month, winning_bid, 
                  winner['userId'], winner['name'], commission, dividend, 
                  net_installment, random.choice(auction_details)))
    
    conn.commit()
    conn.close()
    print("Successfully created dummy auctions")

def main():
    """Main function to populate all dummy data"""
    print("🚀 Starting dummy data population...")
    print("=" * 50)
    
    # Create admin user
    admin_id = create_admin_user()
    
    # Create dummy members
    member_ids = create_dummy_members(150)
    
    # Create dummy groups
    groups = create_dummy_groups(admin_id, member_ids, 15)
    
    # Add members to groups
    add_members_to_groups(groups, member_ids)
    
    # Create dummy auctions
    create_dummy_auctions(groups, member_ids)
    
    print("=" * 50)
    print("✅ Dummy data population completed!")
    print("\n📊 Summary:")
    print(f"   • 1 Admin user created")
    print(f"   • {len(member_ids)} Member users created")
    print(f"   • {len(groups)} Chit fund groups created")
    print(f"   • Members assigned to all groups")
    print(f"   • Sample auctions created for active groups")
    
    print("\n🔐 Login Credentials:")
    print("   Admin: admin@chitfund.com / admin123")
    print("   Members: [firstname].[lastname][number]@email.com / member123")
    print("   Example: rajesh.sharma1@email.com / member123")
    
    print("\n🌐 Access URLs:")
    print("   Frontend: http://localhost:3000")
    print("   Admin Dashboard: http://localhost:3000/admin/dashboard")
    print("   Member Dashboard: http://localhost:3000/member/dashboard")

if __name__ == "__main__":
    main()