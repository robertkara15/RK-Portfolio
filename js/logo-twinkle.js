(function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hoverDelayMs = 2000;
    const twinkleDurationMs = 1100;

    let twinkling = false;
    let hoverTimer = null;

    function clearHoverTimer() {
        if (hoverTimer) {
            window.clearTimeout(hoverTimer);
            hoverTimer = null;
        }
    }

    function triggerTwinkle() {
        if (twinkling || prefersReducedMotion) {
            return;
        }

        twinkling = true;
        document.body.classList.add('logo-twinkle');

        window.setTimeout(function () {
            document.body.classList.remove('logo-twinkle');
            twinkling = false;
        }, twinkleDurationMs);
    }

    function bindLogo(link) {
        link.addEventListener('mouseenter', function () {
            if (twinkling || prefersReducedMotion) {
                return;
            }
            clearHoverTimer();
            hoverTimer = window.setTimeout(triggerTwinkle, hoverDelayMs);
        });

        link.addEventListener('mouseleave', clearHoverTimer);
    }

    document.querySelectorAll('.heading_logo_link').forEach(bindLogo);
})();
