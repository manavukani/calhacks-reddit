#!/bin/bash

echo "🚀 Starting ThreadSense Application"
echo "=================================="

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Install backend dependencies
echo "Installing backend dependencies..."
pip install fastapi uvicorn httpx python-dotenv requests

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one with your JLLM_API_KEY"
    echo "Example:"
    echo "JLLM_API_KEY=YOUR_KEY_HERE"
    echo "JLLM_API_BASE=https://janitorai.com/hackathon/completions"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Starting services..."
echo ""
echo "Backend will run on: http://localhost:8000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Start backend in background
echo "Starting backend..."
source .venv/bin/activate
uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
