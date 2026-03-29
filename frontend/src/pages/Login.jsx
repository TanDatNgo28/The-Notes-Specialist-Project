import { useState } from "react";

function Login() {
    const [username, setUsername] = useState("");
    // What this does is it creates a state variable called email and a function called setEmail that we can use to update the value of email. The initial value of email is an empty string.
    const [password, setPassword] = useState("");

    async function handleLogin(e) {
        // The handleLogin function is called when the user submits the login form. It takes an event object as an argument, which we can use to prevent the default behavior of the form submission.
        e.preventDefault();
        // Default behavior of form submission is to reload the page, which we don't want in a single-page application like this. By calling e.preventDefault(), we can prevent that from happening and instead handle the login logic in our JavaScript code.
        // This prevents the default behavior of the form submission, which would cause the page to reload.

        try {
            const response = await fetch("http://127.0.0.1:5000/api/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            console.log(data)
            alert(data.message);
        } catch (error) {
            console.error("Login error:", error);
        }
    }; 

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleLogin}>
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

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
// This line exports the Login component as the default export of this module. This allows other parts of the application to import and use the Login component when needed.