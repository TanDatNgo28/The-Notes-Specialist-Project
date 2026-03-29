from flask import Flask, request, jsonify, session
from flask_cors import CORS
# CORS is used to allow cross-origin requests from the frontend
import sqlite3
import os   # for file path handling

app = Flask(__name__)
app.secret_key = "verysecretkey"
CORS(app, supports_credentials=True)
# CORS(app) allows the frontend (which may be running on a different port) to make requests to this Flask backend without being blocked by the browser's same-origin policy.
# same origin policy: A security measure implemented by web browsers that restricts web pages from making requests to a different domain than the one that served the web page. This is done to prevent malicious websites from accessing sensitive data on other domains.

# os.path.join: This function is used to create a file path by joining different parts of the path together. It takes care of the correct path separators for the operating system being used (e.g., '/' for Unix-based systems and '\' for Windows). In this case, it constructs the path to the SQLite database file by joining the directory of the current file (__file__), moving up one level (..), and then into the "db" directory where the "notes.db" file is located.
DB_PATH = os.path.join(os.path.dirname(__file__), '..', "db", "notes.db")
# Function to get a database connection
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row # This allows us to access the columns of the database rows by name instead of by index, making our code more readable and easier to maintain.
    return conn


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json();
    # get_json() is a method provided by Flask that parses the incoming JSON data from the request body and returns it as a Python dictionary. This allows you to easily access the data sent by the client in a structured format.
    
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required."
        }), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE user_name = ? AND password = ?",
        (username, password)
    )

    # cursor.fetchone() retrieves the first row of the result set returned by the SQL query. If a matching user is found in the database, it will return a dictionary-like object containing the user's data. If no matching user is found, it will return None.
    user = cursor.fetchone()
    conn.close()

    if user:
        session["user_id"] = user["uid"]  # Store the user's ID in the session to keep them logged in across requests
        session["username"] = user["user_name"]  # Store the username in the session for easy access in future requests
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "username": user["user_name"]
        }), 200
    
    return jsonify({
        "success": False,
        "message": "Invalid username or password."
    }), 401


@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json();

    # Extract the username and password from the incoming JSON data
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required."
        }), 400

    # Establish a connection to the SQLite database
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if the username already exists in the database to prevent duplicate accounts. This is done by executing a SQL query that selects any user with the given username. If a user is found, we can return an error message indicating that the username is already taken.
    cursor.execute("SELECT * FROM users WHERE user_name = ?", (username,))
    existing_user = cursor.fetchone()

    if existing_user:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Username already exists. Please choose a different username."
        }), 409
    
    cursor.execute(
        "INSERT INTO users (user_name, password) VALUES (?, ?)",
        (username, password)
    )
    conn.commit()  # Commit the transaction to save the new user to the database
    conn.close()   # Close the database connection to free up resources

    return jsonify({
        "success": True,
        "message": "Signup successful"
    }), 201


# This route allows the frontend to check if the user is currently logged in by looking for the "user_id" in the session. If it exists, it returns a JSON response indicating that the user is logged in along with their username. If not, it returns a response indicating that the user is not logged in.
@app.route("/api/me" , methods=["GET"])
def get_current_user():
    if "user_id" in session:
        return jsonify({
            "logged_in": True,
            "username": session["username"]
        }), 200
    return jsonify({
        "logged_in": False
    }), 200

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()  # Clear the session to log the user out by removing all stored data, including the user_id and username.
    return jsonify({"message": "Logged out successfully."})

if __name__ == "__main__":
    app.run(debug=True)