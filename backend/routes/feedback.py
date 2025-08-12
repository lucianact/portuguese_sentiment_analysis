# /feedback API: validates payload, normalizes text, enforces size limits,
# and writes to DB with rollback on error. CORS is handled globally in app.py.

from flask import Blueprint, request, jsonify, current_app
from models.feedback import Feedback
from config.db import db
import os
import unicodedata

feedback_bp = Blueprint("feedback", __name__)

# Keep in sync with frontend maxLength; allow override via env
MAX_TEXT_CHARS = int(os.getenv("MAX_TEXT_CHARS", "1000"))
VALID_LABELS = {0, 1, 2, 3}  # negative, positive, neutral, sarcastic

@feedback_bp.route("/feedback", methods=["POST"])
def submit_feedback():
    # 1) Require JSON body
    if not request.is_json:
        return jsonify({"error": "Expected application/json body"}), 400

    # 2) Parse JSON safely
    data = request.get_json(silent=True) or {}

    # 3) Validate presence and types
    text = data.get("text")
    pred = data.get("predicted_label")
    corr = data.get("correct_label")

    if not isinstance(text, str):
        return jsonify({"error": "Missing or invalid 'text'"}), 400
    if not isinstance(pred, (int, float)) or int(pred) != pred:
        return jsonify({"error": "Missing or invalid 'predicted_label'"}), 400
    if not isinstance(corr, (int, float)) or int(corr) != corr:
        return jsonify({"error": "Missing or invalid 'correct_label'"}), 400

    pred = int(pred)
    corr = int(corr)

    if pred not in VALID_LABELS or corr not in VALID_LABELS:
        return jsonify({"error": "Label out of range"}), 400

    # 4) Normalize and trim text; enforce length
    text = unicodedata.normalize("NFC", text.strip())
    if not text:
        return jsonify({"error": "Text is empty after trimming"}), 400
    if len(text) > MAX_TEXT_CHARS:
        return jsonify({"error": "Text too long"}), 413

    # 5) Write to DB with rollback on error
    try:
        fb = Feedback(text=text, predicted_label=pred, correct_label=corr)
        db.session.add(fb)
        db.session.commit()
        # Return minimal info; avoid echoing user text back
        return jsonify({"message": "Feedback saved", "id": fb.id}), 201
    except Exception:
        current_app.logger.exception("Failed to save feedback")
        db.session.rollback()
        return jsonify({"error": "Could not save feedback"}), 500
