(function () {
    var storageKey = 'rk-a11y-prefs';
    var classMap = {
        reduceMotion: 'a11y-reduce-motion',
        largeText: 'a11y-large-text',
        highContrast: 'a11y-high-contrast',
        underlineLinks: 'a11y-underline-links',
        readableFont: 'a11y-readable-font',
    };

    function loadPrefs() {
        try {
            var stored = localStorage.getItem(storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            /* ignore */
        }

        return {
            reduceMotion: false,
            largeText: false,
            highContrast: false,
            underlineLinks: false,
            readableFont: false,
        };
    }

    function savePrefs(prefs) {
        localStorage.setItem(storageKey, JSON.stringify(prefs));
    }

    function applyPrefs(prefs) {
        var root = document.documentElement;

        Object.keys(classMap).forEach(function (key) {
            root.classList.toggle(classMap[key], Boolean(prefs[key]));
        });
    }

    function ensureMainTarget() {
        var main = document.querySelector('.main');
        if (main && !main.id) {
            main.id = 'main-content';
        }
        if (main && !main.hasAttribute('tabindex')) {
            main.setAttribute('tabindex', '-1');
        }
    }

    function buildWidget(prefs) {
        var skipLink = document.createElement('a');
        skipLink.className = 'skip-link';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';

        var widget = document.createElement('div');
        widget.className = 'a11y-widget';
        widget.innerHTML =
            '<button type="button" class="a11y-widget_toggle" id="a11y-widget-toggle" aria-expanded="false" aria-controls="a11y-panel">' +
            '<i class="fa-solid fa-universal-access" aria-hidden="true"></i>' +
            '<span>Accessibility</span>' +
            '</button>' +
            '<div id="a11y-panel" class="a11y-panel" role="region" aria-labelledby="a11y-panel-title" hidden>' +
            '<h2 class="a11y-panel_title" id="a11y-panel-title">Accessibility options</h2>' +
            '<ul class="a11y-options">' +
            '<li><label class="a11y-option"><input type="checkbox" data-a11y="reduceMotion"> Reduce motion</label></li>' +
            '<li><label class="a11y-option"><input type="checkbox" data-a11y="largeText"> Large text</label></li>' +
            '<li><label class="a11y-option"><input type="checkbox" data-a11y="highContrast"> High contrast</label></li>' +
            '<li><label class="a11y-option"><input type="checkbox" data-a11y="underlineLinks"> Underline links</label></li>' +
            '<li><label class="a11y-option"><input type="checkbox" data-a11y="readableFont"> Readable font</label></li>' +
            '</ul>' +
            '</div>';

        document.body.insertBefore(skipLink, document.body.firstChild);
        document.body.appendChild(widget);

        var toggle = document.getElementById('a11y-widget-toggle');
        var panel = document.getElementById('a11y-panel');
        var inputs = panel.querySelectorAll('input[data-a11y]');

        inputs.forEach(function (input) {
            var key = input.getAttribute('data-a11y');
            input.checked = Boolean(prefs[key]);
            input.addEventListener('change', function () {
                prefs[key] = input.checked;
                applyPrefs(prefs);
                savePrefs(prefs);
            });
        });

        toggle.addEventListener('click', function () {
            var isOpen = !panel.hidden;
            panel.hidden = isOpen;
            toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        });

        document.addEventListener('click', function (event) {
            if (panel.hidden) {
                return;
            }
            if (!widget.contains(event.target)) {
                panel.hidden = true;
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !panel.hidden) {
                panel.hidden = true;
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    }

    function initFromSystemIfNeeded(prefs) {
        var hasStored;
        try {
            hasStored = Boolean(localStorage.getItem(storageKey));
        } catch (error) {
            hasStored = true;
        }

        if (hasStored) {
            return prefs;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            prefs.reduceMotion = true;
            applyPrefs(prefs);
            savePrefs(prefs);
        }

        return prefs;
    }

    ensureMainTarget();
    var prefs = initFromSystemIfNeeded(loadPrefs());
    applyPrefs(prefs);
    buildWidget(prefs);
})();
