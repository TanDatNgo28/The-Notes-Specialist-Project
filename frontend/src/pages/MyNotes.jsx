import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyNotes.css";

function MyNotes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyNotes = async () => {
            try {
                const res = await fetch("http://127.0.0.1:5000/api/my-notes", {
                    credentials: "include",
                });

                if (res.status === 401) {
                    setError("You must be logged in to view your notes.");
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setNotes(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load notes.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyNotes();
    }, []);

    if (loading) {
        return <p>Loading your notes...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="my-notes-page">
            <h1>My Notes</h1>

            {notes.length === 0 ? (
                <p>You have not uploaded any notes yet.</p>
            ) : (
                <div className="my-notes-list">
                    {notes.map((note) => (
                        <div key={note.nid} className="note-card">
                            <h3>{note.filename}</h3>
                            <p><strong>Course:</strong> {note.course_code || "Unknown course"}</p>
                            <p><strong>Chapter:</strong> {note.chapter_name || "No chapter"}</p>
                            <p><strong>Status:</strong> {note.status || "Unknown"}</p>
                            <p><strong>Uploaded:</strong> {note.date}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyNotes;