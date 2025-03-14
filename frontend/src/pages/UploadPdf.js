import { useState } from "react";
import { Button, CircularProgress, Typography, Box } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import axios from "axios";

const UploadPdf = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUploadClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleConvert = async () => {
    if (!file) {
      alert("Please select a PDF file first");
      return;
    }

    const formData = new FormData();
    formData.append("pdfFile", file);

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/convert", formData, {
        responseType: "blob", // Important: Expect a binary response
      });

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(".pdf", "")}.docx`; // Use original file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up
    } catch (error) {
      console.error("Error converting file:", error);
      alert("Failed to convert PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ textAlign: "center", p: 4 }}>
      <Typography variant="h5" gutterBottom>
        PDF to DOCX Converter
      </Typography>

      {/* Hidden File Input */}
      <input
        id="fileInput"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Upload Button */}
      <Button
        variant="outlined"
        color="primary"
        startIcon={<FileUploadIcon />}
        onClick={handleUploadClick}
        sx={{ mb: 2 }}
      >
        Upload PDF
      </Button>

      {/* Show file name if uploaded */}
      {file && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          📄 {file.name}
        </Typography>
      )}

      <br />

      {/* Convert Button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<CloudUploadIcon />}
        onClick={handleConvert}
        disabled={loading || !file}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Convert to DOCX"}
      </Button>
    </Box>
  );
};

export default UploadPdf;