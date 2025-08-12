# Feedback table with DB-level safety rails:
# - CHECK constraints for label ranges (0..3)
# - CHECK for max text length (kept in sync with API cap)
# - SMALLINT for labels (space-efficient)
# - Index on created_at for faster analytics
# - Optional SHA-256 text hash (useful for dedup/analytics; can be nullable)

from config.db import db
from sqlalchemy import CheckConstraint, Index

MAX_TEXT_CHARS = 1000  # keep in sync with API/front-end caps

class Feedback(db.Model):
    __tablename__ = "sentiment_analysis_feedback"

    id = db.Column(db.Integer, primary_key=True)

    # Store original user text (DB length capped by CHECK below)
    text = db.Column(db.Text, nullable=False)

    # Use SMALLINT for compact storage; enforce allowed range via CHECK
    predicted_label = db.Column(db.SmallInteger, nullable=False)
    correct_label   = db.Column(db.SmallInteger, nullable=False)

    # When row was created (Postgres timestamptz if timezone=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False)

    # Optional: anonymized fingerprint for dedup (compute in route; sha256 hex = 64 chars)
    # text_hash = db.Column(db.String(64), nullable=True, index=True)

    __table_args__ = (
        # Keep labels in 0..3 at the DB level
        CheckConstraint("predicted_label BETWEEN 0 AND 3", name="ck_feedback_pred_label_range"),
        CheckConstraint("correct_label BETWEEN 0 AND 3", name="ck_feedback_corr_label_range"),
        # Cap text length to avoid pathological payloads (matches API cap)
        CheckConstraint(f"char_length(text) <= {MAX_TEXT_CHARS}", name="ck_feedback_text_len"),
        # Sort/filter speed-up
        Index("ix_feedback_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Feedback id={self.id} pred={self.predicted_label} corr={self.correct_label}>"
