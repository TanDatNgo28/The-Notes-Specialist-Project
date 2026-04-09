import {useState, useContext} from "react";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "./AuthContext"; // For authentication state
import "./Signup.css";

function Signup() {
    const {setUser} = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // The handleSignup function is called when the user submits the signup form
    async function handleSignup(e) {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:5000/api/signup", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username, password}),
            });
            const data = await response.json();
            console.log(data.message);
            alert(data.message);

            if (data.success) {
                setUser({ username });
                navigate("/");
            }
        } 
        catch (error) {
            console.error("Signup error:", error);
        }
    };

    return (
        <div className="signup-container">
            <h1 className="signup-form h1">Sign Up</h1>
            <form className="signup-form" onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <br /><br />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br /><br />
                <button className="signup-form button" type="submit">Create Account</button>
            </form>
        </div>
    );
}
// This line exports the Signup component as the default export of this module
// This allows other parts of the application to import and use the Signup component when needed
export default Signup;