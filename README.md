# 🚀 FileForge: The Ultimate File Conversion & Manipulation Suite

Welcome to **FileForge**, a cutting-edge, futuristic backend solution built to transform, summarize, merge, split, and rearrange your documents and media files with unparalleled ease. Powered by modern Node.js technologies and infused with AI-driven capabilities, FileForge is your portal to a seamless file-handling experience. Whether you're converting PDFs to DOCX, extracting audio from videos, or summarizing lengthy documents, FileForge has you covered—fast, secure, and futuristic.

---

## 🌌 Features That Redefine File Management

- **File Conversions**  
  - Convert PDFs to DOCX with intelligent text parsing.  
  - Transform DOCX to PDFs effortlessly.  
  - Turn PPT/PPTX presentations into sleek PDFs.  
  - Extract audio (MP3) from videos (MP4, AVI, MOV, MPEG).  

- **PDF Superpowers**  
  - **Merge**: Combine multiple PDFs into a single, optimized file.  
  - **Split**: Divide PDFs into manageable halves.  
  - **Rearrange**: Reorder PDF pages with precision and ease.  

- **AI-Powered Summarization**  
  - Summarize PDFs and images (PNG/JPEG) using the Gemini API.  
  - Extract meaningful insights from lengthy documents in seconds.  

- **Robust & Scalable**  
  - Built with Express.js, Multer, and FFmpeg for high-performance file processing.  
  - Handles files up to 50MB with strict MIME-type validation.  

- **Futuristic Design**  
  - Clean, modular code structure with detailed logging for debugging.  
  - Environment variable support via `.env` for secure configuration.  

---

## 🛠️ Tech Stack

- **Node.js & Express**: Lightning-fast server framework.  
- **Multer**: Seamless file uploads with disk/memory storage.  
- **FFmpeg**: Video-to-audio conversion powerhouse.  
- **PDFKit & pdf-lib**: Advanced PDF manipulation tools.  
- **Tesseract.js**: OCR for image-to-text extraction.  
- **Gemini API**: AI-driven summarization magic.  
- **docx & docx-pdf**: Word document handling and conversion.  
- **unzipper & xml2js**: PPTX parsing and conversion.  
- **CORS**: Cross-origin resource sharing for modern web apps.  

---

## 🌠 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)  
- **npm** (v8 or higher)  
- **FFmpeg** (installed globally or via `@ffmpeg-installer/ffmpeg`)  
- A **Gemini API Key** (for summarization features)  

### Installation
1. **Clone the Repository**  
   ```bash
   git clone https://github.com/Ashish6298/FileForge
   cd FileForge
   ```

2. **Install Dependencies**  
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**  
   Create a `.env` file in the root directory and add:  
   ```
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the Server**  
   ```bash
   npm start
   ```
   Your server will launch at `http://localhost:5000`. Prepare for liftoff! 🚀

---

## Deployed Link

https://file-forge-livid.vercel.app/

---

## 🔒 Security & Limits

- **File Size Limits**:  
  - PDFs/DOCX/PPTX: 10MB  
  - Videos: 50MB  
- **Allowed Formats**: Strictly enforced via MIME-type checks.  
- **Temporary Files**: Automatically deleted after processing.  
- **CORS Enabled**: Secure cross-origin requests.  

---

## 🌟 Why FileForge?

- **Efficiency**: Process files in milliseconds with optimized workflows.  
- **Versatility**: Handles documents, presentations, videos, and images.  
- **AI Integration**: Summarization powered by state-of-the-art Gemini API.  
- **Future-Ready**: Modular design for easy feature expansion.  

---

## 🤝 Contributing

We welcome contributions from the galaxy! To contribute:  
1. Fork the repo.  
2. Create a feature branch (`git checkout -b feature/awesome-idea`).  
3. Commit your changes (`git commit -m "Add awesome idea"`).  
4. Push to the branch (`git push origin feature/awesome-idea`).  
5. Open a Pull Request.  

---

## 🌍 License

FileForge is licensed under the MIT License. Explore, modify, and distribute freely—let’s build the future together!

---

**FileForge: Where Files Meet the Future.**  
Created with ❤️ by [Ashish Goswami]

--- 
