# Backend — nuScenes Data Inspector

FastAPI REST API wrapping the nuScenes devkit.

## Tech Stack

- **Framework**: FastAPI
- **Validation**: Pydantic, pydantic-settings
- **Dataset**: nuscenes-devkit
- **Numeric**: NumPy

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Set environment variables (or create a `.env` file):

```
NUSCENES_DATAROOT=/path/to/nuscenes
NUSCENES_VERSION=v1.0-mini
```

Start the server:

```bash
uvicorn app.main:app --reload --port 8000
```

## Project Structure

```
app/
  main.py               # FastAPI app, CORS, router mounting
  config.py             # Environment settings (pydantic-settings)
  routers/scenes.py     # REST endpoints with Pydantic response_model
  schemas/responses.py  # Pydantic response models
  services/
    nuscenes_service.py # nuScenes devkit integration + quality checks
requirements.txt
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/scenes` | List all scenes |
| GET | `/api/scenes/{token}/samples` | Ordered samples in a scene |
| GET | `/api/samples/{token}` | Sample detail (sensors, annotations, nav) |
| GET | `/api/samples/{token}/camera/{channel}` | Camera image (JPEG) |
| GET | `/api/samples/{token}/lidar?max_points=40000` | LiDAR point cloud (JSON) |
| GET | `/api/samples/{token}/quality` | Data quality inspection |
