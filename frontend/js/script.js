(() => {
    "use strict";

    const TOTAL_FRAMES = 240;
    const FRAME_DIRECTORY = "/static/assets/extracted_frames/";

    const canvas = document.getElementById("cube-canvas");
    const loadingMessage = document.getElementById("loading-message");

    if (!canvas) {
        console.error("Animation canvas was not found.");
        return;
    }

    const ctx = canvas.getContext("2d", { alpha: false });

    if (!ctx) {
        console.error("Canvas 2D context is unavailable.");
        return;
    }

    const images = new Array(TOTAL_FRAMES);

    let currentFrame = 1;
    let targetFrame = 1;
    let lastDrawnFrame = -1;
    let loadedCount = 0;
    let animationStarted = false;

    let canvasWidth = 0;
    let canvasHeight = 0;

    /**
     * Return the URL of a frame.
     * Example: /static/assets/frames/frame_0001.png
     */
    function getFrameUrl(index) {
        const padded = String(index).padStart(4, "0");
        return `${FRAME_DIRECTORY}frame_${padded}.png`;
    }

    /**
     * Resize the canvas for the current viewport.
     */
    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;

        canvas.width = Math.round(canvasWidth * dpr);
        canvas.height = Math.round(canvasHeight * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        lastDrawnFrame = -1;
        render(Math.round(currentFrame));
    }

    /**
     * Find the nearest successfully loaded image.
     */
    function getRenderableImage(frameIndex) {
        const requestedIndex = Math.max(
            0,
            Math.min(TOTAL_FRAMES - 1, frameIndex - 1)
        );

        const requestedImage = images[requestedIndex];

        if (
            requestedImage &&
            requestedImage.complete &&
            requestedImage.naturalWidth > 0
        ) {
            return requestedImage;
        }

        for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
            const previousIndex = requestedIndex - offset;
            const nextIndex = requestedIndex + offset;

            if (previousIndex >= 0) {
                const previousImage = images[previousIndex];

                if (
                    previousImage &&
                    previousImage.complete &&
                    previousImage.naturalWidth > 0
                ) {
                    return previousImage;
                }
            }

            if (nextIndex < TOTAL_FRAMES) {
                const nextImage = images[nextIndex];

                if (
                    nextImage &&
                    nextImage.complete &&
                    nextImage.naturalWidth > 0
                ) {
                    return nextImage;
                }
            }
        }

        return null;
    }

    /**
     * Draw a frame onto the canvas.
     */
    function render(frameIndex) {
        const image = getRenderableImage(frameIndex);

        if (!image) {
            return;
        }

        const frameId = images.indexOf(image);

        if (frameId === lastDrawnFrame) {
            return;
        }

        lastDrawnFrame = frameId;

        const imageWidth = image.naturalWidth;
        const imageHeight = image.naturalHeight;

        const screenRatio = canvasWidth / canvasHeight;
        const imageRatio = imageWidth / imageHeight;

        let scale;

        if (screenRatio < 0.9) {
            // On narrow screens, keep the image fully visible when possible.
            scale = Math.min(
                canvasWidth / imageWidth,
                canvasHeight / imageHeight
            );
        } else {
            // On wider screens, fill the viewport and crop overflow.
            scale = Math.max(
                canvasWidth / imageWidth,
                canvasHeight / imageHeight
            );
        }

        const drawWidth = imageWidth * scale;
        const drawHeight = imageHeight * scale;

        const drawX = (canvasWidth - drawWidth) / 2;
        const drawY = (canvasHeight - drawHeight) / 2;

        ctx.fillStyle = "#0a1228";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.drawImage(
            image,
            drawX,
            drawY,
            drawWidth,
            drawHeight
        );
    }

    /**
     * Preload all animation frames.
     */
    function preloadFrames() {
        for (let index = 1; index <= TOTAL_FRAMES; index++) {
            const image = new Image();

            images[index - 1] = image;

            image.onload = () => {
                loadedCount++;

                if (!animationStarted) {
                    animationStarted = true;

                    if (loadingMessage) {
                        loadingMessage.hidden = true;
                    }

                    render(Math.round(currentFrame));
                } else {
                    render(Math.round(currentFrame));
                }
            };

            image.onerror = () => {
                console.error(`Failed to load frame: ${getFrameUrl(index)}`);
            };

            image.src = getFrameUrl(index);
        }
    }

    /**
     * Convert scroll progress into a target frame.
     */
    function onScroll() {
        const documentHeight = document.documentElement.scrollHeight;
        const maxScroll = documentHeight - window.innerHeight;

        const scrollY =
            window.scrollY ||
            document.documentElement.scrollTop ||
            0;

        const progress = maxScroll > 0
            ? Math.min(Math.max(scrollY / maxScroll, 0), 1)
            : 0;

        targetFrame = 1 + progress * (TOTAL_FRAMES - 1);
    }

    /**
     * Smoothly animate toward the target frame.
     */
    function animate() {
        const difference = targetFrame - currentFrame;

        if (Math.abs(difference) > 0.001) {
            currentFrame += difference * 0.085;

            if (Math.abs(targetFrame - currentFrame) < 0.01) {
                currentFrame = targetFrame;
            }

            render(Math.round(currentFrame));
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resizeCanvas, {
        passive: true
    });

    window.addEventListener("scroll", onScroll, {
        passive: true
    });

    resizeCanvas();
    onScroll();
    preloadFrames();

    requestAnimationFrame(animate);
})();