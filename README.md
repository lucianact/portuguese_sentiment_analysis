# Portuguese Sentiment Analysis

This is a full-stack web application that performs sentiment analysis on text inputs in Portuguese.  
Built to explore NLP, full-stack deployment, and user feedback workflows.

## Features

1. Enter a text and get a sentiment prediction
2. User can provide feedback to improve future models
3. Database stores feedback for retraining

## Tech Stack

- **Frontend:** React + Vite + TypeScript  
- **Backend:** Flask + Flask-CORS  
- **Model:** Scikit-learn (TF-IDF + Logistic Regression)  
- **Database:** SQLite (local), PostgreSQL (Supabase)

## Project Structure

<pre>
backend/
├── app.py # Flask app entry point
├── config/ # Database configuration
├── mlpipeline/ # Preprocessing & training scripts
├── routes/ # API endpoints
└── models/ # Data models

frontend/
└── src/ # React components & pages
</pre>

## Running Locally

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm run dev
