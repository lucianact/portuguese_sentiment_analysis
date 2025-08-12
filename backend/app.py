# This is the main app file — it wires everything together.
# It loads the trained model and vectorizer, connects to the database,
# registers the prediction and feedback routes, and runs the server.

from flask import Flask
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
from config.db import db, DATABASE_URL
from models import feedback  # Ensures SQLAlchemy sees the model
from routes.predict import predict_bp
from routes.feedback import feedback_bp
from routes.health import health_bp
import os
import pickle
import sys
import logging

app = Flask(__name__)

# --------------------------------------------------
# Runtime config (env-driven; safe defaults)
# --------------------------------------------------
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JSON_AS_ASCII"] = False                 # keep PT accents intact
app.config["MAX_CONTENT_LENGTH"] = 64 * 1024        # cap request size at 64KB
DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"

# Minimal logging; Render/Gunicorn will collect stdout
logging.basicConfig(
    level=logging.INFO if not DEBUG else logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    stream=sys.stdout,
)

# --------------------------------------------------
# CORS — restrict to your actual frontends only
# (Do NOT include the API origin here)
# --------------------------------------------------
FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://portuguese-sentiment-analysis-frontend.onrender.com",
]
CORS(
    app,
    resources={
        r"/predict": {"origins": FRONTEND_ORIGINS},
        r"/feedback": {"origins": FRONTEND_ORIGINS},
        r"/healthz": {"origins": "*"},  # safe to allow since it returns a simple OK
    },
    methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type"],
    supports_credentials=False,
)

# Behind a proxy on Render — fix scheme/host for url_for, etc.
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)

# --------------------------------------------------
# Security headers for API responses
# --------------------------------------------------
@app.after_request
def add_security_headers(resp):
    resp.headers.setdefault("X-Content-Type-Options", "nosniff")
    resp.headers.setdefault("X-Frame-Options", "DENY")
    resp.headers.setdefault("Referrer-Policy", "no-referrer")
    # CSP is optional for APIs; enable if desired:
    # resp.headers.setdefault("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none';")
    return resp

# --------------------------------------------------
# Register always-on lightweight routes first
# /healthz is used by an external cron to keep the service awake.
# --------------------------------------------------
app.register_blueprint(health_bp)

# --------------------------------------------------
# Initialize DB (create tables once if you want auto-provision)
# Consider controlling this with an env var in production.
# --------------------------------------------------
db.init_app(app)
with app.app_context():
    db.create_all()

# --------------------------------------------------
# Load ML artifacts (vectorizer + model)
# - Use try/except so startup fails gracefully with a clear log
# --------------------------------------------------
try:
    with open("data/tfidf_vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)
    with open("data/sentiment_model.pkl", "rb") as f:
        model = pickle.load(f)
except Exception as e:
    logging.error("Failed to load ML artifacts: %s", e)
    # Exit early — running without a model would only cause 500s later
    raise

# Stash artifacts in app config for routes to use
app.config["VECTORIZER"] = vectorizer
app.config["MODEL"] = model

# --------------------------------------------------
# Register API blueprints
# --------------------------------------------------
app.register_blueprint(predict_bp)
app.register_blueprint(feedback_bp)

# --------------------------------------------------
# Local dev entrypoint (Render/Gunicorn will not call this)
# --------------------------------------------------
if __name__ == "__main__":
    # Never use debug=True in prod; controlled via FLASK_DEBUG=1 locally
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=DEBUG)
