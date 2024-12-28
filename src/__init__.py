from flask import Flask
from src.controllers import stock

app = Flask(__name__)
app.register_blueprint(stock, url_prefix="/")
