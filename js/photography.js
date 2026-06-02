(function () {
    const navEl = document.getElementById("photography-album-nav");
    const titleEl = document.getElementById("photography-album-title");
    const subtitleEl = document.getElementById("photography-album-subtitle");
    const gridEl = document.getElementById("photography-grid");
    const emptyEl = document.getElementById("photography-empty");
    const randomButtonEl = document.getElementById("photography-random-button");
    if (!navEl || !gridEl) return;

    let currentPhotos = [];
    let allPhotos = [];

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

    function openRandomPhoto() {
        if (!allPhotos.length) return;
        const index = Math.floor(Math.random() * allPhotos.length);
        window.PhotoLightbox.open(0, [allPhotos[index]]);
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
            if (album.subtitle) {
                subtitleEl.textContent = album.subtitle;
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
            img.src = photo.thumb || photo.src;
            img.alt = photo.caption || photo.name;
            img.loading = "lazy";
            img.decoding = "async";
            img.addEventListener("error", function () {
                if (photo.thumb && img.src.indexOf(photo.thumb) !== -1) {
                    img.src = photo.src;
                }
            });

            button.appendChild(img);
            figure.appendChild(button);

            button.addEventListener("click", function () {
                window.PhotoLightbox.open(index, currentPhotos);
            });

            gridEl.appendChild(figure);
        });
    }

    window.PhotoLightbox.init();

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
