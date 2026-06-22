@echo off
echo Starting Cyber Shield Platform...

echo Starting Backend API Server...
cd backend
start "Cyber Shield Backend" cmd /c ".\venv\Scripts\activate && uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
cd ..

echo Starting Frontend Web Server...
cd frontend
start "Cyber Shield Frontend" cmd /c "npm run dev"
cd ..

echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening Browser...
start http://localhost:3000

echo Both servers are running in separate command windows.
pause
