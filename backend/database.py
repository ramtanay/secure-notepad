from db import get_connection


conn = get_connection()

cursor = conn.cursor()


# =========================================
# USERS TABLE
# =========================================

cursor.execute("""

CREATE TABLE IF NOT EXISTS users (

    id SERIAL PRIMARY KEY,

    username TEXT UNIQUE NOT NULL,

    password TEXT NOT NULL,

    face_embedding BYTEA NOT NULL

)

""")


# =========================================
# NOTES TABLE
# =========================================

cursor.execute("""

CREATE TABLE IF NOT EXISTS notes (

    id SERIAL PRIMARY KEY,

    note TEXT NOT NULL,

    user_id INTEGER NOT NULL,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

)

""")


conn.commit()

conn.close()

print("PostgreSQL Database Connected and Tables Created.")