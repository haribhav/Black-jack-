# Blackjack Game (Python + React)

This project includes:
- A **Python command-line Blackjack game** (`main.py`)
- A **React frontend Blackjack UI** (`frontend/`)

## ▶️ Run the Python CLI game

```bash
python main.py
```

## ▶️ Run the React frontend (no npm install required)

```bash
cd frontend
python -m http.server 5173
```

Then open: `http://127.0.0.1:5173`.

The frontend uses React via browser ESM imports, so it can run in restricted environments where npm installs are blocked.
