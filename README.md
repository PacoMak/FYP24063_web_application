# Deep Deterministic Policy Gradient (DDPG) <br> Portfolio Management
The DDPG model used in https://wp2024.cs.hku.hk/fyp24063/

## Setup

### 1. Clone the project
```bash
    git clone git@github.com:PacoMak/FYP24063_web_application.git
    cd FYP24063_web_application
```

### 2.1 Backend Setup
### 2.1.1 Create and activate virtual environment
Python 3.11.5 is required. You can download it from https://www.python.org/downloads/release/python-3115/
```bash
cd backend
pip install virtualenv
virtualenv -p python3.11.5 .venv
.venv/Scripts/activate
```
### 2.1.2 Install the dependencies
```bash
pip install -r ./requirements.txt
```
### 2.1.2 Install PyTorch (Version 2.5.1)
Example installation: 
```bash
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
```
Or look for customized installation command in https://pytorch.org/

### 2.2 Frontend Setup
npm is required, You can download it from https://nodejs.org/en/download
```bash
    cd frontend
    npm install
```

### 3 Run the application

### 3.1 Run Backend
```bash
    cd backend
    .venv/Scripts/activate
    python app.py
```
## 3.2 Run Frontend
```bash
    cd frontend
    npm run dev
```
Then you can visit the application at http://localhost:5173/ 