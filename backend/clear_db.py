from db import get_connection

def clear_database():
    """Clear all users and notes (run after switching to Facenet)"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM notes;")
        cursor.execute("DELETE FROM users;")
        
        conn.commit()
        print("✅ Database cleared successfully!")
        print("   All users and notes have been deleted.")
        print("   Users must re-register with the new face recognition system.")
        
        conn.close()
    except Exception as e:
        print(f"❌ Error clearing database: {e}")

if __name__ == "__main__":
    clear_database()