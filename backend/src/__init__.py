from flask import Flask
from flask_cors import CORS
from src.controllers import stock, model

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:5173"}},
    methods=["GET", "POST", "DELETE", "PUT", "OPTIONS"],
)
app.register_blueprint(stock, url_prefix="/")
app.register_blueprint(model, url_prefix="/")
