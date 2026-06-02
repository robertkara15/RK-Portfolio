(function () {
    const items = document.querySelectorAll('.timeline_item');
    if (!items.length) return;

    function closeItem(item) {
        const trigger = item.querySelector('.timeline_trigger');
        const panel = item.querySelector('.timeline_panel');
        if (!trigger || !panel) return;
        trigger.setAttribute('aria-expanded', 'false');
        item.classList.remove('is-open');
        panel.hidden = true;
    }

    function openItem(item) {
        const trigger = item.querySelector('.timeline_trigger');
        const panel = item.querySelector('.timeline_panel');
        if (!trigger || !panel) return;
        trigger.setAttribute('aria-expanded', 'true');
        item.classList.add('is-open');
        panel.hidden = false;
    }

    items.forEach(function (item) {
        const trigger = item.querySelector('.timeline_trigger');
        if (!trigger) return;

        trigger.addEventListener('click', function () {
            const isOpen = item.classList.contains('is-open');

            items.forEach(closeItem);

            if (!isOpen) {
                openItem(item);
            }
        });
    });
})();
