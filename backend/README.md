# Setup (backend server)

## 1. clone the project
```bash
    git clone git@github.com:PacoMak/FYP24063_web_application.git
    cd FYP24063_web_application
```

## 2. Set up and activate the Python virtual environment
Python 3.11 is required (Recommended version: 3.11.5)
```bash
    pip install virtualenv
    virtualenv -p python3.11.5 .venv
    .venv/Scripts/activate
```
## 3. Install the dependencies
```bash
    pip install -r ./requirements.txt
```
## 4. Install PyTorch (Version 2.5.1)
Example installation: 
```bash
    pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
```
Or look for customized installation command in https://pytorch.org/

## 5. run the server
```bash
    python app.py
```

## example url
```bash
    http://127.0.0.1:5000/stocks/history?tickers=MSFT&tickers=AAPL
    http://127.0.0.1:5000/stock/history?ticker=MSFT
    http://127.0.0.1:5000/stock/info?ticker=MSFT
    http://127.0.0.1:5000/portfolio
```
## 6. run the model directly
```
    python -m src.rl_model.train_ddpg
```
# Updating the dependencies
Update the dependency list after you installed new packages through pip using the `deps_update.bat` script \
While in the virtual environment, run:
```bash
    ./deps_update.bat
```

# Evaluation
Total return and Sharpe Ratio over epoch will be generated in `/evaluation` after the training is completed





