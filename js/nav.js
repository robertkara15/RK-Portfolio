(function () {
    const page = document.body.dataset.page || '';
    const beforeLogo = [
        { id: 'education', href: 'education.html', label: 'Education' },
        { id: 'experience', href: 'experience.html', label: 'Experience' },
    ];
    const afterLogo = [
        { id: 'projects', href: 'projects.html', label: 'Projects' },
        { id: 'photography', href: 'photography.html', label: 'Photography' },
    ];

    function linkHtml(item) {
        const active = item.id === page ? ' class="nav-current"' : '';
        return (
            '<li class="heading_segment">' +
            '<a href="' +
            item.href +
            '"' +
            active +
            '>' +
            item.label +
            '</a></li>'
        );
    }

    function sideLinks(items) {
        return '<ul class="heading_side_links">' + items.map(linkHtml).join('') + '</ul>';
    }

    const header = document.getElementById('site-header');
    if (!header) return;

    const logoActive = page === 'home' ? ' nav-current' : '';
    const logoLink =
        '<a href="index.html" class="heading_logo_link' +
        logoActive +
        '">' +
        '<span class="heading_logo_glints" aria-hidden="true"></span>' +
        '<img src="images/RK.png" width="58" height="58" alt="Robert Karapetian home"/>' +
        '</a>';

    header.innerHTML =
        '<hgroup><ul class="heading_bar">' +
        '<li class="heading_segment heading_mobile_logo" id="RK-2">' +
        logoLink +
        '</li>' +
        '<li class="heading_side heading_side--left">' +
        sideLinks(beforeLogo) +
        '</li>' +
        '<li class="heading_segment heading_center_logo" id="RK-1">' +
        logoLink +
        '</li>' +
        '<li class="heading_side heading_side--right">' +
        sideLinks(afterLogo) +
        '</li>' +
        '</ul></hgroup>';
})();
