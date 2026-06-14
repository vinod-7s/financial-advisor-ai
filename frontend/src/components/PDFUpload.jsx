import { useState } from "react";
import axios from "axios";

export default function PDFUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const uploadPDF = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/upload-pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("Upload Failed");
    }
  };

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
    >
      <h3>📄 Upload PDF</h3>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={uploadPDF}>
        Upload
      </button>

      <p>{message}</p>
    </div>
  );
}