#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

if [ ! -d ".venv" ]; then
    echo "Virtual environment (.venv) not found! Creating one..."
    python3 -m venv .venv
fi

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Downloading spaCy en_core_web_sm model..."
python -m spacy download en_core_web_sm

echo "Starting FastAPI NLP service on port 8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

