from flask import Flask, send_from_directory
from backend.api.routes import bp as api_bp
import os

app = Flask(__name__, static_folder="frontend", static_url_path="")
app.register_blueprint(api_bp)

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(debug=True)
