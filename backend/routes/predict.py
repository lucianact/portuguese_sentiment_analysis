# This is the /predict API route.
# When the user sends a sentence, this grabs the input, vectorizes it using the trained TF-IDF model,
# runs it through the logistic regression model, and sends back the predicted sentiment label.
# Basically the core logic that powers real-time predictions in the app.

from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
import pickle
import numpy as np

predict_bp = Blueprint("predict", __name__)

@predict_bp.route("/predict", methods=["POST"])
@cross_origin()
def predict():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' in request"}), 400

    vectorizer = current_app.config["VECTORIZER"]
    model = current_app.config["MODEL"]
    X = vectorizer.transform([data["text"]])
    prediction = model.predict(X)[0]

    return jsonify({"prediction": int(prediction)})
