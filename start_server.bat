@echo off
echo Starting Udemy AI Backend Server...
echo.

cd backend
call ..\venv\Scripts\activate
echo Virtual environment activated
echo.

echo Installing/checking dependencies...
pip install -q -r requirements.txt
echo.

echo Starting server on http://localhost:8000
echo Press Ctrl+C to stop
echo.
python main.py
