import {Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Coursepage from "./pages/Coursepage";
import Chapterpage from "./pages/Chapterpage";
import MyNotes from "./pages/MyNotes";
import "./App.css";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/courses/:cid" element={<Coursepage />} />
            <Route path="/chapters/:chid" element={<Chapterpage />} />
            <Route path="/my-notes" element={<MyNotes />} />
        </Routes>
    );
}
// This line exports the App component as the default export of this module
// This allows other parts of the application to import and use the App component when needed
export default App;