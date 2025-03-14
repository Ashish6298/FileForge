//server.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const cors = require("cors");
const docxConverter = require("docx-pdf");

// Initialize Express app
const app = express();
const PORT = 5000;

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    cb(null, `${originalName}${extension}`);
  },
});

// Multer upload middleware for PDF
const uploadPdf = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

// Multer upload middleware for DOCX
const uploadDocx = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only DOCX files are allowed"));
    }
    cb(null, true);
  },
});

// Enable CORS
app.use(cors());

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
  let outputPath = path.join(uploadDir, `${path.parse(docxPath).name}.pdf`); // Define outside try block
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
    fs.unlinkSync(docxPath); // Delete uploaded DOCX
    console.log("✅ Uploaded DOCX file deleted");
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath); // Delete temporary PDF only if it exists
      console.log("✅ Temporary PDF file deleted");
    }
  }
};

// Route for PDF to DOCX conversion
app.post("/convert/pdf-to-docx", uploadPdf.single("pdfFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  console.log("Uploaded file:", req.file);

  try {
    const docxBuffer = await convertPdfToDocx(req.file.path);
    const originalName = path.parse(req.file.originalname).name;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${originalName}.docx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    res.send(docxBuffer);
  } catch (error) {
    console.error("❌ Error in /convert/pdf-to-docx route:", error.message);
    res.status(500).json({ error: "Failed to convert PDF", details: error.message });
  }
});

// Route for DOCX to PDF conversion
app.post("/convert/docx-to-pdf", uploadDocx.single("docxFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

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