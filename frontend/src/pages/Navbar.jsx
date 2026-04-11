import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

function Navbar() {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const logout = async () => {
        try {
            await fetch("http://127.0.0.1:5000/api/logout", {
                method: "POST",
                credentials: "include",
            });

            setUser(null);
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <nav className="navbar">
            <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                The Notes Specialist
            </div>

            <div className="nav-links">
                {user ? (
                    <>
                        <span className="nav-welcome">Welcome, {user.username}</span>

                        <button
                            className="nav-btn"
                            onClick={() => navigate("/my-notes")}
                        >
                            My Notes
                        </button>

                        <button className="nav-btn" onClick={logout}>
                            Log Out
                        </button>
                    </>
                ) : (
                    <>
                        <Link className="nav-link" to="/login">Log In</Link>
                        <Link className="nav-link" to="/signup">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;