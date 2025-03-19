// server.js

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const cors = require("cors");
const docxConverter = require("docx-pdf");
const unzipper = require("unzipper");
const xml2js = require("xml2js");
const PDFDocument = require("pdfkit");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");
const Tesseract = require("tesseract.js");
const dotenv = require("dotenv");
const { PDFDocument: PDFLibDocument } = require("pdf-lib");

// Load environment variables
dotenv.config();

// Set FFmpeg path explicitly
ffmpeg.setFfmpegPath("D:\\ffmpeg-2025-02-06-git-6da82b4485-full_build\\ffmpeg-2025-02-06-git-6da82b4485-full_build\\bin\\ffmpeg.exe");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage configuration for disk (used for conversions and merging)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    cb(null, `${originalName}_${Date.now()}${extension}`);
  },
});

// Multer storage configuration for memory (used for summarization)
const memoryStorage = multer.memoryStorage();

// Multer upload middleware for PDF (disk, single file for conversions)
const uploadPdfSingle = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) return cb(new Error("Only PDF files are allowed"));
    cb(null, true);
  },
});

// Multer upload middleware for multiple PDFs (disk, for merging)
const uploadPdfMultiple = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) return cb(new Error("Only PDF files are allowed"));
    cb(null, true);
  },
}).array("pdfFiles", 10);

// Multer upload middleware for DOCX (disk)
const uploadDocx = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!allowedTypes.includes(file.mimetype)) return cb(new Error("Only DOCX files are allowed"));
    cb(null, true);
  },
});

// Multer upload middleware for PPT/PPTX (disk)
const uploadPptx = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    if (!allowedTypes.includes(file.mimetype)) return cb(new Error("Only PPT/PPTX files are allowed"));
    cb(null, true);
  },
});

// Multer upload middleware for Video (disk)
const uploadVideo = multer({
  storage: diskStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["video/mp4", "video/avi", "video/mpeg", "video/quicktime"];
    if (!allowedTypes.includes(file.mimetype)) return cb(new Error("Only video files (MP4, AVI, MPEG, MOV) are allowed"));
    cb(null, true);
  },
});

// Multer upload middleware for Summarization (memory)
const uploadSummary = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) return cb(new Error("Only PDF or image files (PNG, JPEG, JPG) are allowed"));
    cb(null, true);
  },
});

// Multer upload middleware for Split PDF (disk, single file)
const uploadSplitPdf = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) return cb(new Error("Only PDF files are allowed"));
    cb(null, true);
  },
});

// Multer upload middleware for Rearrange PDF (disk, single file)
const uploadRearrangePdf = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) return cb(new Error("Only PDF files are allowed"));
    cb(null, true);
  },
});

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Function to convert PDF to DOCX
const convertPdfToDocx = async (pdfPath) => {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log("✅ PDF file read successfully, size:", pdfBuffer.length);

    const data = await pdfParse(pdfBuffer);
    console.log("✅ PDF parsed successfully, text length:", data.text.length);

    const lines = data.text.split("\n").map((line) => {
      if (line.includes("---")) {
        return new Paragraph({
          children: [new TextRun("----------------------------")],
          spacing: { after: 200 },
        });
      } else if (line.match(/^[0-9]\./)) {
        return new Paragraph({
          children: [new TextRun({ text: line, bold: true })],
          spacing: { after: 100 },
        });
      } else if (line.trim() === "") {
        return new Paragraph({ children: [] });
      } else {
        return new Paragraph({
          children: [new TextRun(line)],
          spacing: { after: 100 },
        });
      }
    });

    const doc = new Document({
      sections: [{ properties: {}, children: lines }],
    });

    const docBuffer = await Packer.toBuffer(doc);
    console.log("✅ DOCX buffer created, size:", docBuffer.length);

    return docBuffer;
  } catch (error) {
    console.error("❌ Error in convertPdfToDocx:", error.message, error.stack);
    throw error;
  } finally {
    fs.unlinkSync(pdfPath);
    console.log("✅ Uploaded PDF file deleted");
  }
};

