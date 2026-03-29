import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Home() {
    const [user, setUser] = useState(null);

    // Store the session in the react state
    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/me", {
          credentials: "include",
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("SESSION:", data);
            if (data.logged_in) {
              setUser(data.username);
            }
          })
          .catch(err => console.error(err));
      }, []);
    return (
        <div className="home-page">
            <nav className="navbar">
                <div className="logo">The Notes Specialist</div>

                <div className="nav-links">
                    {user ? (
                        <>
                        <span>Welcome, {user}</span>

                        <button
                            onClick={async () => {
                                await fetch("http://127.0.0.1:5000/api/logout", {
                                    method: "POST",
                                    credentials: "include",
                                });
                                setUser(null);
                            }}
                        >Logout</button>
                    </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Sign Up</Link>
                        </>
                    )}
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