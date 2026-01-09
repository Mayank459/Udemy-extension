# Udemy AI Smart Overview

An AI-powered browser extension that adds a "Smart Overview" tab to Udemy courses, generating summaries and extracting code automatically.

## Project Structure

- `extension/`: Chrome Extension (Manifest V3)
- `backend/`: FastAPI Python Backend

## Setup

### Backend

1. Navigate to `backend/`
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Create `.env` from `.env.example` and add your API keys.
6. Run server: `python main.py`

### Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/` folder from this project.

## Usage

1. Open a Udemy course you own.
2. Look for the "AI Overview" tab next to "Overview".
