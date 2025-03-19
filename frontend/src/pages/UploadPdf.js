// UploadFile.jsx
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
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete"; // Added for delete button
import axios from "axios";
import { styled } from "@mui/material/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PDFDocument } from "pdf-lib"; // Added for client-side PDF splitting

// Custom styled card (unchanged)
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

// Styled modal box (unchanged)
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

// Styled summary modal box (unchanged)
const SummaryModalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 900,
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

// Styled split modal box (new, larger for displaying pages)
const SplitModalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 900,
  maxHeight: "80vh",
  overflowY: "auto",
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
  const [pptxFile, setPptxFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [fileForSummary, setFileForSummary] = useState(null);
  const [pdfFilesToMerge, setPdfFilesToMerge] = useState([null, null]);
  const [splitFile, setSplitFile] = useState(null); // New state for split PDF
  const [splitPages, setSplitPages] = useState([]); // Array of page previews
  const [loading, setLoading] = useState(false);
  const [openPdfModal, setOpenPdfModal] = useState(false);
  const [openDocxModal, setOpenDocxModal] = useState(false);
  const [openPptxModal, setOpenPptxModal] = useState(false);
  const [openVideoModal, setOpenVideoModal] = useState(false);
  const [openSummaryModal, setOpenSummaryModal] = useState(false);
  const [openSummaryViewModal, setOpenSummaryViewModal] = useState(false);
  const [openMergeModal, setOpenMergeModal] = useState(false);
  const [openSplitModal, setOpenSplitModal] = useState(false); // New modal state
  const [openSplitViewModal, setOpenSplitViewModal] = useState(false); // New view modal state
  const [summaryData, setSummaryData] = useState({ original: [], summary: [] });

  // Existing handlers (unchanged)
  const handlePdfFileChange = (index) => (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const updatedFiles = [...pdfFilesToMerge];
      updatedFiles[index] = selectedFile;
      setPdfFilesToMerge(updatedFiles);
    }
  };

  const handleAddMorePdf = () => {
    setPdfFilesToMerge([...pdfFilesToMerge, null]);
  };

  const handleMergeUploadClick = (index) => () => {
    document.getElementById(`mergeFileInput-${index}`).click();
  };

  const handleMergePdfs = async () => {
    const validFiles = pdfFilesToMerge.filter((file) => file !== null);
    if (validFiles.length < 2) {
      toast.error("Please upload at least two PDF files to merge.");
      return;
    }

    const formData = new FormData();
    validFiles.forEach((file) => {
      formData.append("pdfFiles", file);
    });

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/merge-pdfs",
        formData,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `merged_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDFs merged successfully!");
      setOpenMergeModal(false);
      setPdfFilesToMerge([null, null]);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      toast.error("Failed to merge PDFs: " + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePdfFileChangeBasic = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setPdfFile(selectedFile);
  };
  const handleDocxFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setDocxFile(selectedFile);
  };
  const handlePptxFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setPptxFile(selectedFile);
  };
  const handleVideoFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setVideoFile(selectedFile);
  };
  const handleSummaryFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setFileForSummary(selectedFile);
  };
  const handlePdfUploadClick = () => document.getElementById("pdfFileInput").click();
  const handleDocxUploadClick = () => document.getElementById("docxFileInput").click();
  const handlePptxUploadClick = () => document.getElementById("pptxFileInput").click();
  const handleVideoUploadClick = () => document.getElementById("videoFileInput").click();
  const handleSummaryUploadClick = () => document.getElementById("summaryFileInput").click();

  const handleConvertPdfToDocx = async () => {
    if (!pdfFile) {
      toast.error("Please select a PDF file first");
      return;
    }
    const formData = new FormData();
    formData.append("pdfFile", pdfFile);
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/convert/pdf-to-docx", formData, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${pdfFile.name.replace(".pdf", "")}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("PDF converted to DOCX successfully!");
      setOpenPdfModal(false);
      setPdfFile(null);
    } catch (error) {
      console.error("Error converting PDF to DOCX:", error);
      toast.error("Failed to convert PDF: " + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleConvertDocxToPdf = async () => {
    if (!docxFile) {
      toast.error("Please select a DOCX file first");
      return;
    }
    const formData = new FormData();
    formData.append("docxFile", docxFile);
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/convert/docx-to-pdf", formData, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${docxFile.name.replace(".docx", "")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("DOCX converted to PDF successfully!");
      setOpenDocxModal(false);
      setDocxFile(null);
    } catch (error) {
      console.error("Error converting DOCX to PDF:", error);
      toast.error("Failed to convert DOCX: " + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleConvertPptxToPdf = async () => {
    if (!pptxFile) {
      toast.error("Please select a PPTX file first");
      return;
    }
    const formData = new FormData();
    formData.append("pptxFile", pptxFile);
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/convert/pptx-to-pdf", formData, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${pptxFile.name.replace(".pptx", "")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("PPTX converted to PDF successfully!");
      setOpenPptxModal(false);
      setPptxFile(null);
    } catch (error) {
      console.error("Error converting PPTX to PDF:", error);
      toast.error("Failed to convert PPTX: " + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleConvertVideoToAudio = async () => {
    if (!videoFile) {
      toast.error("Please select a video file first");
      return;
    }
    const formData = new FormData();
    formData.append("videoFile", videoFile);
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/convert/video-to-audio", formData, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "audio/mpeg" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${videoFile.name.replace(/\.(mp4|avi|mpeg|mov)$/i, "")}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Video converted to audio successfully!");
      setOpenVideoModal(false);
      setVideoFile(null);
    } catch (error) {
      console.error("Error converting video to audio:", error);
      toast.error("Failed to convert video: " + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!fileForSummary) {
      toast.error("Please select a PDF or image file first");
      return;
    }
    const formData = new FormData();
    formData.append("file", fileForSummary);
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/summarize", formData);
      setSummaryData(response.data);
      setOpenSummaryViewModal(true);
      setOpenSummaryModal(false);
    } catch (error) {
      console.error("Error summarizing document:", error);
      toast.error("Failed to summarize: " + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = () => {
    const summaryText = summaryData.summary.join("\n");
    navigator.clipboard.writeText(summaryText).then(() => {
      toast.success("Summary copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy summary.");
    });
  };

  const handleBackToUpload = () => {
    setOpenSummaryViewModal(false);
    setOpenSummaryModal(true);
  };

  // New handlers for Split PDF
  const handleSplitFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setSplitFile(selectedFile);
  };

  const handleSplitUploadClick = () => {
    document.getElementById("splitFileInput").click();
  };

  const handleSplitPdf = async () => {
    if (!splitFile) {
      toast.error("Please select a PDF file to split.");
      return;
    }

    setLoading(true);

    try {
      const arrayBuffer = await splitFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      if (totalPages <= 1) {
        toast.error("PDF must have more than one page to split.");
        setLoading(false);
        return;
      }

      const pagePreviews = [];
      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        pagePreviews.push({ url, pageNumber: i + 1 });
      }

      setSplitPages(pagePreviews);
      setOpenSplitModal(false);
      setOpenSplitViewModal(true);
      toast.success("PDF split successfully!");
    } catch (error) {
      console.error("Error splitting PDF:", error);
      toast.error("Failed to split PDF: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = (index) => {
    const updatedPages = splitPages.filter((_, i) => i !== index);
    setSplitPages(updatedPages);
    toast.success(`Page ${splitPages[index].pageNumber} deleted!`);
  };

  const handleSaveSplitPdf = async () => {
    if (splitPages.length === 0) {
      toast.error("No pages left to save!");
      return;
    }

    setLoading(true);

    try {
      const newPdf = await PDFDocument.create();
      for (const page of splitPages) {
        const pagePdf = await PDFDocument.load(await (await fetch(page.url)).arrayBuffer());
        const [copiedPage] = await newPdf.copyPages(pagePdf, [0]);
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${splitFile.name.replace(".pdf", "")}_modified.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Modified PDF saved successfully!");
      setOpenSplitViewModal(false);
      setSplitFile(null);
      setSplitPages([]);
    } catch (error) {
      console.error("Error saving split PDF:", error);
      toast.error("Failed to save PDF: " + error.message);
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
          maxWidth: 1400,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Existing cards */}
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
        <CoolCard>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              PPTX to PDF
            </Typography>
            <Typography variant="body2">
              Turn your PPTX presentations into polished PDFs quickly.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#fff",
                color: "#7b5ee9",
                "&:hover": { backgroundColor: "#f0f0f0" },
                borderRadius: "20px",
                px: 3,
              }}
              onClick={() => setOpenPptxModal(true)}
            >
              Convert Now
            </Button>
          </CardActions>
        </CoolCard>
        <CoolCard>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Video to Audio
            </Typography>
            <Typography variant="body2">
              Extract audio from your videos as MP3 files effortlessly.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#fff",
                color: "#5e89e9",
                "&:hover": { backgroundColor: "#f0f0f0" },
                borderRadius: "20px",
                px: 3,
              }}
              onClick={() => setOpenVideoModal(true)}
            >
              Convert Now
            </Button>
          </CardActions>
        </CoolCard>
        <CoolCard>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Summarize Document
            </Typography>
            <Typography variant="body2">
              Upload a PDF or image to get a concise summary.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#fff",
                color: "#ff9800",
                "&:hover": { backgroundColor: "#f0f0f0" },
                borderRadius: "20px",
                px: 3,
              }}
              onClick={() => setOpenSummaryModal(true)}
            >
              Summarize Now
            </Button>
          </CardActions>
        </CoolCard>
        <CoolCard>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Merge PDFs
            </Typography>
            <Typography variant="body2">
              Combine multiple PDF files into a single document.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#fff",
                color: "#4caf50",
                "&:hover": { backgroundColor: "#f0f0f0" },
                borderRadius: "20px",
                px: 3,
              }}
              onClick={() => setOpenMergeModal(true)}
            >
              Merge Now
            </Button>
          </CardActions>
        </CoolCard>
        {/* New Split PDF Card */}
        <CoolCard>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Split PDF
            </Typography>
            <Typography variant="body2">
              Split your PDF into individual pages and edit them.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#fff",
                color: "#f44336",
                "&:hover": { backgroundColor: "#f0f0f0" },
                borderRadius: "20px",
                px: 3,
              }}
              onClick={() => setOpenSplitModal(true)}
            >
              Split Now
            </Button>
          </CardActions>
        </CoolCard>
      </Box>

      {/* Existing Modals */}
      <Modal open={openPdfModal} onClose={() => { setOpenPdfModal(false); setPdfFile(null); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Upload PDF File
          </Typography>
          <input id="pdfFileInput" type="file" accept="application/pdf" onChange={handlePdfFileChangeBasic} style={{ display: "none" }} />
          <Button variant="outlined" color="primary" startIcon={<FileUploadIcon />} onClick={handlePdfUploadClick} sx={{ mb: 2, borderRadius: "20px", borderColor: "#6e8efb", color: "#6e8efb", "&:hover": { borderColor: "#5a78e0" } }}>
            Upload PDF
          </Button>
          {pdfFile && <Typography variant="body1" sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}>📄 {pdfFile.name}</Typography>}
          <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} onClick={handleConvertPdfToDocx} disabled={loading || !pdfFile} sx={{ mt: 2, borderRadius: "20px", background: "linear-gradient(90deg, #6e8efb 0%, #a777e3 100%)", "&:hover": { background: "linear-gradient(90deg, #5a78e0 0%, #9366d2 100%)" } }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Convert to DOCX"}
          </Button>
        </ModalBox>
      </Modal>

      <Modal open={openDocxModal} onClose={() => { setOpenDocxModal(false); setDocxFile(null); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Upload DOCX File
          </Typography>
          <input id="docxFileInput" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleDocxFileChange} style={{ display: "none" }} />
          <Button variant="outlined" color="primary" startIcon={<FileUploadIcon />} onClick={handleDocxUploadClick} sx={{ mb: 2, borderRadius: "20px", borderColor: "#a777e3", color: "#a777e3", "&:hover": { borderColor: "#9366d2" } }}>
            Upload DOCX
          </Button>
          {docxFile && <Typography variant="body1" sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}>📄 {docxFile.name}</Typography>}
          <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} onClick={handleConvertDocxToPdf} disabled={loading || !docxFile} sx={{ mt: 2, borderRadius: "20px", background: "linear-gradient(90deg, #a777e3 0%, #6e8efb 100%)", "&:hover": { background: "linear-gradient(90deg, #9366d2 0%, #5a78e0 100%)" } }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Convert to PDF"}
          </Button>
        </ModalBox>
      </Modal>

      <Modal open={openPptxModal} onClose={() => { setOpenPptxModal(false); setPptxFile(null); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Upload PPTX File
          </Typography>
          <input id="pptxFileInput" type="file" accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={handlePptxFileChange} style={{ display: "none" }} />
          <Button variant="outlined" color="primary" startIcon={<FileUploadIcon />} onClick={handlePptxUploadClick} sx={{ mb: 2, borderRadius: "20px", borderColor: "#7b5ee9", color: "#7b5ee9", "&:hover": { borderColor: "#694dd8" } }}>
            Upload PPTX
          </Button>
          {pptxFile && <Typography variant="body1" sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}>📄 {pptxFile.name}</Typography>}
          <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} onClick={handleConvertPptxToPdf} disabled={loading || !pptxFile} sx={{ mt: 2, borderRadius: "20px", background: "linear-gradient(90deg, #7b5ee9 0%, #6e8efb 100%)", "&:hover": { background: "linear-gradient(90deg, #694dd8 0%, #5a78e0 100%)" } }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Convert to PDF"}
          </Button>
        </ModalBox>
      </Modal>

      <Modal open={openVideoModal} onClose={() => { setOpenVideoModal(false); setVideoFile(null); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Upload Video File
          </Typography>
          <input id="videoFileInput" type="file" accept="video/mp4,video/avi,video/mpeg,video/quicktime" onChange={handleVideoFileChange} style={{ display: "none" }} />
          <Button variant="outlined" color="primary" startIcon={<FileUploadIcon />} onClick={handleVideoUploadClick} sx={{ mb: 2, borderRadius: "20px", borderColor: "#5e89e9", color: "#5e89e9", "&:hover": { borderColor: "#4d78d8" } }}>
            Upload Video
          </Button>
          {videoFile && <Typography variant="body1" sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}>🎥 {videoFile.name}</Typography>}
          <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} onClick={handleConvertVideoToAudio} disabled={loading || !videoFile} sx={{ mt: 2, borderRadius: "20px", background: "linear-gradient(90deg, #5e89e9 0%, #a777e3 100%)", "&:hover": { background: "linear-gradient(90deg, #4d78d8 0%, #9366d2 100%)" } }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Convert to MP3"}
          </Button>
        </ModalBox>
      </Modal>

      <Modal open={openSummaryModal} onClose={() => { setOpenSummaryModal(false); setFileForSummary(null); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Upload Document (PDF or Image)
          </Typography>
          <input id="summaryFileInput" type="file" accept="application/pdf,image/png,image/jpeg,image/jpg" onChange={handleSummaryFileChange} style={{ display: "none" }} />
          <Button variant="outlined" color="primary" startIcon={<FileUploadIcon />} onClick={handleSummaryUploadClick} sx={{ mb: 2, borderRadius: "20px", borderColor: "#ff9800", color: "#ff9800", "&:hover": { borderColor: "#f57c00" } }}>
            Upload Document
          </Button>
          {fileForSummary && <Typography variant="body1" sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}>📄 {fileForSummary.name}</Typography>}
          <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} onClick={handleSummarize} disabled={loading || !fileForSummary} sx={{ mt: 2, mb: 2, borderRadius: "20px", background: "linear-gradient(90deg, #ff9800 0%, #ffca28 100%)", "&:hover": { background: "linear-gradient(90deg, #f57c00 0%, #ffb300 100%)" } }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Summarize"}
          </Button>
        </ModalBox>
      </Modal>

      <Modal open={openSummaryViewModal} onClose={() => { setOpenSummaryViewModal(false); setSummaryData({ original: [], summary: [] }); }}>
        <SummaryModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Summary
          </Typography>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, mt: 2, justifyContent: "space-between" }}>
            <Box sx={{ flex: 1, background: "#fff", p: 2, borderRadius: "12px", border: "1px solid #ddd" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#3f51b5" }}>Original</Typography>
              {summaryData.original.map((para, index) => (
                <Typography key={index} variant="body2" sx={{ mt: 1, color: "#555" }}>{para}</Typography>
              ))}
            </Box>
            <Box sx={{ flex: 1, background: "#fff", p: 2, borderRadius: "12px", border: "1px solid #ddd", position: "relative" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#3f51b5" }}>Summary</Typography>
              {summaryData.summary.map((sum, index) => (
                <Typography key={index} variant="body2" sx={{ mt: 1, color: "#555" }}>{sum}</Typography>
              ))}
              <IconButton onClick={handleCopySummary} sx={{ position: "absolute", top: 8, right: 8, color: "#ff9800", "&:hover": { color: "#f57c00" } }} aria-label="copy summary">
                <ContentCopyIcon />
              </IconButton>
            </Box>
          </Box>
          <Button variant="outlined" color="primary" onClick={handleBackToUpload} sx={{ mt: 2, borderRadius: "20px", borderColor: "#ff9800", color: "#ff9800", "&:hover": { borderColor: "#f57c00" } }}>
            Back
          </Button>
        </SummaryModalBox>
      </Modal>

      <Modal open={openMergeModal} onClose={() => { setOpenMergeModal(false); setPdfFilesToMerge([null, null]); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Merge PDF Files
          </Typography>
          {pdfFilesToMerge.map((file, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <input
                id={`mergeFileInput-${index}`}
                type="file"
                accept="application/pdf"
                onChange={handlePdfFileChange(index)}
                style={{ display: "none" }}
              />
              <Button
                variant="outlined"
                color="primary"
                startIcon={<FileUploadIcon />}
                onClick={handleMergeUploadClick(index)}
                sx={{
                  mr: 2,
                  borderRadius: "20px",
                  borderColor: "#4caf50",
                  color: "#4caf50",
                  "&:hover": { borderColor: "#388e3c" },
                }}
              >
                {file ? "Replace PDF" : `Upload PDF ${index + 1}`}
              </Button>
              {file && (
                <Typography variant="body1" sx={{ color: "#555", wordBreak: "break-word" }}>
                  📄 {file.name}
                </Typography>
              )}
            </Box>
          ))}
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleAddMorePdf}
            sx={{
              mb: 2,
              borderRadius: "20px",
              borderColor: "#4caf50",
              color: "#4caf50",
              "&:hover": { borderColor: "#388e3c" },
            }}
          >
            Add More PDFs
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleMergePdfs}
            disabled={loading || pdfFilesToMerge.filter((file) => file !== null).length < 2}
            sx={{
              mt: 2,
              borderRadius: "20px",
              background: "linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)",
              "&:hover": { background: "linear-gradient(90deg, #388e3c 0%, #43a047 100%)" },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Merge PDFs"}
          </Button>
        </ModalBox>
      </Modal>

      {/* New Split PDF Upload Modal */}
      <Modal open={openSplitModal} onClose={() => { setOpenSplitModal(false); setSplitFile(null); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Upload PDF to Split
          </Typography>
          <input
            id="splitFileInput"
            type="file"
            accept="application/pdf"
            onChange={handleSplitFileChange}
            style={{ display: "none" }}
          />
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileUploadIcon />}
            onClick={handleSplitUploadClick}
            sx={{
              mb: 2,
              borderRadius: "20px",
              borderColor: "#f44336",
              color: "#f44336",
              "&:hover": { borderColor: "#d32f2f" },
            }}
          >
            Upload PDF
          </Button>
          {splitFile && (
            <Typography variant="body1" sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}>
              📄 {splitFile.name}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleSplitPdf}
            disabled={loading || !splitFile}
            sx={{
              mt: 2,
              borderRadius: "20px",
              background: "linear-gradient(90deg, #f44336 0%, #ef5350 100%)",
              "&:hover": { background: "linear-gradient(90deg, #d32f2f 0%, #e53935 100%)" },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Split PDF"}
          </Button>
        </ModalBox>
      </Modal>

      {/* New Split PDF View Modal */}
      <Modal open={openSplitViewModal} onClose={() => { setOpenSplitViewModal(false); setSplitPages([]); setSplitFile(null); }}>
        <SplitModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Split PDF Pages
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", mt: 2 }}>
            {splitPages.map((page, index) => (
              <Box key={index} sx={{ position: "relative", width: 200, height: 280, border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
                <iframe
                  src={page.url}
                  title={`Page ${page.pageNumber}`}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                />
                <IconButton
                  onClick={() => handleDeletePage(index)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "#f44336",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)", color: "#d32f2f" },
                  }}
                  aria-label={`delete page ${page.pageNumber}`}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSplitPdf}
            disabled={loading || splitPages.length === 0}
            sx={{
              mt: 3,
              borderRadius: "20px",
              background: "linear-gradient(90deg, #f44336 0%, #ef5350 100%)",
              "&:hover": { background: "linear-gradient(90deg, #d32f2f 0%, #e53935 100%)" },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Save Modified PDF"}
          </Button>
        </SplitModalBox>
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Box>
  );
};

export default UploadFile;