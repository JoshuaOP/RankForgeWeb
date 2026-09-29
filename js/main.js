document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            const isOpen = navLinks.style.display === "flex";
            
            if (isOpen) {
                navLinks.style.display = "none";
            } else {
                navLinks.style.display = "flex";
                navLinks.style.flexDirection = "column";
                navLinks.style.position = "absolute";
                navLinks.style.top = "70px";
                navLinks.style.left = "0";
                navLinks.style.width = "100%";
                navLinks.style.background = "var(--card-bg)";
                navLinks.style.padding = "1.5rem";
                navLinks.style.borderBottom = "1px solid var(--border-color)";
            }
        });

        // Automatically clear inline styles if the screen is resized back to desktop view
        window.addEventListener("resize", () => {
            if (window.innerWidth > 768) {
                navLinks.removeAttribute("style");
            }
        });
    }
});
