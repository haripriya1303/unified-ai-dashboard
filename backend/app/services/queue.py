"""Push jobs to Redis queue for the worker."""
import json

import redis
from app.config import get_settings

QUEUE_KEY = "backend:jobs"
_redis: redis.Redis | None = None


def get_redis() -> redis.Redis | None:
    """Return Redis client or None if not configured."""
    global _redis
    if _redis is not None:
        return _redis
    try:
        url = get_settings().redis_url
        r = redis.from_url(url)
        r.ping()
        _redis = r
        return _redis
    except Exception:
        return None


def enqueue(job_type: str, payload: dict) -> bool:
    """Push job to queue. Returns True if enqueued."""
    r = get_redis()
    if not r:
        return False
    try:
        r.lpush(QUEUE_KEY, json.dumps({"job": job_type, "payload": payload}))
        return True
    except Exception:
        return False
