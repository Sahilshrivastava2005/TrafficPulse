#!/bin/bash

# Function to clean up background processes on exit
cleanup() {
    echo -e "\nStopping TrafficPulse servers..."
    # kill 0 sends a TERM signal to all processes in the current process group
    kill 0
}

# Trap the SIGINT (Ctrl+C) and SIGTERM signals and route them to the cleanup function
trap cleanup SIGINT SIGTERM EXIT

echo "================================================="
echo "    Starting TrafficPulse (Nivaaran.ai)          "
echo "================================================="

# Start the Backend
echo -e "\n[1/2] Setting up and starting Backend (FastAPI)..."
cd backend
echo "Installing Python dependencies..."
pip install -r requirements.txt
cd api
echo "Starting Uvicorn server..."
python -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Return to root directory
cd ../..

# Start the Frontend
echo -e "\n[2/2] Setting up and starting Frontend (React/Vite)..."
cd frontend
echo "Installing NPM dependencies..."
npm install
echo "Starting Vite dev server..."
npm run dev &
FRONTEND_PID=$!

echo -e "\n================================================="
echo "TrafficPulse is now running!"
echo "Backend API: http://localhost:8000"
echo "Frontend UI: http://localhost:5173"
echo "Press Ctrl+C to stop both servers."
echo "================================================="

# Wait indefinitely for the background processes
wait
