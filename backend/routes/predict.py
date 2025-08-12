# /predict API: validates input, normalizes text, enforces size limits,
# and returns a numeric prediction. Errors are user-friendly; details go to logs.

from flask import Blueprint, request, jsonify, current_app
import os
import unicodedata
from typing import Optional

predict_bp = Blueprint("predict", __name__)

# Allow override via env; keep in sync with frontend <textarea maxLength>
MAX_TEXT_CHARS = int(os.getenv("MAX_TEXT_CHARS", "1000"))

@predict_bp.route("/predict", methods=["POST"])
def predict():
    # 1) Require JSON body
    if not request.is_json:
        return jsonify({"error": "Expected application/json body"}), 400

    # 2) Parse JSON safely
    data = request.get_json(silent=True) or {}
    text = data.get("text")

    # 3) Validate presence and type
    if not isinstance(text, str):
        return jsonify({"error": "Missing or invalid 'text' field"}), 400

    # 4) Trim and normalize Unicode (Portuguese accents, composed form)
    text = unicodedata.normalize("NFC", text.strip())

    if not text:
        return jsonify({"error": "Text is empty after trimming"}), 400

    # 5) Enforce length limit (prevents huge payloads)
    if len(text) > MAX_TEXT_CHARS:
        return jsonify({"error": "Text too long"}), 413  # Payload Too Large

    # 6) Ensure model artifacts exist
    vectorizer = current_app.config.get("VECTORIZER")
    model = current_app.config.get("MODEL")
    if vectorizer is None or model is None:
        current_app.logger.error("Model or vectorizer not loaded")
        return jsonify({"error": "Service not ready"}), 503

    # 7) Predict with guarded error handling
    try:
        X = vectorizer.transform([text])
        pred = model.predict(X)[0]
        return jsonify({"prediction": int(pred)})
    except Exception as exc:
        # Log stack trace server-side, but keep message generic to clients
        current_app.logger.exception("Prediction failed")
        return jsonify({"error": "Internal error"}), 500
