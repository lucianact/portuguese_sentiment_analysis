from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import pickle
import os

# === Initialize Flask app ===
app = Flask(__name__)
CORS(app, origins="http://localhost:5173")

# === Database configuration ===
load_dotenv()  
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# === Initialize SQLAlchemy ===
db = SQLAlchemy(app)

# === Define the Feedback model ===
class Feedback(db.Model):
    __tablename__ = 'sentiment_analysis_feedback'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    predicted_label = db.Column(db.Integer, nullable=False)
    correct_label = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())

# === Load vectorizer and model ===
with open("data/tfidf_vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

with open("data/sentiment_model.pkl", "rb") as f:
    model = pickle.load(f)

# === Valid label set ===
VALID_LABELS = {0, 1, 2, 3}

# === Predict route ===
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' in request body"}), 400

    print(f"[Predict] Received text: {data['text']}")
    X = vectorizer.transform([data["text"]])
    prediction = model.predict(X)[0]
    print(f"[Predict] Prediction: {prediction}")
    return jsonify({"prediction": int(prediction)})

# === Feedback route ===
@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json()
    required_fields = {"text", "predicted_label", "correct_label"}

    if not all(k in data for k in required_fields):
        return jsonify({"error": "Missing fields in feedback"}), 400

    feedback = Feedback(
        text=data["text"],
        predicted_label=data["predicted_label"],
        correct_label=data["correct_label"]
    )

    db.session.add(feedback)
    db.session.commit()

    print(f"[Feedback] Saved: {data}")
    return jsonify({"message": "Feedback saved to database"}), 200

# === Run the app ===
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
