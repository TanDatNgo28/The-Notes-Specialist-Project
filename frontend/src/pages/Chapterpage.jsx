import {useParams} from "react-router-dom";
import {useEffect, useState, useContext} from "react";
import {AuthContext} from "./AuthContext"; // For authentication state
import {Document, Page, pdfjs} from "react-pdf" // For rendering the page to allow previewing

import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import "./Chapterpage.css"

// Worker setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL (
    "pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url
).toString();

function Chapterpage() {
    const {chid} = useParams();
    const {user} = useContext(AuthContext);
    const [chapter, setChapter] = useState(null);
    const [notes, setNotes] = useState([]);
    const [file, setFile] = useState(null);
    const [course, setCourse] = useState(null);
    // For previewing the notes
    const [previewNid, setPreviewNid] = useState(null);
    const [numPages, setNumPages] = useState(null);

    useEffect (() => {
        fetch(`http://127.0.0.1:5000/api/chapters/${chid}`, {credentials: "include"})
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setChapter(data.chapter);

                return fetch(`http://127.0.0.1:5000/api/courses/${data.chapter.cid}`, {credentials: "include"});
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) setCourse(data.course);
        });

        fetchNotes();
    }, [chid]);

    const fetchNotes = () => {
        fetch(`http://127.0.0.1:5000/api/chapters/${chid}/notes`, {credentials: "include"})
        .then(res => res.json())
        .then(data => setNotes(data));
    };

    const uploadNote = async(e) => {
        e.preventDefault();
        if (!file) return alert("Please select a PDF file");
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/chapters/${chid}/upload`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                alert("Note uploaded. Thank you for your contribution!");
                setFile(null);

                fetchNotes();
            }
            else alert(data.message);
        }
        catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="chapter-page">
            <nav className="chapter-navbar">
                <h1 className="chapter-title">
                    {course && chapter ? `${course.course_code} - ${chapter.chapter_name}` : "Loading..."}
                </h1>
            </nav>

            <div className="chapter-content">
                <h2>Notes</h2>
                {notes.length === 0 ? (
                    <p className="no-notes">No notes uploaded yet</p>
                ) : (
                    <ul className="notes-list">
                        {notes.map(note => (
                            <li className="note-item" key={note.nid}>
                                <span>📗 {note.filename} ({(note.size / 1024).toFixed(1)} KB)</span>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button className="preview-btn" onClick={() => setPreviewNid(note.nid)}>Preview</button>
                                    <a href={`http://127.0.0.1:5000/api/notes/${note.nid}/download`}
                                        target="_blank" rel="noreferrer"
                                    >
                                        <u> Click here to download</u>
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {user && (
                    <form className="upload-form" onSubmit={uploadNote}>
                        <input
                            type = "file"
                            accept = "application/pdf"
                            onChange = {(e) => setFile(e.target.files[0])}
                        />
                        <button type="submit">Upload Notes</button>
                    </form>
                )}
            </div>
            
            {previewNid && (
                <div className="preview-overlay" onClick={() => setPreviewNid(null)}>
                    <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="preview-header">
                            <h3>Preview the first 3 pages</h3>
                            <button className="close-btn" onClick={() =>setPreviewNid(null)}>X</button>
                        </div>
                        <div className="preview-body">
                            <Document file={`http://127.0.0.1:5000/api/notes/${previewNid}/download`}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                            >
                                {Array.from({ length: Math.min(3, numPages || 0) }, (_, i) => (
                                    <Page key={i + 1} pageNumber={i + 1} width={600}/>
                                ))}
                            </Document>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
// This line exports the Chapterpage component as the default export of this module
// This allows other parts of the application to import and use the Chapterpage component when needed
export default Chapterpage;