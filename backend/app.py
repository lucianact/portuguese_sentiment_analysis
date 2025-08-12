# This is the main app file — it wires everything together.
# It loads the trained model and vectorizer, connects to the database,
# registers the prediction and feedback routes, and runs the server.
# Basically the brain of the operation — run this when I want the app live locally.

from flask import Flask
from flask_cors import CORS
from config.db import db, DATABASE_URL
from models import feedback  # Ensures SQLAlchemy sees the model
from routes.predict import predict_bp
from routes.feedback import feedback_bp
import pickle

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://portuguese-sentiment-analysis.onrender.com"
]}})


# ---------------------------
# Database configuration
# ---------------------------
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Quick sanity log
# print(f"Using DB URL: {app.config['SQLALCHEMY_DATABASE_URI']}", flush=True)

# Initialize DB
db.init_app(app)

# ---------------------------
# Load ML artifacts (vectorizer + model)
# ---------------------------
with open("data/tfidf_vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

with open("data/sentiment_model.pkl", "rb") as f:
    model = pickle.load(f)

app.config["VECTORIZER"] = vectorizer
app.config["MODEL"] = model

# Register blueprints
app.register_blueprint(predict_bp)
app.register_blueprint(feedback_bp)


# ---------------------------
# Create tables once at import-time
# ---------------------------
with app.app_context():
    db.create_all()

# Run app locally
if __name__ == "__main__": 
    app.run(debug=True)
