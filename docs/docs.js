document.addEventListener("DOMContentLoaded", () => {
    const search = document.getElementById("docsSearch");
    const sections = [...document.querySelectorAll(".docs-section")];
    const links = [...document.querySelectorAll(".docs-sidebar a")];

    // Search functionality
    if (search) {
        search.addEventListener("input", () => {
            const query = search.value.trim().toLowerCase();

            sections.forEach((section) => {
                const matches = !query || section.textContent.toLowerCase().includes(query);
                section.classList.toggle("docs-filtered", !matches);
            });
        });
    }

    // Scroll spy for sidebar active links
    const updateActiveLink = () => {
        const visibleSections = sections.filter((section) => !section.classList.contains("docs-filtered"));
        
        const current = visibleSections.reduce((active, section) => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop <= 130 && (!active || sectionTop > active.getBoundingClientRect().top)) {
                return section;
            }
            return active;
        }, null);

        links.forEach((link) => {
            let matches = false;
            if (current) {
                const targetId = link.hash.substring(1);
                // Check if the section itself or any element inside it matches the sidebar link hash
                const hasId = current.id === targetId || current.querySelector(`#${CSS.escape(targetId)}`);
                matches = Boolean(hasId);
            }
            link.classList.toggle("active", matches);
        });
    };

    if (sections.length && links.length) {
        window.addEventListener("scroll", updateActiveLink, { passive: true });
        updateActiveLink();
    }
});
