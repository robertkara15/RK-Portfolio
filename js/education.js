(function () {
    if (document.body.getAttribute("data-page") !== "education") {
        return;
    }

    window.PhotoLightbox.init();

    document.querySelectorAll(".timeline_panel .photo_item_button").forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();

            const img = button.querySelector("img");
            if (!img || !img.src) {
                return;
            }

            const caption = img.alt || "";
            window.PhotoLightbox.open(0, [{ src: img.src, caption: caption }]);
        });
    });
})();
