"""
Run background worker locally: consumes Redis queue and runs jobs.

Usage (from backend directory):
  python -m app.worker.run_worker

Or:
  python app/worker/run_worker.py
"""
import json
import os
import sys

# Ensure app is on path when run as script
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import redis
from app.config import get_settings
from app.worker.tasks import run_job

QUEUE_KEY = "backend:jobs"
BLOCK_TIMEOUT = 5


def main() -> None:
    settings = get_settings()
    try:
        r = redis.from_url(settings.redis_url)
        r.ping()
    except Exception as e:
        print(f"Redis connection failed: {e}. Start Redis locally or set REDIS_URL.")
        sys.exit(1)

    print(f"Worker listening on {QUEUE_KEY} (Redis: {settings.redis_url})")
    while True:
        try:
            # Block until a job is available (list is used as queue: LPUSH / BRPOP)
            result = r.brpop(QUEUE_KEY, timeout=BLOCK_TIMEOUT)
            if not result:
                continue
            _key, raw = result
            data = json.loads(raw)
            job_type = data.get("job")
            payload = data.get("payload", data)
            if job_type:
                print(f"Job: {job_type} {payload}")
                run_job(job_type, payload)
            else:
                print("Unknown job:", data)
        except json.JSONDecodeError as e:
            print("Invalid job JSON:", e)
        except KeyboardInterrupt:
            print("Worker stopped.")
            break
        except Exception as e:
            print("Job error:", e)


if __name__ == "__main__":
    main()
