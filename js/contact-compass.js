(function () {
    const compass = document.getElementById('contact-compass');
    const readout = document.getElementById('contact-readout');
    const readoutDefault = document.getElementById('contact-readout-default');
    const readoutActive = document.getElementById('contact-readout-active');
    const readoutIcon = document.getElementById('contact-readout-icon');
    const readoutTitle = document.getElementById('contact-readout-title');
    const readoutDetail = document.getElementById('contact-readout-detail');
    const spinButton = document.getElementById('contact-spin-button');
    const segments = document.querySelectorAll('.contact_segment');

    const linkedinPosts = [
        'https://www.linkedin.com/posts/robert-karapetian-39900425a_last-friday-i-completed-my-summer-placement-activity-7360747151573819392-EGlL',
        'https://www.linkedin.com/posts/robert-karapetian-39900425a_i-am-proud-to-share-that-i-have-officially-activity-7355554583370235905-l5MM',
        'https://www.linkedin.com/posts/robert-karapetian-39900425a_i-am-honoured-to-have-received-the-demonstrator-activity-7343706475963334656-lBKQ',
        'https://www.linkedin.com/posts/robert-karapetian-39900425a_this-week-i-had-the-incredible-opportunity-activity-7321660414218407938-p8QI',
        'https://www.linkedin.com/posts/robert-karapetian-39900425a_eecs-qmul-github-activity-7318005885274918913-Him8',
        'https://www.linkedin.com/posts/robert-karapetian-39900425a_for-the-past-2-weeks-i-have-been-participating-activity-7241459253444558848-FkFl',
        'https://www.linkedin.com/posts/robert-karapetian-39900425a_yesterday-marked-the-end-of-my-8-weeks-working-activity-7230542190567960576-CTde',
        'https://www.linkedin.com/posts/robert-karapetian-39900425a_i-am-thrilled-to-share-that-for-the-past-activity-7087856769711886336-pUaG',
        'https://www.linkedin.com/posts/robert-karapetian-39900425a_i-am-delighted-to-announce-that-i-have-just-activity-7076305765531021312-1Llp',
    ];

    const spinOrder = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const excludedSpinDirs = new Set(['SW']);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function isReduceMotionEnabled() {
        return (
            prefersReducedMotion ||
            document.documentElement.classList.contains('a11y-reduce-motion')
        );
    }

    if (!compass || !segments.length) return;

    let isSpinning = false;

    const orderedSegments = spinOrder
        .map(function (dir) {
            return Array.from(segments).find(function (seg) {
                return seg.dataset.dir === dir;
            });
        })
        .filter(Boolean);

    const spinEligibleIndices = orderedSegments.reduce(function (indices, segment, index) {
        if (!excludedSpinDirs.has(segment.dataset.dir)) {
            indices.push(index);
        }
        return indices;
    }, []);

    function pickWinnerIndex() {
        if (!spinEligibleIndices.length) {
            return 0;
        }
        return spinEligibleIndices[Math.floor(Math.random() * spinEligibleIndices.length)];
    }

    function showDefault() {
        if (isSpinning) return;
        readoutDefault.hidden = false;
        readoutActive.hidden = true;
        readoutDefault.setAttribute('aria-hidden', 'false');
        readoutActive.setAttribute('aria-hidden', 'true');
        readout.classList.remove('is-redirecting');
        segments.forEach(function (seg) {
            seg.classList.remove('is-active');
        });
    }

    function showSegment(segment) {
        const accent = segment.dataset.accent || '#99ccff';
        readoutDefault.hidden = true;
        readoutActive.hidden = false;
        readoutDefault.setAttribute('aria-hidden', 'true');
        readoutActive.setAttribute('aria-hidden', 'false');
        readoutActive.style.setProperty('--readout-accent', accent);
        readoutIcon.className = segment.dataset.icon || 'fa-solid fa-circle';
        readoutTitle.textContent = segment.dataset.title || '';
        readoutDetail.textContent = segment.dataset.detail || '';
        segments.forEach(function (seg) {
            seg.classList.toggle('is-active', seg === segment);
        });
    }

    function pickRandomLinkedInPost() {
        return linkedinPosts[Math.floor(Math.random() * linkedinPosts.length)];
    }

    function openRandomLinkedInPost() {
        if (!linkedinPosts.length) return;
        window.open(pickRandomLinkedInPost(), '_blank', 'noopener,noreferrer');
    }

    function isRandomLinkedInSegment(segment) {
        return segment.dataset.randomLinkedin === 'true';
    }

    function navigateToSegment(segment) {
        if (isRandomLinkedInSegment(segment)) {
            openRandomLinkedInPost();
            return;
        }
        const href = segment.getAttribute('href');
        if (!href || href === '#') return;
        if (segment.getAttribute('target') === '_blank') {
            window.open(href, '_blank', 'noopener,noreferrer');
        } else {
            window.location.assign(href);
        }
    }

    function setSpinning(active) {
        isSpinning = active;
        compass.classList.toggle('is-spinning', active);
        if (spinButton) {
            spinButton.disabled = active;
            spinButton.setAttribute('aria-busy', active ? 'true' : 'false');
        }
    }

    function showRedirect(segment) {
        const title = segment.dataset.title || 'destination';
        showSegment(segment);
        readout.classList.add('is-redirecting');
        readoutDetail.textContent = isRandomLinkedInSegment(segment)
            ? 'Opening a LinkedIn post…'
            : 'Redirecting to ' + title + '…';

        window.setTimeout(function () {
            navigateToSegment(segment);
            setSpinning(false);
            readout.classList.remove('is-redirecting');
            showDefault();
        }, 2000);
    }

    function getSpinDelay(step, totalSteps) {
        const progress = step / Math.max(totalSteps - 1, 1);
        return 55 + Math.pow(progress, 2.4) * 220;
    }

    function runSpinAnimation(winnerIndex) {
        const count = orderedSegments.length;
        const minLaps = 3;
        const totalSteps = minLaps * count + winnerIndex + 1;
        let step = 0;

        function tick() {
            const index = step % count;
            showSegment(orderedSegments[index]);

            if (step >= totalSteps - 1) {
                showRedirect(orderedSegments[winnerIndex]);
                return;
            }

            step += 1;
            window.setTimeout(tick, getSpinDelay(step, totalSteps));
        }

        tick();
    }

    function spinCompass() {
        if (isSpinning || !orderedSegments.length || !spinEligibleIndices.length) return;

        const winnerIndex = pickWinnerIndex();
        setSpinning(true);

        if (isReduceMotionEnabled()) {
            showRedirect(orderedSegments[winnerIndex]);
            return;
        }

        runSpinAnimation(winnerIndex);
    }

    segments.forEach(function (segment) {
        segment.addEventListener('mouseenter', function () {
            showSegment(segment);
        });
        segment.addEventListener('focus', function () {
            showSegment(segment);
        });
        segment.addEventListener('click', function (event) {
            if (!isRandomLinkedInSegment(segment) || isSpinning) return;
            event.preventDefault();
            openRandomLinkedInPost();
        });
    });

    compass.addEventListener('mouseleave', showDefault);
    compass.addEventListener('focusout', function (event) {
        if (!compass.contains(event.relatedTarget)) {
            showDefault();
        }
    });

    if (spinButton) {
        spinButton.addEventListener('click', spinCompass);
    }

    if (location.hash === '#contact') {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
})();
