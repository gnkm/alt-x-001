"""SimplePost backend API main entry point."""

from fastapi import FastAPI

app = FastAPI(
    title="SimplePost API",
    description="X.com clone backend API",
    version="0.1.0",
)


@app.get("/health")
async def health() -> dict[str, str]:
    """Health check endpoint.

    Returns:
        dict[str, str]: Health status

    """
    return {"status": "ok"}
