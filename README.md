# Portuguese Sentiment Analysis

This is a full-stack web application that performs sentiment analysis on text inputs in Portuguese.  
Built to explore NLP, full-stack deployment, and user feedback workflows.

## Features

1. Enter a text and get a sentiment prediction (Positive, Negative, Neutral, Sarcastic)
2. Provide feedback to improve future models
3. Store feedback for retraining

## Tech Stack

- **Frontend:** React + Vite + TypeScript  
- **Backend:** Flask + Flask-CORS  
- **Model:** Scikit-learn (TF-IDF + Logistic Regression)  
- **Database:** SQLite (local), PostgreSQL (Render)

## Project Structure

<pre>
backend/
├── app.py
├── config/
│   └── db.py
├── data/
│   ├── tfidf_vectorizer.pkl
│   └── sentiment_model.pkl
├── models/
│   └── feedback.py
├── routes/
│   ├── feedback.py
│   └── predict.py
└── requirements.txt

frontend/
├── index.html
├── src/
│   ├── App.tsx
│   └── index.css
└── vite.config.mts
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
