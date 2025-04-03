from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import csv
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins="http://localhost:5173")  # Match your frontend port

# Load vectorizer and model
with open("data/tfidf_vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

with open("data/sentiment_model.pkl", "rb") as f:
    model = pickle.load(f)

# Valid labels: 0 = negative, 1 = positive, 2 = neutral, 3 = sarcastic
VALID_LABELS = {0, 1, 2, 3}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' in request body"}), 400
    
    print(f"[Predict] Received text: {data['text']}")

    # Vectorize input text
    X = vectorizer.transform([data["text"]])
    prediction = model.predict(X)[0]

    print(f"[Predict] Prediction: {prediction}")
    return jsonify({"prediction": int(prediction)})

@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json()

    required_fields = {"text", "predicted_label", "correct_label"}
    if not all(k in data for k in required_fields):
        return jsonify({"error": "Missing fields in feedback data"}), 400

    if data["correct_label"] not in VALID_LABELS:
        return jsonify({"error": "Invalid sentiment label"}), 400

    feedback_file = "data/feedback.csv"
    is_new = not os.path.exists(feedback_file)

    try:
        with open(feedback_file, mode="a", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["text", "predicted_label", "correct_label"])
            if is_new:
                writer.writeheader()
            writer.writerow(data)

        print(f"[Feedback] Text: {data['text']} | Predicted: {data['predicted_label']} | Correct: {data['correct_label']}")
        return jsonify({"message": "Feedback received"}), 200

    except Exception as e:
        print("[Feedback] Failed to save feedback:", str(e))
        return jsonify({"error": "Failed to save feedback"}), 500

if __name__ == "__main__":
    app.run(debug=True)
