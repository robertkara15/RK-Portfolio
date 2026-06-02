(function () {
    var storageKey = 'rk-a11y-prefs';

    try {
        var stored = localStorage.getItem(storageKey);
        if (!stored) {
            return;
        }

        var prefs = JSON.parse(stored);
        var root = document.documentElement;

        if (prefs.reduceMotion) {
            root.classList.add('a11y-reduce-motion');
        }
        if (prefs.largeText) {
            root.classList.add('a11y-large-text');
        }
        if (prefs.highContrast) {
            root.classList.add('a11y-high-contrast');
        }
        if (prefs.underlineLinks) {
            root.classList.add('a11y-underline-links');
        }
        if (prefs.readableFont) {
            root.classList.add('a11y-readable-font');
        }
    } catch (error) {
        /* ignore invalid storage */
    }
})();
