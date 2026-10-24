from fastapi import APIRouter
from fastapi.responses import FileResponse

from scroll_animation_v2.core.config import FRONTEND_DIR, settings

router = APIRouter()


@router.get("/", include_in_schema=False)
def home() -> FileResponse:
    """Serve the animation homepage."""
    return FileResponse(FRONTEND_DIR / "index.html")


@router.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    """Return the application's health status."""
    return {
        "status": "ok",
        "application": settings.app_name,
        "environment": settings.environment,
    }