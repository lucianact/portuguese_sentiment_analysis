from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins="http://localhost:5173")

# Load vectorizer and model
with open("data/tfidf_vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

with open("data/sentiment_model.pkl", "rb") as f:
    model = pickle.load(f)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' in request body"}), 400
    
    # Log the incoming text (for debugging purposes)
    print(f"Received text: {data['text']}")

    # Vectorize input text
    X = vectorizer.transform([data["text"]])

    # Predict sentiment
    prediction = model.predict(X)[0]

    return jsonify({"prediction": int(prediction)})

if __name__ == "__main__":
    app.run(debug=True)