// Function to convert DOCX to PDF
const convertDocxToPdf = async (docxPath) => {
  let outputPath = path.join(uploadDir, `${path.parse(docxPath).name}.pdf`);
  try {
    await new Promise((resolve, reject) => {
      docxConverter(docxPath, outputPath, (err) => {
        if (err) {
          console.error("❌ Error converting DOCX to PDF:", err);
          reject(err);
        } else {
          console.log("✅ DOCX converted to PDF successfully");
          resolve();
        }
      });
    });

    const pdfBuffer = fs.readFileSync(outputPath);
    console.log("✅ PDF buffer created, size:", pdfBuffer.length);

    return pdfBuffer;
  } catch (error) {
    console.error("❌ Error in convertDocxToPdf:", error.message, error.stack);
    throw error;
  } finally {
    fs.unlinkSync(docxPath);
    console.log("✅ Uploaded DOCX file deleted");
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
      console.log("✅ Temporary PDF file deleted");
    }
  }
};

// Function to convert PPTX to PDF
const convertPptxToPdf = async (pptxPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      const pptxBuffer = fs.readFileSync(pptxPath);
      console.log("✅ PPTX file read successfully, size:", pptxBuffer.length);

      const directory = await unzipper.Open.buffer(pptxBuffer);
      const slidesText = [];

      for (const file of directory.files) {
        if (file.path.match(/^ppt\/slides\/slide\d+\.xml$/)) {
          const content = await file.buffer();
          const parser = new xml2js.Parser({ explicitArray: false });
          const result = await parser.parseStringPromise(content);

          const textElements = [];
          const shapes = result["p:sld"]["p:cSld"]["p:spTree"]["p:sp"];
          const shapesArray = Array.isArray(shapes) ? shapes : [shapes];

          shapesArray.forEach((shape) => {
            if (shape["p:txBody"]) {
              const paragraphs = shape["p:txBody"]["a:p"];
              const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
              paragraphsArray.forEach((p) => {
                const runs = p["a:r"];
                if (runs) {
                  const runsArray = Array.isArray(runs) ? runs : [runs];
                  runsArray.forEach((r) => {
                    if (r["a:t"]) {
                      textElements.push(r["a:t"]);
                    }
                  });
                }
              });
            }
          });

          slidesText.push(textElements.join("\n"));
        }
      }

      console.log("✅ PPTX text extracted, slides count:", slidesText.length);

      const doc = new PDFDocument({ size: "A4" });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        console.log("✅ PPTX converted to PDF successfully, size:", pdfBuffer.length);
        resolve(pdfBuffer);
      });
      doc.on("error", (err) => reject(err));

      slidesText.forEach((slideText, index) => {
        if (index > 0) doc.addPage();
        doc.fontSize(12).text(slideText || "No text on this slide", 50, 50, { width: 495 });
      });

      doc.end();
    } catch (error) {
      console.error("❌ Error in convertPptxToPdf:", error.message, error.stack);
      reject(error);
    } finally {
      fs.unlinkSync(pptxPath);
      console.log("✅ Uploaded PPTX file deleted");
    }
  });
};

// Function to convert Video to Audio
const convertVideoToAudio = async (videoPath) => {
  const outputPath = path.join(uploadDir, `${path.parse(videoPath).name}.mp3`);
  return new Promise((resolve, reject) => {
    try {
      console.log("✅ Video file read successfully, path:", videoPath);

      ffmpeg(videoPath)
        .noVideo()
        .audioCodec("libmp3lame")
        .output(outputPath)
        .on("end", () => {
          console.log("✅ Video converted to audio successfully");
          const audioBuffer = fs.readFileSync(outputPath);
          console.log("✅ Audio buffer created, size:", audioBuffer.length);

          fs.unlinkSync(videoPath);
          console.log("✅ Uploaded video file deleted");
          fs.unlinkSync(outputPath);
          console.log("✅ Temporary audio file deleted");

          resolve(audioBuffer);
        })
        .on("error", (err) => {
          console.error("❌ Error converting video to audio:", err.message);
          reject(err);
          if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
            console.log("✅ Uploaded video file deleted (on error)");
          }
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            console.log("✅ Temporary audio file deleted (on error)");
          }
        })
        .run();
    } catch (error) {
      console.error("❌ Error in convertVideoToAudio:", error.message, error.stack);
      reject(error);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
        console.log("✅ Uploaded video file deleted (on early error)");
      }
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
        console.log("✅ Temporary audio file deleted (on early error)");
      }
    }
  });
};

