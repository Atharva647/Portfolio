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

    app.mount(
        "/static",
        StaticFiles(directory=FRONTEND_DIR),
        name="static",
    )

    app.include_router(router)

    return app


app = create_app()