import os
import psycopg2
from dotenv import load_dotenv
from utils.config import DATABASE_URL

# Load environment variables
load_dotenv()

def get_connection():
    """Get database connection using DATABASE_URL from Render"""
    database_url = DATABASE_URL
    
    if not database_url:
        raise Exception("DATABASE_URL not found in environment variables!")
    
    return psycopg2.connect(database_url, sslmode='require')

def add_column_if_not_exists(cursor, table, column, column_type, default=None):
    """Safely add a column if it doesn't exist"""
    try:
        # Check if column exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = %s AND column_name = %s
        """, (table, column))
        
        if not cursor.fetchone():
            # Column doesn't exist, add it
            sql = f"ALTER TABLE {table} ADD COLUMN {column} {column_type}"
            if default:
                sql += f" DEFAULT {default}"
            cursor.execute(sql)
            print(f"✅ Added {column} column to {table} table")
            return True
        else:
            print(f"✅ {column} column already exists in {table} table")
            return False
    except Exception as e:
        print(f"⚠️ Could not add {column} column: {e}")
        return False

def setup_database():
    """Setup database tables on Render PostgreSQL"""
    
    print("🔧 Setting up database schema on Render...")
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        print("✅ Connected to Render PostgreSQL")
        
        # Create users table if not exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                face_embedding BYTEA NOT NULL
            )
        """)
        print("✅ Users table ready")
        
        # Create notes table if not exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notes (
                id SERIAL PRIMARY KEY,
                note TEXT NOT NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        print("✅ Notes table ready")
        
        # Safely add columns
        add_column_if_not_exists(cursor, "notes", "created_at", "TIMESTAMP", "CURRENT_TIMESTAMP")
        add_column_if_not_exists(cursor, "notes", "title", "VARCHAR(255)", "'Untitled'")
        
        # Update any NULL titles to 'Untitled'
        cursor.execute("""
            UPDATE notes 
            SET title = 'Untitled' 
            WHERE title IS NULL
        """)
        updated_count = cursor.rowcount
        if updated_count > 0:
            print(f"📝 Updated {updated_count} notes with default title")
        
        # Create indexes
        indexes = [
            ("idx_notes_user_id", "notes", "user_id"),
            ("idx_notes_created_at", "notes", "created_at"),
            ("idx_notes_title", "notes", "title")
        ]
        
        for index_name, table, column in indexes:
            try:
                cursor.execute(f"""
                    CREATE INDEX IF NOT EXISTS {index_name} ON {table}({column})
                """)
                print(f"✅ Created index: {index_name}")
            except Exception as e:
                print(f"⚠️ Could not create index {index_name}: {e}")
        
        # Show statistics
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM notes")
        note_count = cursor.fetchone()[0]
        
        print(f"\n📊 Current Database Stats:")
        print(f"  - Users: {user_count}")
        print(f"  - Notes: {note_count}")
        
        # List all tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        
        tables = cursor.fetchall()
        print(f"\n📋 Tables in database:")
        for table in tables:
            # Get row count for each table
            cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
            count = cursor.fetchone()[0]
            print(f"  - {table[0]}: {count} rows")
        
        # Show notes table structure
        cursor.execute("""
            SELECT column_name, data_type, is_nullable, 
                   COALESCE(column_default, 'No default') as default_value
            FROM information_schema.columns
            WHERE table_name = 'notes'
            ORDER BY ordinal_position
        """)
        
        columns = cursor.fetchall()
        print(f"\n📋 Notes table structure:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]} (nullable: {col[2]}, default: {col[3]})")
        
        conn.commit()
        conn.close()
        
        print("\n✅ Database setup complete on Render!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        print("\nTroubleshooting tips:")
        print("1. Check if DATABASE_URL is correct in .env file")
        print("2. Verify the Render database is active")
        print("3. Check if the database allows external connections")

if __name__ == "__main__":
    setup_database()