// Function to summarize paragraphs using Gemini API
async function summarizeParagraphs(paragraphs) {
  const summaries = [];

  const MAX_TEXT_LENGTH = 10000;

  for (const para of paragraphs) {
    try {
      let textToSummarize = para;
      if (textToSummarize.length > MAX_TEXT_LENGTH) {
        const chunks = [];
        for (let i = 0; i < textToSummarize.length; i += MAX_TEXT_LENGTH) {
          chunks.push(textToSummarize.slice(i, i + MAX_TEXT_LENGTH));
        }

        let combinedSummary = "";
        for (const chunk of chunks) {
          const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
            {
              contents: [{ parts: [{ text: `Summarize this text:\n\n${chunk}` }] }],
            },
            {
              headers: { "Content-Type": "application/json" },
              params: { key: process.env.GEMINI_API_KEY },
            }
          );

          const summary = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available";
          combinedSummary += summary + " ";
        }
        summaries.push(combinedSummary.trim());
      } else {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
          {
            contents: [{ parts: [{ text: `Summarize this paragraph:\n\n${textToSummarize}` }] }],
          },
          {
            headers: { "Content-Type": "application/json" },
            params: { key: process.env.GEMINI_API_KEY },
          }
        );

        const summary = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available";
        summaries.push(summary);
      }
    } catch (error) {
      console.error("❌ Gemini API Error:", error.response?.data || error.message);
      summaries.push("Error summarizing this paragraph");
    }
  }

  return summaries;
}

// Function to merge PDFs
const mergePdfs = async (pdfPaths) => {
  try {
    const mergedPdf = await PDFLibDocument.create();
    console.log("✅ Initialized merged PDF document");

    for (const pdfPath of pdfPaths) {
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdf = await PDFLibDocument.load(pdfBytes);
      console.log(`✅ Loaded PDF: ${pdfPath}, pages: ${pdf.getPageCount()}`);

      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      console.log(`✅ Copied ${copiedPages.length} pages to merged document`);
    }

    mergedPdf.setProducer("xAI Grok 3 - PDF Merger");
    mergedPdf.setCreator("xAI Grok 3");

    const mergedPdfBytes = await mergedPdf.save({
      useObjectStreams: true,
      updateFieldAppearances: false,
      compress: true,
      embedFonts: false,
    });
    console.log("✅ Merged PDF created and compressed, size:", mergedPdfBytes.length);

    pdfPaths.forEach((path) => {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
        console.log(`✅ Temporary PDF deleted: ${path}`);
      }
    });

    return mergedPdfBytes;
  } catch (error) {
    console.error("❌ Error in mergePdfs:", error.message, error.stack);
    throw error;
  }
};

// Function to split PDF (returns first half of pages as a single PDF)
const splitPdf = async (pdfPath) => {
  try {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFLibDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();
    console.log(`✅ Loaded PDF for splitting: ${pdfPath}, pages: ${totalPages}`);

    if (totalPages <= 1) {
      throw new Error("PDF must have more than one page to split");
    }

    const splitPoint = Math.ceil(totalPages / 2);
    const newPdf = await PDFLibDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, Array.from({ length: splitPoint }, (_, i) => i));
    copiedPages.forEach((page) => newPdf.addPage(page));
    console.log(`✅ Split PDF to first ${splitPoint} pages`);

    const splitPdfBytes = await newPdf.save({
      useObjectStreams: true,
      updateFieldAppearances: false,
      compress: true,
    });
    console.log("✅ Split PDF created, size:", splitPdfBytes.length);

    fs.unlinkSync(pdfPath);
    console.log("✅ Uploaded PDF file deleted");

    return splitPdfBytes;
  } catch (error) {
    console.error("❌ Error in splitPdf:", error.message, error.stack);
    throw error;
  }
};

