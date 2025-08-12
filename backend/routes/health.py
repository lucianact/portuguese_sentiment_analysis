# --------------------------------------------------
# Health Check Endpoint for Render
# --------------------------------------------------
# This lightweight route is used by an external cron job 
# to periodically "ping" the backend.  
# Purpose: keep the Render app from going into cold start 
# mode by ensuring the service stays active.  
# It returns instantly without loading the ML model or 
# performing any heavy operations.
# --------------------------------------------------
from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)

@health_bp.get("/healthz")
def healthz():
    return jsonify(status="ok"), 200