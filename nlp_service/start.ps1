# Get the directory of this script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if ($ScriptDir) {
    Set-Location $ScriptDir
}

# Check if .venv exists
if (-not (Test-Path -Path ".venv" -PathType Container)) {
    Write-Host "Virtual environment (.venv) not found! Creating one..." -ForegroundColor Yellow
    python -m venv .venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Green
. .venv/Scripts/Activate.ps1

Write-Host "Installing Python dependencies..." -ForegroundColor Green
pip install -r requirements.txt

Write-Host "Downloading spaCy en_core_web_sm model..." -ForegroundColor Green
python -m spacy download en_core_web_sm

Write-Host "Starting FastAPI NLP service on port 8000..." -ForegroundColor Green
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