// Function to rearrange PDF pages
const rearrangePdfPages = async (pdfPath, pageOrder) => {
  try {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFLibDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();
    console.log(`✅ Loaded PDF for rearrangement: ${pdfPath}, pages: ${totalPages}`);

    // Validate page order
    const pageNumbers = pageOrder.split(',').map(num => parseInt(num.trim()) - 1); // Convert to 0-based index
    if (pageNumbers.length !== totalPages) {
      throw new Error(`Invalid page order: must specify exactly ${totalPages} pages`);
    }
    
    const uniquePages = new Set(pageNumbers);
    if (uniquePages.size !== totalPages || 
        Math.min(...pageNumbers) < 0 || 
        Math.max(...pageNumbers) >= totalPages) {
      throw new Error(`Invalid page order: must contain unique numbers from 1 to ${totalPages}`);
    }

    // Create new PDF with rearranged pages
    const newPdf = await PDFLibDocument.create();
    const pages = await pdfDoc.getPages();
    const rearrangedPages = pageNumbers.map(index => pages[index]);
    
    // Add pages in new order
    const copiedPages = await newPdf.copyPages(pdfDoc, pageNumbers);
    copiedPages.forEach((page) => newPdf.addPage(page));
    console.log(`✅ Rearranged ${totalPages} pages in new order: ${pageOrder}`);

    newPdf.setProducer("xAI Grok 3 - PDF Rearranger");
    newPdf.setCreator("xAI Grok 3");

    const rearrangedPdfBytes = await newPdf.save({
      useObjectStreams: true,
      updateFieldAppearances: false,
      compress: true,
    });
    console.log("✅ Rearranged PDF created, size:", rearrangedPdfBytes.length);

    fs.unlinkSync(pdfPath);
    console.log("✅ Uploaded PDF file deleted");

    return rearrangedPdfBytes;
  } catch (error) {
    console.error("❌ Error in rearrangePdfPages:", error.message, error.stack);
    throw error;
  }
};

