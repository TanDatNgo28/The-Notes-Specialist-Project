import { useState } from "react";

function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // The handleSignup function is called when the user submits the signup form. It takes an event object as an argument, which we can use to prevent the default behavior of the form submission.
    async function handleSignup(e) {
        e.preventDefault();

        try {
            const response = await fetch("http://127.0.0.1:5000/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            console.log(data.message);
            alert(data.message);
        } catch (error) {
            console.error("Signup error:", error);
        }
    };

    return (
        <div>
            <h1>Sign Up</h1>

            <form onSubmit={handleSignup}>
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

                <button type="submit">Create Account</button>
            </form>
        </div>
    );
}
// This line exports the Signup component as the default export of this module. This allows other parts of the application to import and use the Signup component when needed.
export default Signup;