def main() -> None:
    """Run the development server."""
    import uvicorn

    uvicorn.run(
        "scroll_animation_v2.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )