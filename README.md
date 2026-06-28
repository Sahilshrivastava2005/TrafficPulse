# TrafficPulse 

**TrafficPulse** is an advanced, event-driven predictive dispatch and congestion intelligence engine designed for smart city infrastructure (specifically tailored for Bengaluru).

## 🚀 Overview

TrafficPulse ingests live event data (such as accidents, VIP movements, protests, and water logging) alongside parking infrastructure metrics. It uses a robust Machine Learning backend to dynamically predict traffic surges, identify spatial anomaly clusters, and generate automated police/barricade dispatch blueprints.

## 🧠 Core Architecture

The system is broken down into four core computational pillars:

1. **Data Ingestion:** Continuous ingestion and feature engineering of anonymized event logs (e.g., Astram) and temporal/spatial data (distance to metro stations, markets, intersections).
2. **Spatial Intelligence:** Leverages **DBSCAN (Density-Based Spatial Clustering)** to identify anomalous dynamic congestion clusters across the city, ignoring transient traffic noise.
3. **Predictive Ensemble:** A weighted triad of ML models calculates a real-time `congestion_surge_index`:
   - **LightGBM** (50% weight)
   - **XGBoost** (30% weight)
   - **PyTorch ResidualMLP** (20% weight)
4. **Dispatch Solver:** Translates the surge index into actionable resource blueprints (e.g., number of barricades, required traffic marshals).

## 💻 Tech Stack

- **Backend:** Python, FastAPI, Pandas, Scikit-Learn, LightGBM, XGBoost, PyTorch, DBSCAN.
- **Frontend:** React JS (Vite), React Three Fiber & Drei (3D UI), React Leaflet (Interactive Maps), Recharts (Analytics), Lucide React (Icons).
- **Design System:** Custom Retro Skin-Tone Palette (Vanilla CSS).

## 📁 Project Structure

```text
TrafficPulse/
├── backend/
│   ├── api/
│   │   └── main.py              # FastAPI Server & Endpoints (/predict, /analytics-data)
│   ├── backend_engine.py        # Core feature engineering
│   ├── dispatch_solver.py       # Algorithmic resource allocation
│   ├── hotspot_clustering.py    # DBSCAN implementation
│   ├── regression_models.py     # ML model definitions (PyTorch, LGBM, XGB)
│   └── requirements.txt         # Python dependencies
├── data/
│   ├── model_payload.pkl        # Pre-trained models and scaler weights
│   └── processed_parking_congestion_data.csv # Processed traffic datasets
└── frontend/
    ├── index.html
    ├── package.json
    └── src/
        ├── App.jsx              # Routing & Layout
        ├── index.css            # Global Retro CSS Theme
        ├── components/          # Header, Top Navigation
        ├── pages/               # Dashboard, 3D Landing Page, Insights, Map
        └── services/            # Axios API gateways
```

## 🛠️ How to Run Locally

### 1. Start the Backend API
The backend runs on FastAPI and exposes the models via a REST API on port `8000`.

```bash
cd backend/api
pip install -r ../requirements.txt
python -m uvicorn main:app --reload
```
*Note: Ensure your Python environment (e.g., Conda) is active.*

### 2. Start the Frontend
The frontend is a Vite-powered React Single Page Application running on port `5173`.

Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:5173** in your browser to view the interactive 3D landing page and dashboard.

## 🎨 Design & UI Features
- **3D Interactive Landing Page:** Built with `react-three-fiber`, featuring floating architecture nodes and a dynamic space environment.
- **Responsive Top Navigation:** Clean, horizontal navigation that collapses into a hamburger menu on mobile devices.
- **Live API Status:** Real-time polling indicator in the header ensuring the backend connection is active.
- **Interactive Map:** `react-leaflet` implementation rendering DBSCAN clusters as dynamic pulsing circles based on surge severity.
- **Deep Insights:** `recharts` integration plotting top risk roads, resolution times, and corridor vulnerabilities.
# TrafficPulse
