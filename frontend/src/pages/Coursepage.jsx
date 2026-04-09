import {useParams, useNavigate} from "react-router-dom";
import {useEffect, useState, useContext} from "react";
import {AuthContext} from "./AuthContext"; // For authentication state
import "./Coursepage.css"

function Coursepage() {
    const {cid} = useParams();
    const {user} = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [newChapter, setNewChapter] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/api/courses/${cid}`, { credentials: "include"})
            .then(res => res.json())
            .then(data => {if (data.success) setCourse(data.course);
            });
        
        fetchChapters();
    }, [cid]);

    const fetchChapters = () => {
        fetch(`http://127.0.0.1:5000/api/courses/${cid}/chapters`, { credentials: "include" })
        .then(res => res.json())
        .then(data => setChapters(data));
    };

    const addChapter = async (e) => {
        e.preventDefault();
        if (!newChapter.trim()) return alert("Chapter name cannot be empty");
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/courses/${cid}/add_chapter`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chapter_name: newChapter }),
            });

            const data = await res.json();
            if (data.success) {
                setNewChapter("");

                fetchChapters();
            }
            else alert(data.message);
        }
        catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="course-page">
            <nav className="course-navbar">
                <h1>{course ? course.course_code : "Loading..."}</h1>
            </nav>

            <div className="course-content">
                <h2>Chapters</h2>
                {chapters.length === 0 ? (
                    <p className="no-chapters">No chapter yet</p>
                ) : (
                    <ul className="chapter-list">
                        {chapters.map(ch => (
                            <li
                                key={ch.chid}
                                className="chapter-item"
                                onClick={() => navigate(`/chapters/${ch.chid}`)}
                            >
                                🗂️ {ch.chapter_name}
                            </li>
                        ))}
                    </ul>
                )}
                {user && (
                    <form className="add-chapter-form" onSubmit={addChapter}>
                        <input
                            type="text"
                            placeholder="New chapter name"
                            value={newChapter}
                            onChange={(e) => setNewChapter(e.target.value)}
                        />
                        <button type="submit">Add Chapter</button>
                    </form>
                )}
            </div>
        </div>
    );
}
// This line exports the Coursepage component as the default export of this module
// This allows other parts of the application to import and use the Coursepage component when needed
export default Coursepage;