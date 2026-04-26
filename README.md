# Nested Tags Tree - Full Stack Assignment Solution

This project implements the assignment using:
- Frontend: React + Tailwind CSS (Vite)
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL (JSONB storage)

## Project Structure

- `backend/` - FastAPI API + DB model
- `frontend/` - React app with recursive `TagView`
- `docker-compose.yml` - PostgreSQL + backend containers

## Features Implemented

- Recursive `TagView` component for nested tags.
- Each node supports exactly one of:
  - `children` array (nested tags), or
  - `data` string (editable input)
- Collapsible tags recursively (including root):
  - `v` for expanded
  - `>` for collapsed
- `Add Child` behavior:
  - If node already has `children`, append a new child.
  - If node has `data`, replace `data` with `children` containing one new child:
    - `name: "New Child"`
    - `data: "Data"`
- Bonus implemented: rename tag by clicking tag name, editing input, and pressing `Enter`.
- Export button:
  - Outputs JSON with only `name`, `children`, `data`.
  - Saves to backend using:
    - `POST /api/trees` for new unsaved tree
    - `PUT /api/trees/{id}` for existing tree
- On page load, frontend calls `GET /api/trees` and displays all saved trees one below another.

## Backend Setup

1. Start PostgreSQL and the backend API (Docker):

```bash
docker compose up -d --build
```

2. Or run the backend locally if you prefer:

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
```

3. Configure environment:

```bash
copy .env.example .env
```

4. Run FastAPI:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend URL: `http://localhost:8000`\
```bash 
### Note:
For assingment purpose database url is exposed in docker-compose.yml file, but in production consider using secrets management.
```

## Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. (Optional) Set custom API URL in `.env`:

```env
VITE_API_URL=http://localhost:8000
```

3. Run frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## API Endpoints

- `GET /api/trees` - list all tree records
- `POST /api/trees` - create a tree record
- `PUT /api/trees/{tree_id}` - update an existing tree record

## Database Schema

Table: `tree_records`

- `id` (PK)
- `tree` (JSONB, stores complete hierarchy)
- `created_at` (timestamp with timezone)
- `updated_at` (timestamp with timezone)

This schema is suitable for recursive tree storage and direct retrieval in original JSON shape.
