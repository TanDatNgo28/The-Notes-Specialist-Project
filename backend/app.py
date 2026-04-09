from flask import Flask, request, jsonify, session
from flask_cors import CORS # CORS is used to allow cross-origin requests from the frontend
from flask_session import Session
from flask import send_file # For sending file to download
import sqlite3 # For database
import os   # For file path handling
import io # For downloading file

app = Flask(__name__)
app.secret_key = "verysecretkey"
# Session
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False
app.config["SESSION_COOKIE_HTTPONLY"] = True
Session(app)
# CORS(app) allows the frontend (which may be running on a different port) to make requests to this Flask backend without being blocked by the browser's same-origin policy
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "http://127.0.0.1:5173"}})

# os.path.join: This function is used to create a file path by joining different parts of the path together
# It takes care of the correct path separators for the operating system being used (e.g., '/' for Unix-based systems and '\' for Windows)
DB_PATH = os.path.join(os.path.dirname(__file__), '..', "db", "notes.db")
# Function to get a database connection
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    # This allows access to the columns of the database rows by name instead of by index
    conn.row_factory = sqlite3.Row

    return conn

# This route allows the user to log in
@app.route("/api/login", methods=["POST"])
def login():
    # get_json() is a method provided by Flask that parses the incoming JSON data from the request body and returns it as a Python dictionary
    # This allows easy access to the data sent by the client in a structured format
    data = request.get_json();
    username = data.get("username")
    password = data.get("password")

    # Validate username and password
    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required."
        }), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query the database to verify username and password
    cursor.execute(
        "SELECT * FROM users WHERE user_name = ? AND password = ?",
        (username, password)
    )

    user = cursor.fetchone()
    conn.close()

    # User is found, store user info in the session
    if user:
        session["user_id"] = user["uid"]  # Store the user's ID in the session
        session["username"] = user["user_name"]  # Store the username in the session
        # For debugging
        print("SESSION AFTER LOGIN:", dict(session))
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "username": user["user_name"]
        }), 200
    
    return jsonify({
        "success": False,
        "message": "Invalid username or password."
    }), 401

# This route allows the user to sign up
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json();

    # Extract the username and password from the incoming JSON data
    username = data.get("username")
    password = data.get("password")

    # Validate username and password
    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required."
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if the username already exists in the database to prevent duplicate accounts
    cursor.execute("SELECT * FROM users WHERE user_name = ?", (username,))
    existing_user = cursor.fetchone()

    if existing_user:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Username already exists. Please choose a different username."
        }), 409
    # Insert new username and password to the database
    cursor.execute(
        "INSERT INTO users (user_name, password) VALUES (?, ?)",
        (username, password)
    )
    conn.commit()  # Commit the transaction to save the new user to the database
    conn.close()

    return jsonify({
        "success": True,
        "message": "Signup successful"
    }), 201


# This route allows the frontend to check if the user is currently logged in
@app.route("/api/me" , methods=["GET"])
def get_current_user():
    # Check if user_id is already stored in session
    if "user_id" in session:
        return jsonify({
            "logged_in": True,
            "username": session["username"]
        }), 200
    
    return jsonify({
        "logged_in": False
    }), 200

# This route allows the user to log out
@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()  # Clear the session to log the user out by removing all stored data, including the user_id and username.
    return jsonify({"message": "Logged out successfully."})

# This route allows the frontend to check the input course code from the search bar
@app.route("/api/search")
def search():
    query = request.args.get("q")
    if not query:
        return jsonify([])
    
    conn = get_db_connection()
    course = conn.execute(
        "SELECT * FROM courses WHERE course_code LIKE ?",
        ('%' + query + '%',)
    ).fetchall()
    conn.close()
    
    return [dict(row) for row in course]

# This route allows the user to add a new course
@app.route("/api/add_course", methods=["POST"])
def add_course():
    data = request.get_json()
    course_code = data.get("course_code")
    username = session.get("username")
    # For debugging
    print("SESSION:", dict(session))
    print("USERNAME:", username)
    print("COURSE CODE:", course_code)

    # Check if the user is logged in. Only logged-in users are allowed to add courses
    if not username:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    # Validate course_code
    if not course_code:
        return jsonify({"success": False, "message": "Course code required. E.g. CSCB63"}), 400
    
    # Lookup user
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute (
        "SELECT uid FROM users WHERE user_name = ?",
        (username,)
    )
    user = cur.fetchone()
    if not user:
        conn.close()
        return jsonify({"success": False, "message": "User not found"}), 404
    uid = user["uid"]

    # Check if course already exists
    cur.execute(
        "SELECT cid FROM courses WHERE course_code = ?",
        (course_code,) 
    )
    course = cur.fetchone()
    if course:
        conn.close()
        return jsonify({"success": False, "message": "Course already exists"}), 400
    
    # Insert new course
    cur.execute(
        "INSERT INTO courses (course_code, creator) VALUES (?,?)",
        (course_code, uid)
    )
    conn.commit()
    cid = cur.lastrowid
    conn.close()

    return jsonify({"success": True, "cid": cid, "message": "Course added successfully!"})

