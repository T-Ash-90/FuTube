import os
import time
import threading

from flask import Flask, send_from_directory
from backend.api.routes import bp as api_bp

app = Flask(__name__, static_folder="frontend", static_url_path="")
app.register_blueprint(api_bp)

IDLE_TIMEOUT = 600
last_activity = time.time()

@app.before_request
def update_activity():
    global last_activity
    last_activity = time.time()

def idle_monitor():
    global last_activity
    while True:
        time.sleep(30)
        if time.time() - last_activity > IDLE_TIMEOUT:
            print("Server idle for too long. Shutting down.")
            os._exit(0)

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

threading.Thread(target=idle_monitor, daemon=True).start()
