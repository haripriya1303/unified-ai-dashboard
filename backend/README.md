# Unified AI Dashboard — Backend

FastAPI backend for the Unified AI Dashboard. Runs **locally** (no Docker).

---

## Local development setup

### 1. Install Python

- Install **Python 3.11 or newer**.
- Verify: `python --version` or `python3 --version`.

### 2. Install PostgreSQL

- Install PostgreSQL and start the server (e.g. as a system service).
- Create a database for the app, for example:

  ```sql
  CREATE DATABASE unified_ai_dashboard;
  ```

- Install the **pgvector** extension (required for embeddings). From the `unified_ai_dashboard` database:

  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

  (Or rely on the first Alembic migration, which runs this.)

### 3. Install Redis (optional but recommended)

- Install Redis and start it locally (e.g. default port 6379).
- Used for: dashboard cache, background job queue. If Redis is not running, the API still works; caching and workers are skipped.

### 4. Backend: install dependencies and configure

From the **project root** (parent of `backend`):

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

- **Windows (PowerShell):** `.\.venv\Scripts\Activate.ps1`
- **Windows (cmd):** `.venv\Scripts\activate.bat`
- **macOS/Linux:** `source .venv/bin/activate`

Then:

```bash
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` and set at least:

- `DATABASE_URL` — e.g. `postgresql+asyncpg://postgres:postgres@localhost:5432/unified_ai_dashboard`
- For local dev without Supabase: `DEV_AUTH_BYPASS=true`
- If using Supabase auth: `SUPABASE_URL`, `SUPABASE_JWT_SECRET`
- `REDIS_URL` — e.g. `redis://localhost:6379/0` (optional)
- For assistant/RAG: `OPENAI_API_KEY`, `OPENAI_API_BASE`, `OPENAI_MODEL`, `EMBEDDING_MODEL`

### 5. Run migrations

From the `backend` directory (with venv active):

```bash
alembic upgrade head
```

### 6. Start the backend API

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000  
- OpenAPI docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  

### 7. (Optional) Start the background worker

In a **second terminal**, from the project root:

```bash
cd backend
.\.venv\Scripts\Activate.ps1   # or source .venv/bin/activate on macOS/Linux
python -m app.worker.run_worker
```

This processes jobs from the Redis queue (e.g. document indexing). If Redis is not running, the worker will exit with an error.

### 8. Run the frontend

From the **project root** (where `package.json` is):

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- It uses the API at `http://localhost:8000/api` (see frontend `src/services/api.ts`).

---

## Summary: run everything locally

| Step | Command | Where |
|------|--------|--------|
| 1 | `pip install -r requirements.txt` | backend (venv active) |
| 2 | `alembic upgrade head` | backend |
| 3 | `uvicorn app.main:app --reload` | backend |
| 4 | `python -m app.worker.run_worker` | backend (second terminal, optional) |
| 5 | `npm run dev` | project root |

No Docker or containers; everything runs on the host.

---

## Project structure

```
backend/
├── app/
│   ├── api/v1/       # Route handlers (dashboard, activity, search, integrations, assistant, webhooks)
│   ├── services/     # Business logic
│   ├── db/           # SQLAlchemy models and session
│   ├── schemas/      # Pydantic request/response
│   ├── ai/            # Embeddings and RAG
│   ├── integrations/  # External API clients (stub)
│   ├── middleware/    # Error handling
│   ├── worker/        # Background jobs (run_worker.py)
│   └── main.py
├── alembic/           # Migrations
├── requirements.txt
├── .env.example
└── README.md
```

## Environment variables

See `.env.example`. Main ones:

- `DATABASE_URL` — PostgreSQL (async): `postgresql+asyncpg://user:pass@localhost:5432/dbname`
- `SUPABASE_URL`, `SUPABASE_JWT_SECRET` — for JWT verification
- `DEV_AUTH_BYPASS=true` — skip auth in local dev (no Supabase required)
- `REDIS_URL` — for cache and workers (e.g. `redis://localhost:6379/0`)
- `OPENAI_API_KEY`, `OPENAI_API_BASE`, `OPENAI_MODEL` — for assistant and RAG
- `EMBEDDING_MODEL`, `EMBEDDING_DIMENSION` — for vector search
