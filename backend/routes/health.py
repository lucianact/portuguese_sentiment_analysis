# --------------------------------------------------
# Health & Readiness Endpoints
# --------------------------------------------------
# /healthz  = Liveness: super fast, no dependencies, OK if process is up
# /readyz   = Readiness: confirms model + DB are available; safe for cron/monitoring
# --------------------------------------------------
from flask import Blueprint, jsonify, current_app

from config.db import db  # used only in /readyz; cheap SELECT 1

health_bp = Blueprint("health", __name__)

@health_bp.after_request
def no_cache(resp):
    # Ensure responses aren't cached anywhere
    resp.headers.setdefault("Cache-Control", "no-store")
    return resp

@health_bp.get("/healthz")
def healthz():
    # Keep this ultra-cheap: don't touch model or DB here
    return jsonify(status="ok"), 200

@health_bp.get("/readyz")
def readyz():
    # Verify model/vectorizer presence
    model = current_app.config.get("MODEL")
    vectorizer = current_app.config.get("VECTORIZER")
    if model is None or vectorizer is None:
        # Not ready to serve predictions
        return jsonify(status="degraded", error="model_not_loaded"), 503

    # Verify DB connectivity with a trivial query
    try:
        db.session.execute(db.text("SELECT 1"))
    except Exception:
        current_app.logger.exception("DB readiness check failed")
        return jsonify(status="degraded", error="db_unavailable"), 503

    return jsonify(status="ready"), 200
