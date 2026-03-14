"""Global exception handlers — all errors return { \"detail\": \"...\" }."""
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


def _detail_response(detail: str | list, status_code: int) -> JSONResponse:
    return JSONResponse(content={"detail": detail}, status_code=status_code)


def register_exception_handlers(app: FastAPI) -> None:
    """Register handlers so all errors use consistent { \"detail\": ... } format."""

    @app.exception_handler(HTTPException)
    async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
        return _detail_response(exc.detail, exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        detail = exc.errors() if hasattr(exc, "errors") else str(exc)
        return _detail_response(detail, 422)

    @app.exception_handler(404)
    async def not_found_handler(_request: Request, exc: Exception) -> JSONResponse:
        return _detail_response("Not found", 404)

    @app.exception_handler(500)
    async def server_error_handler(_request: Request, exc: Exception) -> JSONResponse:
        return _detail_response("Internal server error", 500)
