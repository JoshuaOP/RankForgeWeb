document.addEventListener("DOMContentLoaded", () => {
    const search = document.getElementById("docsSearch");
    const sections = [...document.querySelectorAll(".docs-section")];
    const links = [...document.querySelectorAll(".docs-sidebar a")];

    if (search) {
        search.addEventListener("input", () => {
            const query = search.value.trim().toLowerCase();

            sections.forEach((section) => {
                const matches = !query || section.textContent.toLowerCase().includes(query);
                section.classList.toggle("docs-filtered", !matches);
            });
        });
    }

    const updateActiveLink = () => {
        const visibleSections = sections.filter((section) => !section.classList.contains("docs-filtered"));
        const current = visibleSections.reduce((active, section) => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop <= 130 && (!active || sectionTop > active.getBoundingClientRect().top)) {
                return section;
            }
            return active;
        }, visibleSections[0]);

        links.forEach((link) => {
            link.classList.toggle("active", current && link.hash === `#${current.id}`);
        });
    };

    if (sections.length && links.length) {
        window.addEventListener("scroll", updateActiveLink, { passive: true });
        updateActiveLink();
    }
});