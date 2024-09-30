# Setup

## 1. clone the project
```bash
    git clone git@github.com:PacoMak/FYP24063_backend.git
    cd FYP24063_backend
```

## 2. create virtual environment (optional)

### Choice 1: Venv
```bash
    python -m venv venv/

    source venv/bin/activate  # for MacOS/Linux
    venv/Scripts/activate # for Window
```
### Choice 2: Anaconda
```bash
    conda create --name <env-name>
    conda activate <env-name>
```

## 3. install the packages
```bash
    pip install -r requirements.txt
```

## 4. run the server
```bash
    python app.py
```

## example url
### get stocks data
```bash
    http://127.0.0.1:5000/stock/?stockNames=ZK&stockNames=FUTU
```

