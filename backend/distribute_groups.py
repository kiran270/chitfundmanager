#!/usr/bin/env python3
"""
Script to distribute existing groups among different admins for testing
This will assign existing groups to different admin accounts
"""

import sqlite3
import random
import os

DATABASE = os.path.join(os.path.dirname(__file__), 'chitfund.db')

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def get_all_admins():
    """Get all admin users"""
    conn = get_db_connection()
    admins = conn.execute('''
        SELECT userId, name, email FROM users 
        WHERE role = 'admin'
        ORDER BY name
    ''').fetchall()
    conn.close()
    return admins

def distribute_groups_to_admins(admin_ids):
    """Distribute existing groups among the admins"""
    conn = get_db_connection()
    
    # Get all groups
    groups = conn.execute('''
        SELECT groupId, groupName, foremanId FROM chitgroups
    ''').fetchall()
    
    if not groups:
        print("No groups found to distribute")
        conn.close()
        return
    
    print(f"Found {len(groups)} groups to distribute among {len(admin_ids)} admins")
    
    # Shuffle groups for random distribution
    group_list = list(groups)
    random.shuffle(group_list)
    
    # Distribute groups evenly among admins
    for i, group in enumerate(group_list):
        admin_id = admin_ids[i % len(admin_ids)]
        
        conn.execute('''
            UPDATE chitgroups SET foremanId = ? WHERE groupId = ?
        ''', (admin_id, group['groupId']))
        
        # Get admin name for logging
        admin = conn.execute('SELECT name FROM users WHERE userId = ?', (admin_id,)).fetchone()
        print(f"Assigned '{group['groupName']}' to {admin['name']}")
    
    conn.commit()
    conn.close()
    print(f"Successfully distributed {len(group_list)} groups")

def show_group_distribution():
    """Show the current distribution of groups per admin"""
    conn = get_db_connection()
    
    distribution = conn.execute('''
        SELECT 
            a.name as admin_name,
            a.email as admin_email,
            COUNT(g.groupId) as group_count,
            GROUP_CONCAT(g.groupName, ', ') as group_names
        FROM users a
        LEFT JOIN chitgroups g ON a.userId = g.foremanId
        WHERE a.role = 'admin'
        GROUP BY a.userId, a.name, a.email
        ORDER BY group_count DESC
    ''').fetchall()
    
    print("\n" + "="*80)
    print("GROUP DISTRIBUTION BY ADMIN")
    print("="*80)
    
    for row in distribution:
        print(f"{row['admin_name']:20} ({row['admin_email']:25}) - {row['group_count']:2} groups")
        if row['group_names']:
            # Wrap long group names
            group_names = row['group_names']
            if len(group_names) > 60:
                group_names = group_names[:57] + "..."
            print(f"{'':48} Groups: {group_names}")
        print()
    
    print("="*80)
    conn.close()

def main():
    print("🚀 Starting group distribution...")
    print("="*50)
    
    # Get all admins
    admins = get_all_admins()
    if not admins:
        print("❌ No admin users found!")
        return
    
    admin_ids = [admin['userId'] for admin in admins]
    print(f"\n👥 Found {len(admins)} admin accounts:")
    for admin in admins:
        print(f"   • {admin['name']} ({admin['email']})")
    
    # Distribute groups
    print(f"\n🔄 Distributing groups to admins...")
    distribute_groups_to_admins(admin_ids)
    
    # Show final distribution
    show_group_distribution()
    
    print("\n✅ Group distribution completed!")
    print("\n💡 Each admin will now see only their assigned groups!")
    print("\n🔑 Test with different admin accounts:")
    for admin in admins:
        print(f"   • {admin['email']} / admin123")

if __name__ == '__main__':
    main()