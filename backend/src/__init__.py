from flask import Flask
from flask_cors import CORS
from src.controllers import stock

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
app.register_blueprint(stock, url_prefix="/")
