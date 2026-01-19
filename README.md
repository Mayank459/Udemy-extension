# Udemy Lecture AI Summary Extension

A Chrome extension that automatically generates AI-powered summaries for Udemy video lectures, complete with LaTeX math rendering, code extraction, and key concepts.

## Features

- 🤖 **AI-Powered Summaries**: Automatically generates comprehensive, exam-level explanations of lecture content
- 📐 **LaTeX Math Rendering**: Beautiful rendering of mathematical formulas using KaTeX
- 💻 **Code Extraction**: Automatically extracts and highlights code snippets from lectures
- 🎯 **Key Concepts**: Identifies and lists important concepts from each lecture
- 💾 **Smart Caching**: Instant loading of previously generated summaries
- 🔤 **Font Size Controls**: Adjustable text size for better readability
- 📤 **Export Options**: Export summaries as PDF or Markdown

## Tech Stack

### Frontend (Chrome Extension)
- **Manifest V3** - Modern Chrome extension architecture
- **Content Scripts** - Inject AI Overview tab into Udemy UI
- **marked.js** - Markdown parsing
- **KaTeX** - LaTeX math rendering
- **Prism.js** - Syntax highlighting for code blocks

### Backend (Python/FastAPI)
- **FastAPI** - High-performance async API
- **Groq API** - Fast LLM inference (Llama 3.3 70B)
- **Uvicorn** - ASGI server
- **CORS** - Cross-origin support for extension

## Installation

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/Mayank459/udemy_lecture_ai-summary_extension.git
cd udemy_lecture_ai-summary_extension

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp backend/.env.example backend/.env
# Add your GROQ_API_KEY to backend/.env

# Run the backend server
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Extension Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this repository
5. The extension is now installed!

### 3. Get a Free Groq API Key

1. Visit [https://console.groq.com/](https://console.groq.com/)
2. Sign up for a free account
3. Generate an API key
4. Add it to `backend/.env`:
   ```
   GROQ_API_KEY=your_key_here
   ```

## Usage

1. Navigate to any Udemy course lecture
2. Click on the **"✨ AI Overview"** tab (appears next to Overview, Q&A, etc.)
3. The extension will automatically:
   - Extract the lecture transcript
   - Generate a comprehensive AI summary
   - Render LaTeX formulas
   - Extract code snippets
   - Identify key concepts
4. Use the **A-** and **A+** buttons to adjust font size
5. Click **🔄 Re-generate** to create a fresh summary
6. Export using **📄 PDF** or **📝 Markdown** buttons

## Features in Detail

### AI Summary Generation
- Comprehensive, exam-level explanations
- Step-by-step breakdowns
- Intuitive explanations of complex concepts
- Real-world examples and applications

### LaTeX Math Rendering
- Inline math: `$f(x) = x^2$`
- Display math: `$$\int_a^b f(x)dx$$`
- Piecewise functions, matrices, and more
- Centered display with proper spacing

### Code Extraction
- Automatically detects code blocks in transcripts
- Syntax highlighting for Python, JavaScript, etc.
- Clean, readable formatting

### Caching System
- URL-based cache for instant loading
- Transcript-hash verification
- 24-hour cache expiration
- Reduces API calls and improves performance

## Project Structure

```
.
├── backend/                 # Python FastAPI backend
│   ├── api/
│   │   └── routes/         # API endpoints
│   ├── services/           # AI service logic
│   └── main.py            # FastAPI app entry point
├── extension/              # Chrome extension
│   ├── content/           # Content scripts
│   │   ├── inject-tab.js  # Main injection logic
│   │   └── caption-extractor.js  # Transcript extraction
│   ├── libs/              # Third-party libraries
│   │   ├── katex/        # LaTeX rendering
│   │   ├── marked/       # Markdown parsing
│   │   └── prism/        # Code highlighting
│   ├── styles/           # CSS files
│   ├── utils/            # Utility scripts
│   └── manifest.json     # Extension manifest
└── README.md
```

## Configuration

### Backend Configuration
Edit `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=8000
```

### Extension Configuration
The extension uses the backend at `https://udemy-extension.onrender.com` by default. To use a local backend:
1. Open the extension popup
2. Change the backend URL to `http://localhost:8000`

## Development

### Running Locally

**Backend:**
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Extension:**
1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click the reload icon on the extension card

### Adding New Features

1. **Backend**: Add routes in `backend/api/routes/`
2. **Frontend**: Modify `extension/content/inject-tab.js`
3. **Styling**: Update `extension/styles/inject.css`

## Troubleshooting

### Extension not appearing
- Make sure you're on a Udemy lecture page (not course overview)
- Refresh the page after installing the extension
- Check browser console for errors

### LaTeX not rendering
- Fonts are bundled locally in `extension/libs/katex/fonts/`
- Clear browser cache and reload extension

### Backend connection issues
- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Verify GROQ_API_KEY is set correctly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning and development.

## Acknowledgments

- **Groq** for fast LLM inference
- **KaTeX** for beautiful math rendering
- **Udemy** for the learning platform
- **FastAPI** for the excellent Python framework

## Contact

Created by Mayank - [GitHub](https://github.com/Mayank459)

---

**Note**: This is an educational project. Please respect Udemy's terms of service when using this extension.
