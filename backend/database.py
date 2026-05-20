import sqlite3

connection = sqlite3.connect("database.db", check_same_thread=False) # Create a connection to the SQLite database (or create it if it doesn't exist)
cursor = connection.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
               face_embedding BLOB NOT NULL
               )
''')  # Create the 'users' table if it doesn't exist, with columns for id, username, password, and face_embedding


cursor.execute("""
CREATE TABLE IF NOT EXISTS notes (

    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) 

)
""") # Create the 'notes' table if it doesn't exist, with columns for id, note, user_id, and a foreign key constraint linking user_id to the id in the users table


connection.commit()

connection.close()

print("Database Connected and Table Created.")



