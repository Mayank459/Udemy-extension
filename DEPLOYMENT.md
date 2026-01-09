# Udemy AI Backend

Backend API for the Udemy AI Smart Overview extension.

## Deployment to Render

1. **Create a Render account** at https://render.com
2. **Connect your GitHub repository** or use Render's Git integration
3. **Create a new Web Service**
4. **Configure the service:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Environment Variables:
     - `GROQ_API_KEY`: Your Groq API key

5. **Deploy!**

Your backend will be available at: `https://your-app-name.onrender.com`

## Update Extension

After deployment, update the extension's backend URL:
1. Open `extension/popup/popup.html`
2. Update the default backend URL to your Render URL
3. Reload the extension

## Local Development

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r ../requirements.txt
python main.py
```

Backend will run on `http://localhost:8000`