// Routes
app.post("/convert/pdf-to-docx", uploadPdfSingle.single("pdfFile"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  console.log("Uploaded file:", req.file);

  try {
    const docxBuffer = await convertPdfToDocx(req.file.path);
    const originalName = path.parse(req.file.originalname).name;

    res.setHeader("Content-Disposition", `attachment; filename="${originalName}.docx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(docxBuffer);
  } catch (error) {
    console.error("❌ Error in /convert/pdf-to-docx route:", error.message);
    res.status(500).json({ error: "Failed to convert PDF", details: error.message });
  }
});

app.post("/convert/docx-to-pdf", uploadDocx.single("docxFile"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  console.log("Uploaded file:", req.file);

  try {
    const pdfBuffer = await convertDocxToPdf(req.file.path);
    const originalName = path.parse(req.file.originalname).name;

    res.setHeader("Content-Disposition", `attachment; filename="${originalName}.pdf"`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ Error in /convert/docx-to-pdf route:", error.message);
    res.status(500).json({ error: "Failed to convert DOCX", details: error.message });
  }
});

app.post("/convert/pptx-to-pdf", uploadPptx.single("pptxFile"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  console.log("Uploaded file:", req.file);

  try {
    const pdfBuffer = await convertPptxToPdf(req.file.path);
    const originalName = path.parse(req.file.originalname).name;

    res.setHeader("Content-Disposition", `attachment; filename="${originalName}.pdf"`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ Error in /convert/pptx-to-pdf route:", error.message);
    res.status(500).json({ error: "Failed to convert PPTX", details: error.message });
  }
});

app.post("/convert/video-to-audio", uploadVideo.single("videoFile"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  console.log("Uploaded file:", req.file);

  try {
    const audioBuffer = await convertVideoToAudio(req.file.path);
    const originalName = path.parse(req.file.originalname).name;

    res.setHeader("Content-Disposition", `attachment; filename="${originalName}.mp3"`);
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audioBuffer);
  } catch (error) {
    console.error("❌ Error in /convert/video-to-audio route:", error.message);
    res.status(500).json({ error: "Failed to convert video to audio", details: error.message });
  }
});

app.post("/summarize", uploadSummary.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  console.log(`📂 File received: ${req.file.originalname}`);

  let extractedText = "";

  try {
    if (req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
      console.log(`📄 Extracted text from PDF (${pdfData.numpages} pages), length: ${extractedText.length}`);
    } else if (req.file.mimetype.startsWith("image/")) {
      const { data: { text } } = await Tesseract.recognize(req.file.buffer, "eng");
      extractedText = text;
      console.log("📄 Extracted text from image, length:", extractedText.length);
    } else {
      return res.status(400).json({ error: "Unsupported file type. Upload PDF or Image." });
    }

    const paragraphs = extractedText
      .split(/\n\s*\n+/)
      .map((p) => p.replace(/\n/g, " ").trim())
      .filter((p) => p.length > 50);

    if (paragraphs.length === 0) {
      return res.status(400).json({ error: "No meaningful paragraphs found in the document" });
    }

    console.log(`📑 Detected ${paragraphs.length} paragraphs`);

    const summarizedParagraphs = await summarizeParagraphs(paragraphs);
    res.json({ original: paragraphs, summary: summarizedParagraphs });
  } catch (error) {
    console.error("❌ Error processing file:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to summarize document", details: error.message });
  }
});

app.post("/merge-pdfs", uploadPdfMultiple, async (req, res) => {
  if (!req.files || req.files.length < 2) {
    return res.status(400).json({ error: "Please upload at least two PDF files" });
  }

  console.log("Uploaded files:", req.files.map(file => file.originalname));

  try {
    const pdfPaths = req.files.map(file => file.path);
    const mergedPdfBytes = await mergePdfs(pdfPaths);

    const outputFilename = `merged_${new Date().toISOString().split("T")[0]}.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename="${outputFilename}"`);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", mergedPdfBytes.length);

    res.send(Buffer.from(mergedPdfBytes));
  } catch (error) {
    console.error("❌ Error in /merge-pdfs route:", error.message);
    res.status(500).json({ error: "Failed to merge PDFs", details: error.message });
  }
});

app.post("/split-pdf", uploadSplitPdf.single("pdfFile"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  console.log("Uploaded file:", req.file);

  try {
    const splitPdfBytes = await splitPdf(req.file.path);
    const originalName = path.parse(req.file.originalname).name;

    res.setHeader("Content-Disposition", `attachment; filename="${originalName}_split.pdf"`);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", splitPdfBytes.length);

    res.send(Buffer.from(splitPdfBytes));
  } catch (error) {
    console.error("❌ Error in /split-pdf route:", error.message);
    res.status(500).json({ error: "Failed to split PDF", details: error.message });
  }
});

app.post("/rearrange-pdf", uploadRearrangePdf.single("pdfFile"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");
  if (!req.body.pageOrder) return res.status(400).send("Page order is required");

  console.log("Uploaded file:", req.file);
  console.log("Requested page order:", req.body.pageOrder);

  try {
    const rearrangedPdfBytes = await rearrangePdfPages(req.file.path, req.body.pageOrder);
    const originalName = path.parse(req.file.originalname).name;

    res.setHeader("Content-Disposition", `attachment; filename="${originalName}_rearranged.pdf"`);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", rearrangedPdfBytes.length);

    res.send(Buffer.from(rearrangedPdfBytes));
  } catch (error) {
    console.error("❌ Error in /rearrange-pdf route:", error.message);
    res.status(500).json({ error: "Failed to rearrange PDF", details: error.message });
  }
});

// Error handling middleware for Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).send(`Multer error: ${err.message}`);
  } else if (err) {
    return res.status(500).send(`Server error: ${err.message}`);
  }
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});