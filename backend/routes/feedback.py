# This is the /feedback API route. It receives feedback from the user (original text, predicted label, and correct label),
# checks if all required fields are present, then saves that to the database using the Feedback model.
# Used if I want to track model accuracy over time or collect real-world data for retraining.

from flask import Blueprint, request, jsonify
from models.feedback import Feedback
from flask_cors import cross_origin
from config.db import db

feedback_bp = Blueprint("feedback", __name__)

@feedback_bp.route("/feedback", methods=["POST", "OPTIONS"])
@cross_origin()
def submit_feedback():

    print("🔁 Hit /feedback route")
    
    data = request.get_json()
    if not all(k in data for k in ("text", "predicted_label", "correct_label")):
        return jsonify({"error": "Missing fields in feedback"}), 400
    
    print("✅ Feedback received:", data)

    feedback = Feedback(
        text=data["text"],
        predicted_label=data["predicted_label"],
        correct_label=data["correct_label"]
    )

    db.session.add(feedback)
    db.session.commit()
    return jsonify({"message": "Feedback saved"}), 200
