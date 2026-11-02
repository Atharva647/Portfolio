
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from scroll_animation_v2.api.routes import router
from scroll_animation_v2.core.config import FRONTEND_DIR, settings


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
    )

    # Register API routes first.
    app.include_router(router)

    # Serve frontend files from the website root.
    app.mount(
        "/",
        StaticFiles(directory=FRONTEND_DIR),
        name="frontend",
    )

    return app


app = create_app()
