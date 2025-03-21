// UploadFile.jsx
import { useState, useEffect } from "react";
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
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import InstagramIcon from "@mui/icons-material/Instagram";
import EmailIcon from "@mui/icons-material/Email";
import axios from "axios";
import { styled } from "@mui/material/styles";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PDFDocument } from "pdf-lib";

// Custom styled card
const CoolCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 320,
  background: "linear-gradient(135deg, #6e8efb 0%, #a777e3 100%)",
  color: "#fff",
  borderRadius: "16px",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2), 0 0 20px rgba(110, 142, 251, 0.5)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease",
  opacity: 0.95,
  "&:hover": {
    transform: "scale(1.03)",
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3), 0 0 30px rgba(110, 142, 251, 0.8)",
    opacity: 1,
  },
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
    margin: "0 10px",
  },
}));

// Styled modal box
const ModalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 450,
  background: "linear-gradient(145deg, #ffffff 0%, #f0f4ff 100%)",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15), 0 0 15px rgba(110, 142, 251, 0.3)",
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

// Styled summary modal box
const SummaryModalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 900,
  background: "linear-gradient(145deg, #ffffff 0%, #f0f4ff 100%)",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15), 0 0 15px rgba(110, 142, 251, 0.3)",
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

// Styled split/rearrange modal box
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
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15), 0 0 15px rgba(110, 142, 251, 0.3)",
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

// Footer styled component with full width and visibility toggle
const FooterBox = styled(Box)(({ theme, isVisible }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100vw", // Full viewport width
  padding: theme.spacing(2),
  background: "linear-gradient(180deg, #3f51b5 0%, #1e3a8a 100%)",
  color: "#fff",
  textAlign: "center",
  boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.2)",
  opacity: isVisible ? 1 : 0, // Fade in/out
  transform: isVisible ? "translateY(0)" : "translateY(100%)", // Slide in/out
  transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
  zIndex: 1000,
}));