# This route gets the course info
@app.route("/api/courses/<int:cid>")
def get_courses(cid):
    conn = get_db_connection()
    course = conn.execute("SELECT * FROM courses WHERE cid = ?", (cid,)).fetchone()
    conn.close()
    # Validate if the course with cid is in the database
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404
    
    return jsonify({"success": True, "course":dict(course)})

# This route gets all chapters for a course
@app.route("/api/courses/<int:cid>/chapters")
def get_chapters(cid):
    conn = get_db_connection()
    chapters = conn.execute("SELECT * FROM chapters WHERE cid = ?", (cid,)).fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in chapters])

# This route adds a chapter to a course
@app.route("/api/courses/<int:cid>/add_chapter", methods=["POST"])
def add_chapter(cid):
    username = session.get("username")
    # Check if the user is logged in
    if not username:
        return jsonify({"success": False, "message":"Not logged in"}), 401
    data = request.get_json()
    chapter_name = data.get("chapter_name")
    # Validate chapter_name
    if not chapter_name:
        return jsonify({"success": False, "message": "Chapter name required"}), 400
    
    conn=get_db_connection()
    try:
        conn.execute("INSERT INTO chapters (cid, chapter_name) VALUES (?, ?)", (cid, chapter_name))
        conn.commit()
        chid = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        return jsonify({"success": True, "chid":chid, "message": "Chapter added"})
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"success": False, "message": "Chapter already exists"}), 400

# This routes gets the chapter info
@app.route("/api/chapters/<int:chid>")
def get_chapter(chid):
    conn = get_db_connection()
    chapter = conn.execute("SELECT * FROM chapters WHERE chid =?", (chid,)).fetchone()
    conn.close()
    # Check if the chapter with chid exists
    if not chapter:
        return jsonify({"success": False, "message": "Chapter not found"}), 404
    return jsonify({"success": True, "chapter": dict(chapter)})

# This route gets the notes for a chapter
@app.route("/api/chapters/<int:chid>/notes")
def get_notes(chid):
    conn = get_db_connection()
    notes = conn.execute("SELECT nid, filename, size, status, date FROM notes WHERE chid = ?", (chid,)).fetchall()
    conn.close()

    return jsonify([dict(row) for row in notes])

# This route allows the user to upload the notes as PDF file
@app.route("/api/chapters/<int:chid>/upload", methods=["POST"])
def upload(chid):
    username = session.get("username")
    # Check if the user is logged in
    if not username:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    # Check if there is a file attached
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file provided"}), 400
    file = request.files["file"]
    # Validate the format of the file. Onlt PDF files allowed
    if file.mimetype != "application/pdf":
        return jsonify({"success": False, "message": "Only PDF format is allowed"}), 400
    
    data = file.read()
    size = len(data)

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT uid FROM users where user_name = ?", (username,))
    user = cur.fetchone()
    # Retrieve uid of the user
    if user:
        uid = user["uid"]
    else: None

    cur.execute("INSERT INTO notes (chid, filename, mimetype, size, data, creator) VALUES (?, ?, ?, ?, ?, ?)",
                (chid, file.filename, file.mimetype, size, data, uid)
    )

    conn.commit()
    nid = cur.lastrowid
    conn.close()

    return jsonify({"success": True, "nid": nid, "message": "Notes uploaded"})

# This route allows the user to download the notes as a PDF files
@app.route("/api/notes/<int:nid>/download")
def download(nid):
    conn = get_db_connection()
    note = conn.execute("SELECT * FROM notes WHERE nid = ?", (nid,)).fetchone()
    conn.close()
    # Check if node with nid exists
    if not note:
        return jsonify({"success": False, "message": "Note not found"}), 404
    # Send the PDF file to the user to download
    return send_file(
        io.BytesIO(note["data"]),
        mimetype = "application/pdf",
        as_attachment = True,
        download_name = note["filename"]
    )

if __name__ == "__main__":
    app.run(debug=True)