import {Link, useNavigate} from "react-router-dom";
import {useState, useContext} from "react";
import {AuthContext} from "./AuthContext"; // For authetication state

function Home() {
    const { user, setUser } = useContext(AuthContext);
    const [query, setQuery] = useState("");
    const [result, setResults] = useState([]);
    const [newCourse, setNewCourse] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();

    // Search function
    const search = async () => {
        if (!query.trim()) return;

        setHasSearched(true);
        try {
            // Use encodeURIComponent to encode course code to attach to the URL
            const res = await fetch(`http://127.0.0.1:5000/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();

            setResults(data);
        }
        catch (err) {
            console.error(err);
        }
    }

    // Log out function
    const logout = async () => {
        try {
            await fetch("http://127.0.0.1:5000/api/logout", {
            method: "POST",
            credentials: "include",
            });
            setUser(null);
            navigate("/");
        }

        catch (err) {
            console.error(err);
        }
    };

    // Add course function
    const addCourse = async (e) => {
        e.preventDefault();
        if (!newCourse.trim()) return alert("Course code cannot be empty");
        try {
            const res = await fetch("http://127.0.0.1:5000/api/add_course", {
                method: "POST",
                credentials: "include",
                headers : { "Content-Type": "application/json" },
                body: JSON.stringify({course_code: newCourse}),
            });
            const data = await res.json();
            if (data.success) {
                alert("Course added");
                navigate(`/courses/${data.cid}`);
            }
            else alert(data.message);
        }
        catch (err) {
            console.error("Error when adding course:", err);
        }
    };
    
    return (
        <div className="home-page">
            <nav className="navbar">
                <div className="logo">The Notes Specialist</div>
                <div className="nav-links">
                    {user ? (
                        <>
                        <span style={{fontSize:"18px", color:"#333"}}>Welcome, {user.username}</span>
                        <button className= "nav-btn" onClick={logout}>Log Out</button>
                        </>
                    ) : (
                        <>
                            <Link className="nav-link" to="/login">Log In</Link>
                            <Link className="nav-link" to="/signup">Sign Up</Link>
                        </>
                    )}
                </div>
            </nav>

            <section className="hero-section">
                <h1>Learn better and together</h1>
                <p> Find top-rated study notes from students taking the same courses as you</p>
                <div className="container">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search for notes by course code (e.g. CSCB20)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            // Allow users hit enter to search
                            onKeyDown={(e) => e.key === "Enter" && search()}
                        />
                        <button onClick={search}>Search</button>
                    </div>
                    {!user && 
                        (<p>Log in to add a new course and contribute your notes</p>
                    )}
                    {user && (
                        <div className="add-course">
                            <p>OR</p>
                            <p>Add a new course to share your notes</p>
                            <form onSubmit={addCourse}>
                                <input
                                    type="text"
                                    placeholder="Enter course code (e.g. CSCA48)"
                                    value={newCourse}
                                    onChange={(e) => setNewCourse(e.target.value)}
                                />
                                <button type="submit">Add Course</button>
                            </form>
                        </div>
                    )}
                </div>
                <div className="search-results">
                    {result.length > 0 ? (
                        result.map(course => (
                        <div
                            key={course.cid}
                            className="course-result"
                            onClick={() => navigate(`/courses/${course.cid}`)}
                            style={{cursor:"pointer", marginTop:"10px"}}
                        >
                            🗂️ {course.course_code}
                        </div>
                        ))
                    ) : (hasSearched && <p>No Result Found. Try again</p>
                    )}
                </div>
            </section>
        </div>
    );
}
// This line exports the Home component as the default export of this module
// This allows other parts of the application to import and use the Home component when needed
export default Home;