const UploadFile = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [docxFile, setDocxFile] = useState(null);
  const [pptxFile, setPptxFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [fileForSummary, setFileForSummary] = useState(null);
  const [pdfFilesToMerge, setPdfFilesToMerge] = useState([null, null]);
  const [splitFile, setSplitFile] = useState(null);
  const [rearrangeFile, setRearrangeFile] = useState(null);
  const [splitPages, setSplitPages] = useState([]);
  const [rearrangePages, setRearrangePages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openPdfModal, setOpenPdfModal] = useState(false);
  const [openDocxModal, setOpenDocxModal] = useState(false);
  const [openPptxModal, setOpenPptxModal] = useState(false);
  const [openVideoModal, setOpenVideoModal] = useState(false);
  const [openSummaryModal, setOpenSummaryModal] = useState(false);
  const [openSummaryViewModal, setOpenSummaryViewModal] = useState(false);
  const [openMergeModal, setOpenMergeModal] = useState(false);
  const [openSplitModal, setOpenSplitModal] = useState(false);
  const [openSplitViewModal, setOpenSplitViewModal] = useState(false);
  const [openRearrangeModal, setOpenRearrangeModal] = useState(false);
  const [openRearrangeViewModal, setOpenRearrangeViewModal] = useState(false);
  const [summaryData, setSummaryData] = useState({ original: [], summary: [] });
  const [footerVisible, setFooterVisible] = useState(false);

  // Simplified scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setFooterVisible(scrollPosition > 10); // Show footer after scrolling just 10px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handlers (unchanged, kept brief)
  const handlePdfFileChange = (index) => (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const updatedFiles = [...pdfFilesToMerge];
      updatedFiles[index] = selectedFile;
      setPdfFilesToMerge(updatedFiles);
    }
  };

  const handleAddMorePdf = () => setPdfFilesToMerge([...pdfFilesToMerge, null]);
  const handleMergeUploadClick = (index) => () => document.getElementById(`mergeFileInput-${index}`).click();
  const handleMergePdfs = async () => {
    const validFiles = pdfFilesToMerge.filter((file) => file !== null);
    if (validFiles.length < 2) return toast.error("Please upload at least two PDF files to merge.");
    const formData = new FormData();
    validFiles.forEach((file) => formData.append("pdfFiles", file));
    setLoading(true);
    try {
      const response = await axios.post("https://fileforge.onrender.com/merge-pdfs", formData, { responseType: "blob" });
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

  const handlePdfFileChangeBasic = (event) => setPdfFile(event.target.files[0]);
  const handleDocxFileChange = (event) => setDocxFile(event.target.files[0]);
  const handlePptxFileChange = (event) => setPptxFile(event.target.files[0]);
  const handleVideoFileChange = (event) => setVideoFile(event.target.files[0]);
  const handleSummaryFileChange = (event) => setFileForSummary(event.target.files[0]);
  const handleSplitFileChange = (event) => setSplitFile(event.target.files[0]);
  const handleRearrangeFileChange = (event) => setRearrangeFile(event.target.files[0]);

  const handlePdfUploadClick = () => document.getElementById("pdfFileInput").click();
  const handleDocxUploadClick = () => document.getElementById("docxFileInput").click();
  const handlePptxUploadClick = () => document.getElementById("pptxFileInput").click();
  const handleVideoUploadClick = () => document.getElementById("videoFileInput").click();
  const handleSummaryUploadClick = () => document.getElementById("summaryFileInput").click();
  const handleSplitUploadClick = () => document.getElementById("splitFileInput").click();
  const handleRearrangeUploadClick = () => document.getElementById("rearrangeFileInput").click();

  const handleConvertPdfToDocx = async () => {
    if (!pdfFile) return toast.error("Please select a PDF file first");
    const formData = new FormData();
    formData.append("pdfFile", pdfFile);
    setLoading(true);
    try {
      const response = await axios.post("https://fileforge.onrender.com/convert/pdf-to-docx", formData, { responseType: "blob" });
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
    if (!docxFile) return toast.error("Please select a DOCX file first");
    const formData = new FormData();
    formData.append("docxFile", docxFile);
    setLoading(true);
    try {
      const response = await axios.post("https://fileforge.onrender.com/convert/docx-to-pdf", formData, { responseType: "blob" });
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
    if (!pptxFile) return toast.error("Please select a PPTX file first");
    const formData = new FormData();
    formData.append("pptxFile", pptxFile);
    setLoading(true);
    try {
      const response = await axios.post("https://fileforge.onrender.com/convert/pptx-to-pdf", formData, { responseType: "blob" });
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
    if (!videoFile) return toast.error("Please select a video file first");
    const formData = new FormData();
    formData.append("videoFile", videoFile);
    setLoading(true);
    try {
      const response = await axios.post("https://fileforge.onrender.com/convert/video-to-audio", formData, { responseType: "blob" });
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
    if (!fileForSummary) return toast.error("Please select a PDF or image file first");
    const formData = new FormData();
    formData.append("file", fileForSummary);
    setLoading(true);
    try {
      const response = await axios.post("https://fileforge.onrender.com/summarize", formData);
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
    navigator.clipboard.writeText(summaryText).then(() => toast.success("Summary copied to clipboard!")).catch((err) => {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy summary.");
    });
  };

  const handleBackToUpload = () => {
    setOpenSummaryViewModal(false);
    setOpenSummaryModal(true);
  };

  const handleSplitPdf = async () => {
    if (!splitFile) return toast.error("Please select a PDF file to split.");
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
    if (splitPages.length === 0) return toast.error("No pages left to save!");
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

  const handlePreviewRearrangePdf = async () => {
    if (!rearrangeFile) return toast.error("Please select a PDF file to rearrange.");
    setLoading(true);
    try {
      const arrayBuffer = await rearrangeFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();
      if (totalPages <= 1) {
        toast.error("PDF must have more than one page to rearrange.");
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
      setRearrangePages(pagePreviews);
      setOpenRearrangeModal(false);
      setOpenRearrangeViewModal(true);
      toast.success("PDF pages ready for rearrangement!");
    } catch (error) {
      console.error("Error previewing PDF for rearrangement:", error);
      toast.error("Failed to preview PDF: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMovePage = (index, direction) => {
    const newPages = [...rearrangePages];
    if (direction === "left" && index > 0) {
      [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
      setRearrangePages(newPages);
      toast.success(`Moved page ${rearrangePages[index].pageNumber} left!`);
    } else if (direction === "right" && index < rearrangePages.length - 1) {
      [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
      setRearrangePages(newPages);
      toast.success(`Moved page ${rearrangePages[index].pageNumber} right!`);
    }
  };

  const handleRearrangePdf = async () => {
    if (!rearrangeFile || rearrangePages.length === 0) return toast.error("No pages to rearrange.");
    setLoading(true);
    try {
      const pageOrder = rearrangePages.map(page => page.pageNumber).join(",");
      const formData = new FormData();
      formData.append("pdfFile", rearrangeFile);
      formData.append("pageOrder", pageOrder);
      const response = await axios.post("https://fileforge.onrender.com/rearrange-pdf", formData, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${rearrangeFile.name.replace(".pdf", "")}_rearranged.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("PDF rearranged successfully!");
      setOpenRearrangeViewModal(false);
      setRearrangeFile(null);
      setRearrangePages([]);
    } catch (error) {
      console.error("Error rearranging PDF:", error);
      toast.error("Failed to rearrange PDF: " + (error.response?.data?.details || error.message));
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
        // Enhanced futuristic background
        background: "linear-gradient(135deg, #0d1b2a 0%, #1b4965 50%, #ff00ff 100%)",
        animation: "gradientShift 15s ease infinite",
        backgroundSize: "200% 200%",
        p: { xs: 2, sm: 4 },
        position: "relative",
        overflow: "hidden",
        "&:before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0.3) 80%)",
          zIndex: 0,
          animation: "pulseGlow 8s ease-in-out infinite",
        },
        "@keyframes gradientShift": {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
          "100%": { backgroundPosition: "0% 0%" },
        },
        "@keyframes pulseGlow": {
          "0%": { opacity: 0.6 },
          "50%": { opacity: 0.9 },
          "100%": { opacity: 0.6 },
        },
      }}
    >
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
        <Typography
          variant="h3"
          sx={{
            mb: 1,
            fontWeight: "bold",
            color: "#ffffff",
            textShadow: "2px 2px 8px rgba(110, 142, 251, 0.8), 0 0 15px rgba(255, 255, 255, 0.5)",
            fontSize: { xs: "2rem", sm: "3rem" },
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.02)" },
              "100%": { transform: "scale(1)" },
            },
          }}
        >
          FILE - FORGE
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: 4,
            fontWeight: "medium",
            color: "#e0e7ff",
            textShadow: "1px 1px 4px rgba(110, 142, 251, 0.6)",
            fontSize: { xs: "1rem", sm: "1.25rem" },
            letterSpacing: "1px",
          }}
        >
          The Ultimate Converter
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
                  "&:hover": { backgroundColor: "#f0f0f0", boxShadow: "0 0 15px rgba(110, 142, 251, 0.7)" },
                  borderRadius: "20px",
                  px: 3,
                  transition: "box-shadow 0.3s ease",
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
                  "&:hover": { backgroundColor: "#f0f0f0", boxShadow: "0 0 15px rgba(167, 119, 227, 0.7)" },
                  borderRadius: "20px",
                  px: 3,
                  transition: "box-shadow 0.3s ease",
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
                  "&:hover": { backgroundColor: "#f0f0f0", boxShadow: "0 0 15px rgba(123, 94, 233, 0.7)" },
                  borderRadius: "20px",
                  px: 3,
                  transition: "box-shadow 0.3s ease",
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
                  "&:hover": { backgroundColor: "#f0f0f0", boxShadow: "0 0 15px rgba(94, 137, 233, 0.7)" },
                  borderRadius: "20px",
                  px: 3,
                  transition: "box-shadow 0.3s ease",
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
                  "&:hover": { backgroundColor: "#f0f0f0", boxShadow: "0 0 15px rgba(255, 152, 0, 0.7)" },
                  borderRadius: "20px",
                  px: 3,
                  transition: "box-shadow 0.3s ease",
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
                  "&:hover": { backgroundColor: "#f0f0f0", boxShadow: "0 0 15px rgba(76, 175, 80, 0.7)" },
                  borderRadius: "20px",
                  px: 3,
                  transition: "box-shadow 0.3s ease",
                }}
                onClick={() => setOpenMergeModal(true)}
              >
                Merge Now
              </Button>
            </CardActions>
          </CoolCard>
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
                  "&:hover": { backgroundColor: "#f0f0f0", boxShadow: "0 0 15px rgba(244, 67, 54, 0.7)" },
                  borderRadius: "20px",
                  px: 3,
                  transition: "box-shadow 0.3s ease",
                }}
                onClick={() => setOpenSplitModal(true)}
              >
                Split Now
              </Button>
            </CardActions>
          </CoolCard>
          <CoolCard>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Rearrange PDF
              </Typography>
              <Typography variant="body2">
                Reorder pages in your PDF as desired.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", pb: 2 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#fff",
                  color: "#2196f3",
                  "&:hover": { backgroundColor: "#f0f0f0", boxShadow: "0 0 15px rgba(33, 150, 243, 0.7)" },
                  borderRadius: "20px",
                  px: 3,
                  transition: "box-shadow 0.3s ease",
                }}
                onClick={() => setOpenRearrangeModal(true)}
              >
                Rearrange Now
              </Button>
            </CardActions>
          </CoolCard>
        </Box>
      </Box>

      {/* Modals */}
      <Modal open={openPdfModal} onClose={() => { setOpenPdfModal(false); setPdfFile(null); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Upload PDF File
          </Typography>
          <input id="pdfFileInput" type="file" accept="application/pdf" onChange={handlePdfFileChangeBasic} style={{ display: "none" }} />
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileUploadIcon />}
            onClick={handlePdfUploadClick}
            sx={{ mb: 2, borderRadius: "20px", borderColor: "#6e8efb", color: "#6e8efb", "&:hover": { borderColor: "#5a78e0", boxShadow: "0 0 10px rgba(110, 142, 251, 0.5)" } }}
          >
            Upload PDF
          </Button>
          {pdfFile && <Typography variant="body1" sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}>📄 {pdfFile.name}</Typography>}
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleConvertPdfToDocx}
            disabled={loading || !pdfFile}
            sx={{ mt: 2, borderRadius: "20px", background: "linear-gradient(90deg, #6e8efb 0%, #a777e3 100%)", "&:hover": { background: "linear-gradient(90deg, #5a78e0 0%, #9366d2 100%)", boxShadow: "0 0 15px rgba(110, 142, 251, 0.7)" } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Convert to DOCX"}
          </Button>
        </ModalBox>
      </Modal>

      <Modal open={openDocxModal} onClose={() => { setOpenDocxModal(false); setDocxFile(null); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
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
            sx={{ mb: 2, borderRadius: "20px", borderColor: "#a777e3", color: "#a777e3", "&:hover": { borderColor: "#9366d2", boxShadow: "0 0 10px rgba(167, 119, 227, 0.5)" } }}
          >
            Upload DOCX
          </Button>
          {docxFile && <Typography variant="body1" sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}>📄 {docxFile.name}</Typography>}
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleConvertDocxToPdf}
            disabled={loading || !docxFile}
            sx={{ mt: 2, borderRadius: "20px", background: "linear-gradient(90deg, #a777e3 0%, #6e8efb 100%)", "&:hover": { background: "linear-gradient(90deg, #9366d2 0%, #5a78e0 100%)", boxShadow: "0 0 15px rgba(167, 119, 227, 0.7)" } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Convert to PDF"}
          </Button>
        </ModalBox>
      </Modal>

      <Modal open={openPptxModal} onClose={() => { setOpenPptxModal(false); setPptxFile(null); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Upload PPTX File
          </Typography>
          <input
            id="pptxFileInput"
            type="file"
            accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handlePptxFileChange}
            style={{ display: "none" }}
          />
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileUploadIcon />}
            onClick={handlePptxUploadClick}
            sx={{ mb: 2, borderRadius: "20px", borderColor: "#7b5ee9", color: "#7b5ee9", "&:hover": { borderColor: "#694dd8", boxShadow: "0 0 10px rgba(123, 94, 233, 0.5)" } }}
          >
            Upload PPTX
          </Button>
          {pptxFile && <Typography variant="body1" sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}>📄 {pptxFile.name}</Typography>}
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleConvertPptxToPdf}
            disabled={loading || !pptxFile}
            sx={{ mt: 2, borderRadius: "20px", background: "linear-gradient(90deg, #7b5ee9 0%, #6e8efb 100%)", "&:hover": { background: "linear-gradient(90deg, #694dd8 0%, #5a78e0 100%)", boxShadow: "0 0 15px rgba(123, 94, 233, 0.7)" } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Convert to PDF"}
          </Button>
        </ModalBox>
      </Modal>

      <Modal open={openVideoModal} onClose={() => { setOpenVideoModal(false); setVideoFile(null); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Upload Video File
          </Typography>
          <input
            id="videoFileInput"
            type="file"
            accept="video/mp4,video/avi,video/mpeg,video/quicktime"
            onChange={handleVideoFileChange}
            style={{ display: "none" }}
          />
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileUploadIcon />}
            onClick={handleVideoUploadClick}
            sx={{ mb: 2, borderRadius: "20px", borderColor: "#5e89e9", color: "#5e89e9", "&:hover": { borderColor: "#4d78d8", boxShadow: "0 0 10px rgba(94, 137, 233, 0.5)" } }}
          >
            Upload Video
          </Button>
          {videoFile && <Typography variant="body1" sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}>🎥 {videoFile.name}</Typography>}
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleConvertVideoToAudio}
            disabled={loading || !videoFile}
            sx={{ mt: 2, borderRadius: "20px", background: "linear-gradient(90deg, #5e89e9 0%, #a777e3 100%)", "&:hover": { background: "linear-gradient(90deg, #4d78d8 0%, #9366d2 100%)", boxShadow: "0 0 15px rgba(94, 137, 233, 0.7)" } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Convert to MP3"}
          </Button>
        </ModalBox>
      </Modal>

      <Modal open={openSummaryModal} onClose={() => { setOpenSummaryModal(false); setFileForSummary(null); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Upload Document (PDF or Image)
          </Typography>
          <input
            id="summaryFileInput"
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/jpg"
            onChange={handleSummaryFileChange}
            style={{ display: "none" }}
          />
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileUploadIcon />}
            onClick={handleSummaryUploadClick}
            sx={{ mb: 2, borderRadius: "20px", borderColor: "#ff9800", color: "#ff9800", "&:hover": { borderColor: "#f57c00", boxShadow: "0 0 10px rgba(255, 152, 0, 0.5)" } }}
          >
            Upload Document
          </Button>
          {fileForSummary && <Typography variant="body1" sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}>📄 {fileForSummary.name}</Typography>}
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleSummarize}
            disabled={loading || !fileForSummary}
            sx={{ mt: 2, mb: 2, borderRadius: "20px", background: "linear-gradient(90deg, #ff9800 0%, #ffca28 100%)", "&:hover": { background: "linear-gradient(90deg, #f57c00 0%, #ffb300 100%)", boxShadow: "0 0 15px rgba(255, 152, 0, 0.7)" } }}
          >
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
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#3f51b5" }}>
                Original
              </Typography>
              {summaryData.original.map((para, index) => (
                <Typography key={index} variant="body2" sx={{ mt: 1, color: "#555" }}>
                  {para}
                </Typography>
              ))}
            </Box>
            <Box sx={{ flex: 1, background: "#fff", p: 2, borderRadius: "12px", border: "1px solid #ddd", position: "relative" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#3f51b5" }}>
                Summary
              </Typography>
              {summaryData.summary.map((sum, index) => (
                <Typography key={index} variant="body2" sx={{ mt: 1, color: "#555" }}>
                  {sum}
                </Typography>
              ))}
              <IconButton
                onClick={handleCopySummary}
                sx={{ position: "absolute", top: 8, right: 8, color: "#ff9800", "&:hover": { color: "#f57c00" } }}
                aria-label="copy summary"
              >
                <ContentCopyIcon />
              </IconButton>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleBackToUpload}
            sx={{ mt: 2, borderRadius: "20px", borderColor: "#ff9800", color: "#ff9800", "&:hover": { borderColor: "#f57c00", boxShadow: "0 0 10px rgba(255, 152, 0, 0.5)" } }}
          >
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
              <input id={`mergeFileInput-${index}`} type="file" accept="application/pdf" onChange={handlePdfFileChange(index)} style={{ display: "none" }} />
              <Button
                variant="outlined"
                color="primary"
                startIcon={<FileUploadIcon />}
                onClick={handleMergeUploadClick(index)}
                sx={{ mr: 2, borderRadius: "20px", borderColor: "#4caf50", color: "#4caf50", "&:hover": { borderColor: "#388e3c", boxShadow: "0 0 10px rgba(76, 175, 80, 0.5)" } }}
              >
                {file ? "Replace PDF" : `Upload PDF ${index + 1}`}
              </Button>
              {file && <Typography variant="body1" sx={{ color: "#555", wordBreak: "break-word" }}>📄 {file.name}</Typography>}
            </Box>
          ))}
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleAddMorePdf}
            sx={{ mb: 2, borderRadius: "20px", borderColor: "#4caf50", color: "#4caf50", "&:hover": { borderColor: "#388e3c", boxShadow: "0 0 10px rgba(76, 175, 80, 0.5)" } }}
          >
            Add More PDFs
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleMergePdfs}
            disabled={loading || pdfFilesToMerge.filter((file) => file !== null).length < 2}
            sx={{ mt: 2, borderRadius: "20px", background: "linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)", "&:hover": { background: "linear-gradient(90deg, #388e3c 0%, #43a047 100%)", boxShadow: "0 0 15px rgba(76, 175, 80, 0.7)" } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Merge PDFs"}
          </Button>
        </ModalBox>
      </Modal>

      <Modal open={openSplitModal} onClose={() => { setOpenSplitModal(false); setSplitFile(null); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Upload PDF to Split
          </Typography>
          <input id="splitFileInput" type="file" accept="application/pdf" onChange={handleSplitFileChange} style={{ display: "none" }} />
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileUploadIcon />}
            onClick={handleSplitUploadClick}
            sx={{ mb: 2, borderRadius: "20px", borderColor: "#f44336", color: "#f44336", "&:hover": { borderColor: "#d32f2f", boxShadow: "0 0 10px rgba(244, 67, 54, 0.5)" } }}
          >
            Upload PDF
          </Button>
          {splitFile && <Typography variant="body1" sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}>📄 {splitFile.name}</Typography>}
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleSplitPdf}
            disabled={loading || !splitFile}
            sx={{ mt: 2, borderRadius: "20px", background: "linear-gradient(90deg, #f44336 0%, #ef5350 100%)", "&:hover": { background: "linear-gradient(90deg, #d32f2f 0%, #e53935 100%)", boxShadow: "0 0 15px rgba(244, 67, 54, 0.7)" } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Split PDF"}
          </Button>
        </ModalBox>
      </Modal>

      <Modal open={openSplitViewModal} onClose={() => { setOpenSplitViewModal(false); setSplitPages([]); setSplitFile(null); }}>
        <SplitModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Split PDF Pages
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", mt: 2 }}>
            {splitPages.map((page, index) => (
              <Box key={index} sx={{ position: "relative", width: 200, height: 280, border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
                <iframe src={page.url} title={`Page ${page.pageNumber}`} width="100%" height="100%" style={{ border: "none" }} />
                <IconButton
                  onClick={() => handleDeletePage(index)}
                  sx={{ position: "absolute", top: 8, right: 8, color: "#f44336", backgroundColor: "rgba(255, 255, 255, 0.8)", "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)", color: "#d32f2f" } }}
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
            sx={{ mt: 3, borderRadius: "20px", background: "linear-gradient(90deg, #f44336 0%, #ef5350 100%)", "&:hover": { background: "linear-gradient(90deg, #d32f2f 0%, #e53935 100%)", boxShadow: "0 0 15px rgba(244, 67, 54, 0.7)" } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Save Modified PDF"}
          </Button>
        </SplitModalBox>
      </Modal>

      <Modal open={openRearrangeModal} onClose={() => { setOpenRearrangeModal(false); setRearrangeFile(null); }}>
        <ModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Upload PDF to Rearrange
          </Typography>
          <input id="rearrangeFileInput" type="file" accept="application/pdf" onChange={handleRearrangeFileChange} style={{ display: "none" }} />
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileUploadIcon />}
            onClick={handleRearrangeUploadClick}
            sx={{ mb: 2, borderRadius: "20px", borderColor: "#2196f3", color: "#2196f3", "&:hover": { borderColor: "#1976d2", boxShadow: "0 0 10px rgba(33, 150, 243, 0.5)" } }}
          >
            Upload PDF
          </Button>
          {rearrangeFile && <Typography variant="body1" sx={{ mt: 2, color: "#555", wordBreak: "break-word" }}>📄 {rearrangeFile.name}</Typography>}
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handlePreviewRearrangePdf}
            disabled={loading || !rearrangeFile}
            sx={{ mt: 2, borderRadius: "20px", background: "linear-gradient(90deg, #2196f3 0%, #42a5f5 100%)", "&:hover": { background: "linear-gradient(90deg, #1976d2 0%, #2196f3 100%)", boxShadow: "0 0 15px rgba(33, 150, 243, 0.7)" } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Preview Pages"}
          </Button>
        </ModalBox>
      </Modal>

      <Modal open={openRearrangeViewModal} onClose={() => { setOpenRearrangeViewModal(false); setRearrangePages([]); setRearrangeFile(null); }}>
        <SplitModalBox>
          <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Rearrange PDF Pages
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
            Use the arrow buttons to move pages left or right.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", mt: 2 }}>
            {rearrangePages.map((page, index) => (
              <Box key={index} sx={{ position: "relative", width: 200, height: 280, border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
                <iframe src={page.url} title={`Page ${page.pageNumber}`} width="100%" height="100%" style={{ border: "none" }} />
                <Box sx={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 1, backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: "4px", p: 0.5 }}>
                  <IconButton
                    onClick={() => handleMovePage(index, "left")}
                    disabled={index === 0}
                    sx={{ color: index === 0 ? "#ccc" : "#2196f3", "&:hover": { color: index === 0 ? "#ccc" : "#1976d2" } }}
                    aria-label={`move page ${page.pageNumber} left`}
                  >
                    <ArrowLeftIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleMovePage(index, "right")}
                    disabled={index === rearrangePages.length - 1}
                    sx={{ color: index === rearrangePages.length - 1 ? "#ccc" : "#2196f3", "&:hover": { color: index === rearrangePages.length - 1 ? "#ccc" : "#1976d2" } }}
                    aria-label={`move page ${page.pageNumber} right`}
                  >
                    <ArrowRightIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRearrangePdf}
            disabled={loading || rearrangePages.length === 0}
            sx={{ mt: 3, borderRadius: "20px", background: "linear-gradient(90deg, #2196f3 0%, #42a5f5 100%)", "&:hover": { background: "linear-gradient(90deg, #1976d2 0%, #2196f3 100%)", boxShadow: "0 0 15px rgba(33, 150, 243, 0.7)" } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Save Rearranged PDF"}
          </Button>
        </SplitModalBox>
      </Modal>

      {/* Footer */}
      <FooterBox isVisible={footerVisible}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <IconButton href="https://www.linkedin.com/in/ashish-goswami-58797a24a/" get="_blank" sx={{ color: "#fff", "&:hover": { color: "#0a66c2" } }}>
              <LinkedInIcon />
            </IconButton>
            <IconButton href="https://github.com/Ashish6298" target="_blank" sx={{ color: "#fff", "&:hover": { color: "#333" } }}>
              <GitHubIcon />
            </IconButton>
            <IconButton href="https://www.instagram.com/a.s.h.i.s.h__g.o.s.w.a.m.i/" target="_blank" sx={{ color: "#fff", "&:hover": { color: "#e4405f" } }}>
              <InstagramIcon />
            </IconButton>
            <IconButton href="ashishgoswami1013@gmail.com" sx={{ color: "#fff", "&:hover": { color: "#ff9800" } }}>
              <EmailIcon />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          © {new Date().getFullYear()} Ashish Goswami. All rights reserved.
        </Typography>
      </FooterBox>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </Box>
  );
};

export default UploadFile;