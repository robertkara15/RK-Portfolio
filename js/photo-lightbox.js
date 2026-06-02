window.PhotoLightbox = (function () {
    let lightboxEl;
    let lightboxImgEl;
    let lightboxCaptionEl;
    let lightboxCloseEl;
    let lightboxPrevEl;
    let lightboxNextEl;
    let lightboxPhotos = [];
    let lightboxIndex = -1;
    let initialized = false;

    function getElements() {
        lightboxEl = document.getElementById("photo-lightbox");
        if (!lightboxEl) {
            return false;
        }
        lightboxImgEl = document.getElementById("photo-lightbox-img");
        lightboxCaptionEl = document.getElementById("photo-lightbox-caption");
        lightboxCloseEl = document.getElementById("photo-lightbox-close");
        lightboxPrevEl = document.getElementById("photo-lightbox-prev");
        lightboxNextEl = document.getElementById("photo-lightbox-next");
        return !!(
            lightboxImgEl &&
            lightboxCaptionEl &&
            lightboxCloseEl &&
            lightboxPrevEl &&
            lightboxNextEl
        );
    }

    function open(index, photoSet) {
        if (!getElements()) {
            return;
        }

        lightboxPhotos = photoSet || [];
        if (!lightboxPhotos.length || index < 0 || index >= lightboxPhotos.length) {
            return;
        }

        lightboxIndex = index;
        const photo = lightboxPhotos[index];
        lightboxImgEl.src = photo.src;
        lightboxImgEl.alt = photo.caption || photo.name || "";
        lightboxCaptionEl.textContent = photo.caption || photo.name || "";

        const showNav = lightboxPhotos.length > 1;
        lightboxPrevEl.hidden = !showNav;
        lightboxNextEl.hidden = !showNav;

        lightboxEl.hidden = false;
        lightboxEl.setAttribute("aria-hidden", "false");
        document.body.classList.add("photo-lightbox-open");
        lightboxCloseEl.focus();
    }

    function close() {
        if (!lightboxEl || lightboxEl.hidden) {
            return;
        }

        lightboxEl.hidden = true;
        lightboxEl.setAttribute("aria-hidden", "true");
        document.body.classList.remove("photo-lightbox-open");
        if (lightboxImgEl) {
            lightboxImgEl.removeAttribute("src");
        }
        lightboxIndex = -1;
        lightboxPhotos = [];
    }

    function showStep(delta) {
        if (!lightboxPhotos.length) {
            return;
        }
        const nextIndex = (lightboxIndex + delta + lightboxPhotos.length) % lightboxPhotos.length;
        open(nextIndex, lightboxPhotos);
    }

    function init() {
        if (initialized || !getElements()) {
            return;
        }
        initialized = true;

        lightboxCloseEl.addEventListener("click", close);
        lightboxPrevEl.addEventListener("click", function () {
            showStep(-1);
        });
        lightboxNextEl.addEventListener("click", function () {
            showStep(1);
        });

        lightboxEl.addEventListener("click", function (event) {
            if (event.target === lightboxEl) {
                close();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (!lightboxEl || lightboxEl.hidden) {
                return;
            }
            if (event.key === "Escape") {
                close();
            } else if (event.key === "ArrowLeft") {
                showStep(-1);
            } else if (event.key === "ArrowRight") {
                showStep(1);
            }
        });
    }

    return {
        init: init,
        open: open,
        close: close,
        isOpen: function () {
            return lightboxEl && !lightboxEl.hidden;
        },
    };
})();
