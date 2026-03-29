import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="home-page">
            <nav className="navbar">
                <div className="logo">The Notes Specialist</div>

                <div className="nav-links">
                    <Link to="/login" className="nav-btn login-btn">Login</Link>
                    <Link to="/signup" className="nav-btn signup-btn">Sign Up</Link>
                </div>
            </nav>

            <section className="hero-section">
                <h1>Learn better and together</h1>
                <p> Find top-rated study notes from students taking the same
                    courses as you.
                </p>
                
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search for notes by course, topic, or keyword"
                    />
                    <button>Search</button>
                </div>
            </section>
        </div>
    );
}
export default Home;