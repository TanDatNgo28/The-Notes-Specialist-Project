import {createContext, useState, useEffect} from "react";
export const AuthContext = createContext();
export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/me", {
            credentials: "include",
        })
        .then(res => res.json())
        .then(data => {
            if (data.logged_in) {
                setUser({username: data.username});
            }
            else {
                setUser(null);
                localStorage.removeItem("user");
            }
        })
        .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (user) localStorage.setItem("user", JSON.stringify(user));
        else localStorage.removeItem("user");
    }, [user]);

    return (
        <AuthContext.Provider value={{user, setUser}}>
            {children}
        </AuthContext.Provider>
    );
}