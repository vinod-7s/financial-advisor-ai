import { useEffect, useState } from "react";
import axios from "axios";

export default function PdfLibrary() {

  const [files, setFiles] = useState([]);

  const loadFiles = async () => {
    const res = await axios.get(
      "http://127.0.0.1:8000/pdfs"
    );

    setFiles(res.data.files);
  };

  const deleteFile = async (file) => {

    await axios.delete(
      `http://127.0.0.1:8000/pdfs/${file}`
    );

    loadFiles();
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div>
      <h2>PDF Library</h2>

      {files.map((file) => (
        <div key={file}>
          {file}

          <button
            onClick={() => deleteFile(file)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}