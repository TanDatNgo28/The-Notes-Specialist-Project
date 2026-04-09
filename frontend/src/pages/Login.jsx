import {useState, useContext} from "react";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "./AuthContext"; // For authentication state
import "./Login.css";

function Login() {
    const [username, setUsername] = useState("");
    // What this does is it creates a state variable called email and a function called setEmail that we can use to update the value of email. The initial value of email is an empty string
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const {setUser} = useContext(AuthContext);

    async function handleLogin(e) {
        // The handleLogin function is called when the user submits the login form
        e.preventDefault();
        // Default behavior of form submission is to reload the page, which we don't want in a single-page application like this
        // By calling e.preventDefault(), we can prevent that from happening and instead handle the login logic in our JavaScript code
        try {
            const response = await fetch("http://127.0.0.1:5000/api/login", {
                method: "POST",
                credentials: "include",
                headers: {"Content-Type": "application/json",
                },
                body: JSON.stringify({username, password}),
            });
            const data = await response.json();
            console.log(data)
            alert(data.message);

            if (data.success) {
                setUser({ username });
                navigate("/");
            }
        }
        catch (error) {
            console.error("Login error:", error);
        }
    }; 

    return (
        <div className="login-container">
            <h1 className="login-form h1">Log In</h1>
            <form className="login-form" onSubmit={handleLogin}>
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
                <button className="login-form button" type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
// This line exports the Login component as the default export of this module. This allows other parts of the application to import and use the Login component when needed.