#!/bin/bash

echo "🚀 Starting Reddit:AI Application"
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
if [ -f "backend/requirements.txt" ]; then
    pip install -r backend/requirements.txt || {
        echo "requirements.txt install failed, installing core deps directly..."
        pip install "fastapi>=0.95.0" "uvicorn[standard]>=0.20.0" "httpx>=0.24.0" "python-dotenv>=1.0.0" letta letta_client
    }
else
    pip install "fastapi>=0.95.0" "uvicorn[standard]>=0.20.0" "httpx>=0.24.0" "python-dotenv>=1.0.0" letta letta_client
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one with your API settings."
    echo "Example:"
    echo "API_PROVIDER=anthropic"
    echo "ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY"
    echo "# Optional: OPENAI_API_KEY=YOUR_OPENAI_KEY"
    echo "# Optional: GEMINI_API_KEY=YOUR_GEMINI_KEY"
    echo "# Optional for moderation: LETTA_API_KEY=YOUR_LETTA_KEY"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Starting services..."