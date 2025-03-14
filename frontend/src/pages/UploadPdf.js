import { useState } from "react";
import {
  Button,
  CircularProgress,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Modal,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import axios from "axios";
import { styled } from "@mui/material/styles";

// Custom styled card with gradient and hover effect
const CoolCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 320,
  background: "linear-gradient(135deg, #6e8efb 0%, #a777e3 100%)",
  color: "#fff",
  borderRadius: "16px",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)",
  },
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
    margin: "0 10px",
  },
}));

// Styled modal box with a cool effect
const ModalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 450,
  background: "linear-gradient(145deg, #ffffff 0%, #f0f4ff 100%)",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
  padding: theme.spacing(4),
  textAlign: "center",
  animation: "fadeIn 0.5s ease-in-out",
  "@keyframes fadeIn": {
    "0%": { opacity: 0, transform: "translate(-50%, -60%)" },
    "100%": { opacity: 1, transform: "translate(-50%, -50%)" },
  },
  [theme.breakpoints.down("sm")]: {
    width: "85%",
    padding: theme.spacing(3),
  },
}));

const UploadFile = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [docxFile, setDocxFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openPdfModal, setOpenPdfModal] = useState(false);
  const [openDocxModal, setOpenDocxModal] = useState(false);

  // Handle file change for PDF
  const handlePdfFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setPdfFile(selectedFile);
  };

  // Handle file change for DOCX
  const handleDocxFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setDocxFile(selectedFile);
  };

  // Open file input for PDF
  const handlePdfUploadClick = () => {
    document.getElementById("pdfFileInput").click();
  };

  // Open file input for DOCX
  const handleDocxUploadClick = () => {
    document.getElementById("docxFileInput").click();
  };

  // Convert PDF to DOCX
  const handleConvertPdfToDocx = async () => {
    if (!pdfFile) {
      alert("Please select a PDF file first");
      return;
    }

    const formData = new FormData();
    formData.append("pdfFile", pdfFile);

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/convert/pdf-to-docx",
        formData,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${pdfFile.name.replace(".pdf", "")}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setOpenPdfModal(false);
      setPdfFile(null);
    } catch (error) {
      console.error("Error converting PDF to DOCX:", error);
      alert("Failed to convert PDF: " + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Convert DOCX to PDF
  const handleConvertDocxToPdf = async () => {
    if (!docxFile) {
      alert("Please select a DOCX file first");
      return;
    }

    const formData = new FormData();
    formData.append("docxFile", docxFile);

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/convert/docx-to-pdf",
        formData,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${docxFile.name.replace(".docx", "")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setOpenDocxModal(false);
      setDocxFile(null);
    } catch (error) {
      console.error("Error converting DOCX to PDF:", error);
      alert("Failed to convert DOCX: " + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #e0e7ff 0%, #ffffff 100%)",
        p: { xs: 2, sm: 4 },
      }}
    >
      <Typography
        variant="h3"
        sx={{
          mb: 4,
          fontWeight: "bold",
          color: "#3f51b5",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
          fontSize: { xs: "2rem", sm: "3rem" },
        }}
      >
        FILE - FORGE
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 3,
          width: "100%",
          maxWidth: 700,
          justifyContent: "center",
        }}
      >
        {/* PDF to DOCX Card */}
        <CoolCard>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              PDF to DOCX
            </Typography>
            <Typography variant="body2">
              Transform your PDFs into editable DOCX files with ease.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#fff",
                color: "#6e8efb",
                "&:hover": { backgroundColor: "#f0f0f0" },
                borderRadius: "20px",
                px: 3,
              }}
              onClick={() => setOpenPdfModal(true)}
            >
              Convert Now
            </Button>
          </CardActions>
        </CoolCard>

        {/* DOCX to PDF Card */}
        <CoolCard>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              DOCX to PDF
            </Typography>
            <Typography variant="body2">
              Convert your DOCX documents to sleek PDFs instantly.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#fff",
                color: "#a777e3",
                "&:hover": { backgroundColor: "#f0f0f0" },
                borderRadius: "20px",
                px: 3,
              }}
              onClick={() => setOpenDocxModal(true)}
            >
              Convert Now
            </Button>
          </CardActions>
        </CoolCard>
      </Box>

      {/* PDF to DOCX Modal */}
      <Modal open={openPdfModal} onClose={() => setOpenPdfModal(false)}>
        <ModalBox>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#3f51b5", fontWeight: "bold" }}
          >
            Upload PDF File
          </Typography>

          <input
            id="pdfFileInput"
            type="file"
            accept="application/pdf"
            onChange={handlePdfFileChange}
            style={{ display: "none" }}
          />

          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileUploadIcon />}
            onClick={handlePdfUploadClick}
            sx={{
              mb: 2,
              borderRadius: "20px",
              borderColor: "#6e8efb",
              color: "#6e8efb",
              "&:hover": { borderColor: "#5a78e0" },
            }}
          >
            Upload PDF
          </Button>

          {pdfFile && (
            <Typography
              variant="body1"
              sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}
            >
              📄 {pdfFile.name}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleConvertPdfToDocx}
            disabled={loading || !pdfFile}
            sx={{
              mt: 2,
              borderRadius: "20px",
              background: "linear-gradient(90deg, #6e8efb 0%, #a777e3 100%)",
              "&:hover": { background: "linear-gradient(90deg, #5a78e0 0%, #9366d2 100%)" },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Convert to DOCX"}
          </Button>
        </ModalBox>
      </Modal>

      {/* DOCX to PDF Modal */}
      <Modal open={openDocxModal} onClose={() => setOpenDocxModal(false)}>
        <ModalBox>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#3f51b5", fontWeight: "bold" }}
          >
            Upload DOCX File
          </Typography>

          <input
            id="docxFileInput"
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleDocxFileChange}
            style={{ display: "none" }}
          />

          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileUploadIcon />}
            onClick={handleDocxUploadClick}
            sx={{
              mb: 2,
              borderRadius: "20px",
              borderColor: "#a777e3",
              color: "#a777e3",
              "&:hover": { borderColor: "#9366d2" },
            }}
          >
            Upload DOCX
          </Button>

          {docxFile && (
            <Typography
              variant="body1"
              sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}
            >
              📄 {docxFile.name}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleConvertDocxToPdf}
            disabled={loading || !docxFile}
            sx={{
              mt: 2,
              borderRadius: "20px",
              background: "linear-gradient(90deg, #a777e3 0%, #6e8efb 100%)",
              "&:hover": { background: "linear-gradient(90deg, #9366d2 0%, #5a78e0 100%)" },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Convert to PDF"}
          </Button>
        </ModalBox>
      </Modal>
    </Box>
  );
};

export default UploadFile;