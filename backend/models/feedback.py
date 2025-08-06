# This is the table where I store user feedback from the app.
# It saves the original text, what the model predicted, what the correct label actually was (if the user corrected it),
# and when it was submitted. Useful if I want to retrain the model later with real input corrections.

from config.db import db

class Feedback(db.Model):
    __tablename__ = 'sentiment_analysis_feedback'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    predicted_label = db.Column(db.Integer, nullable=False)
    correct_label = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
