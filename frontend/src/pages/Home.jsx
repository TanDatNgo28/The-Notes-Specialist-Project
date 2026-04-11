import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import Navbar from "./Navbar";
import "./Home.css";

function Home() {
    const { user, setUser } = useContext(AuthContext);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [newCourse, setNewCourse] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            const trimmed = query.trim();

            if (!trimmed) {
                setResults([]);
                setHasSearched(false);
                return;
            }

            setHasSearched(true);

            try {
                const res = await fetch(
                    `http://127.0.0.1:5000/api/search?q=${encodeURIComponent(trimmed)}`
                );
                const data = await res.json();
                setResults(data);
            } catch (err) {
                console.error("Search failed:", err);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const search = async () => {
        const trimmed = query.trim();

        if (!trimmed) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setHasSearched(true);

        try {
            const res = await fetch(
                `http://127.0.0.1:5000/api/search?q=${encodeURIComponent(trimmed)}`
            );
            const data = await res.json();
            setResults(data);
        } catch (err) {
            console.error(err);
        }
    };

    const logout = async () => {
        try {
            await fetch("http://127.0.0.1:5000/api/logout", {
                method: "POST",
                credentials: "include",
            });
            setUser(null);
            navigate("/");
        } catch (err) {
            console.error(err);
        }
    };

    const addCourse = async (e) => {
        e.preventDefault();

        if (!newCourse.trim()) {
            alert("Course code cannot be empty");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:5000/api/add_course", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ course_code: newCourse.trim() }),
            });

            const data = await res.json();

            if (data.success) {
                alert("Course added");
                navigate(`/courses/${data.cid}`);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error("Error when adding course:", err);
        }
    };

    return (
        <div className="app-background">
            <div className="home-overlay">
                <Navbar />

                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">Learn better and together</h1>
                        <p className="hero-subtitle">
                            Find top-rated study notes from students taking the same courses as you
                        </p>
                        {user && (
                        <p className="welcome-message">
                            Welcome back, {user.username}!
                        </p>
                        )}
                        <div className="search-panel">
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Search by course code (e.g. CSCB20)"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && search()}
                                />
                                <button onClick={search}>Search</button>
                            </div>

                            <div className="search-results">
                                {results.length > 0 ? (
                                    results.map((course) => (
                                        <div
                                            key={course.cid}
                                            className="course-result-card"
                                            onClick={() => navigate(`/courses/${course.cid}`)}
                                        >
                                            <div className="course-icon">🗂️</div>
                                            <div className="course-info">
                                                <h3>{course.course_code}</h3>
                                                <p>Open course notes</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    hasSearched && (
                                        <p className="empty-results">
                                            No results found. Try another course code.
                                        </p>
                                    )
                                )}
                            </div>
                        </div>

                        {user ? (
                            <div className="add-course-card">
                                <h2>Add a new course</h2>
                                <p>Share your notes and help other students learn faster.</p>

                                <form className="add-course-form" onSubmit={addCourse}>
                                    <input
                                        type="text"
                                        placeholder="Enter course code (e.g. CSCA48)"
                                        value={newCourse}
                                        onChange={(e) => setNewCourse(e.target.value)}
                                    />
                                    <button type="submit">Add Course</button>
                                </form>
                            </div>
                        ) : (
                            <div className="guest-message">
                                <p>Log in to add a new course and contribute your notes.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Home;