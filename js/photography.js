(function () {
    const navEl = document.getElementById("photography-album-nav");
    const titleEl = document.getElementById("photography-album-title");
    const subtitleEl = document.getElementById("photography-album-subtitle");
    const gridEl = document.getElementById("photography-grid");
    const emptyEl = document.getElementById("photography-empty");
    const randomButtonEl = document.getElementById("photography-random-button");
    const lightboxEl = document.getElementById("photo-lightbox");
    const lightboxImgEl = document.getElementById("photo-lightbox-img");
    const lightboxCaptionEl = document.getElementById("photo-lightbox-caption");
    const lightboxCloseEl = document.getElementById("photo-lightbox-close");
    const lightboxPrevEl = document.getElementById("photo-lightbox-prev");
    const lightboxNextEl = document.getElementById("photo-lightbox-next");

    if (!navEl || !gridEl) return;

    let currentPhotos = [];
    let allPhotos = [];
    let lightboxPhotos = [];
    let lightboxIndex = -1;

    function getAlbumIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("album");
    }

    function albumPageHref(albumId) {
        if (albumId === "home") {
            return "photography.html";
        }
        return "photography.html?album=" + encodeURIComponent(albumId);
    }

    function flattenAlbumPhotos(albums) {
        const photos = [];
        albums.forEach(function (album) {
            if (!album || !album.photos) return;
            album.photos.forEach(function (photo) {
                if (!photo || !photo.src) return;
                if (photo.src.indexOf("images/photography/") !== 0) return;
                photos.push(photo);
            });
        });
        return photos;
    }

    function setRandomButtonEnabled(enabled) {
        if (!randomButtonEl) return;
        randomButtonEl.disabled = !enabled;
    }

    function renderNav(albums, activeId) {
        navEl.querySelectorAll(".photography_album_link").forEach(function (link) {
            link.remove();
        });
        albums.forEach(function (album) {
            const link = document.createElement("a");
            link.href = albumPageHref(album.id);
            link.textContent = album.title;
            link.className = "photography_album_link";
            if (album.id === activeId) {
                link.classList.add("is-active");
                link.setAttribute("aria-current", "page");
            }
            if (randomButtonEl) {
                navEl.insertBefore(link, randomButtonEl);
            } else {
                navEl.appendChild(link);
            }
        });
    }

    function openLightbox(index, photoSet) {
        lightboxPhotos = photoSet || currentPhotos;
        if (!lightboxEl || !lightboxPhotos.length || index < 0 || index >= lightboxPhotos.length) {
            return;
        }

        lightboxIndex = index;
        const photo = lightboxPhotos[index];
        lightboxImgEl.src = photo.src;
        lightboxImgEl.alt = photo.caption || photo.name;
        lightboxCaptionEl.textContent = photo.caption || photo.name;

        const showNav = lightboxPhotos.length > 1;
        lightboxPrevEl.hidden = !showNav;
        lightboxNextEl.hidden = !showNav;

        lightboxEl.hidden = false;
        lightboxEl.setAttribute("aria-hidden", "false");
        document.body.classList.add("photo-lightbox-open");
        lightboxCloseEl.focus();
    }

    function closeLightbox() {
        if (!lightboxEl || lightboxEl.hidden) {
            return;
        }

        lightboxEl.hidden = true;
        lightboxEl.setAttribute("aria-hidden", "true");
        document.body.classList.remove("photo-lightbox-open");
        lightboxImgEl.removeAttribute("src");
        lightboxIndex = -1;
        lightboxPhotos = [];
    }

    function showLightboxStep(delta) {
        if (!lightboxPhotos.length) {
            return;
        }
        const nextIndex = (lightboxIndex + delta + lightboxPhotos.length) % lightboxPhotos.length;
        openLightbox(nextIndex, lightboxPhotos);
    }

    function openRandomPhoto() {
        if (!allPhotos.length) return;
        const index = Math.floor(Math.random() * allPhotos.length);
        openLightbox(index, allPhotos);
    }

    function initLightbox() {
        if (!lightboxEl) {
            return;
        }

        lightboxCloseEl.addEventListener("click", closeLightbox);
        lightboxPrevEl.addEventListener("click", function () {
            showLightboxStep(-1);
        });
        lightboxNextEl.addEventListener("click", function () {
            showLightboxStep(1);
        });

        lightboxEl.addEventListener("click", function (event) {
            if (event.target === lightboxEl) {
                closeLightbox();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (lightboxEl.hidden) {
                return;
            }
            if (event.key === "Escape") {
                closeLightbox();
            } else if (event.key === "ArrowLeft") {
                showLightboxStep(-1);
            } else if (event.key === "ArrowRight") {
                showLightboxStep(1);
            }
        });
    }

    function renderGrid(album) {
        gridEl.innerHTML = "";
        currentPhotos = album && album.photos ? album.photos : [];

        if (!album || !album.photos.length) {
            emptyEl.hidden = false;
            emptyEl.textContent =
                "No photos in this album yet. Add images to images/photography/" +
                (album ? album.id + "/" : "") +
                " and run scripts/generate-photography-albums.py.";
            if (titleEl) titleEl.textContent = album ? album.title : "Photography";
            if (subtitleEl) subtitleEl.hidden = true;
            return;
        }

        emptyEl.hidden = true;
        if (titleEl) titleEl.textContent = album.title;
        if (subtitleEl) {
            if (album.id === "home") {
                subtitleEl.textContent = "Some of my personal favourites";
                subtitleEl.hidden = false;
            } else {
                subtitleEl.hidden = true;
            }
        }

        album.photos.forEach(function (photo, index) {
            const figure = document.createElement("figure");
            figure.className = "photo_item";

            const button = document.createElement("button");
            button.type = "button";
            button.className = "photo_item_button";
            button.setAttribute("aria-label", "View " + (photo.caption || photo.name) + " fullscreen");

            const img = document.createElement("img");
            img.src = photo.src;
            img.alt = photo.caption || photo.name;
            img.loading = "lazy";

            button.appendChild(img);
            figure.appendChild(button);

            button.addEventListener("click", function () {
                openLightbox(index);
            });

            gridEl.appendChild(figure);
        });
    }

    initLightbox();

    if (randomButtonEl) {
        randomButtonEl.addEventListener("click", openRandomPhoto);
    }

    fetch("data/photography-albums.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Could not load photography albums.");
            }
            return response.json();
        })
        .then(function (data) {
            const albums = data.albums || [];
            allPhotos = flattenAlbumPhotos(albums);
            setRandomButtonEnabled(allPhotos.length > 0);

            const defaultId = data.defaultAlbum || "home";
            const requestedId = getAlbumIdFromUrl();
            const activeAlbum =
                albums.find(function (album) {
                    return album.id === requestedId;
                }) ||
                albums.find(function (album) {
                    return album.id === defaultId;
                }) ||
                albums[0];

            renderNav(albums, activeAlbum ? activeAlbum.id : defaultId);
            renderGrid(activeAlbum);
        })
        .catch(function () {
            navEl.querySelectorAll(".photography_album_link").forEach(function (link) {
                link.remove();
            });
            setRandomButtonEnabled(false);
            emptyEl.hidden = false;
            emptyEl.textContent =
                "Could not load albums. Run scripts/generate-photography-albums.py and refresh.";
            if (titleEl) titleEl.textContent = "Photography";
        });
})();
