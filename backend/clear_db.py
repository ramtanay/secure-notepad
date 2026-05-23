from db import get_connection


def reset_database():
    """Delete all data and reset IDs while keeping schema"""

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Remove all data and reset auto increment IDs
        cursor.execute("""
            TRUNCATE TABLE notes, users
            RESTART IDENTITY CASCADE;
        """)

        conn.commit()
        conn.close()

        print("✅ Database reset successful!")
        print("✅ All data deleted")
        print("✅ IDs reset to beginning")
        print("✅ Table structure preserved")

    except Exception as e:
        print(f"❌ Database reset failed: {e}")


if __name__ == "__main__":
    reset_database()