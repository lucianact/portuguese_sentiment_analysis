=> Portuguese Sentiment Analysis
This is a full-stack web application that performs sentiment analysis on text inputs in Portuguese, that I've built to explore NLP, full-stack deployment, and user feedback workflows.

=> The app:
1. Allows users to enter a text (in Portuguese) and get a sentiment prediction (Positive, Negative, Neutral, Sarcastic)
2. Allows users to provide feedback on the model’s prediction to improve future models
3. Collects user feedback and stores for future training iterations


=> Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Flask + Flask-CORS                    
- ML Model: Scikit-learn (TF-IDF + Logistic Regression)
- Database: SQLite (local) / PostgreSQL (via Render)


=> Project Structure

backend/
├── app.py               # Main Flask app
├── config/
│   └── db.py            # SQLAlchemy setup
├── data/
│   ├── tfidf_vectorizer.pkl
│   └── sentiment_model.pkl
├── models/
│   └── feedback.py      # Feedback SQLAlchemy model
├── routes/
│   ├── feedback.py      # Feedback API route
│   └── predict.py       # Prediction API route
└── requirements.txt     # Python dependencies

frontend/
├── index.html           # Entry HTML
├── src/
│   └── App.tsx          # Main React component
│   └── index.css        # Styles
└── vite.config.mts      # Vite config


=> Running Locally:

1. Backend Setup (Flask)
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

2. Frontend Setup (React + Vite)
cd frontend
npm install
npm run dev
Visit http://localhost:5173


=> TODO / Roadmap
- Improve sarcasm detection with BERT




