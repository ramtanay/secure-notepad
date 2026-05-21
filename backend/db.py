import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
from utils.config import DATABASE_URL

def get_connection():
    """Get database connection - ONLY use Render PostgreSQL"""
    
    # Get DATABASE_URL from environment
    database_url = DATABASE_URL
    
    if not database_url:
        raise Exception(
            "❌ DATABASE_URL not found in .env file!\n"
            "Please add: DATABASE_URL=postgresql://..."
        )
    
    try:
        print("📡 Connecting to Render PostgreSQL...")
        conn = psycopg2.connect(
            database_url,
            sslmode='require',
            connect_timeout=30
        )
        print("✅ Connected to Render PostgreSQL successfully!")
        return conn
        
    except Exception as e:
        print(f"❌ Failed to connect to Render PostgreSQL: {e}")
        raise

# Test connection immediately
if __name__ == "__main__":
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Database version: {version[0][:50]}...")
        conn.close()
    except Exception as e:
        print(f"❌ Connection test failed: {e}")