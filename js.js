document.addEventListener("DOMContentLoaded", () => {

    // 1. PLYNULÉ NAČTENÍ A PŘECHODY MEZI PODSTRÁNKAMI
    requestAnimationFrame(() => {
        document.body.classList.add("page-ready");
    });

    // 2. AUTOMATICKÉ MOBILNÍ HAMBURGER MENU (Vloží se do všech podstránek)
    const navbar = document.querySelector(".navbar");
    const navElement = navbar ? navbar.querySelector("nav") : null;
    const dropdown = navbar ? navbar.querySelector(".dropdown") : null;

    if (navbar && navElement) {
        const menuToggle = document.createElement("button");
        menuToggle.className = "menu-toggle";
        menuToggle.setAttribute("aria-label", "Toggle Navigation");
        menuToggle.innerHTML = `<span></span><span></span><span></span>`;
        navbar.insertBefore(menuToggle, navElement);

        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle("open");
            navElement.classList.toggle("nav-open");
        });

        // Rozbalení "Projects ▾" na mobilu prvním klepnutím
        if (dropdown) {
            const dropLink = dropdown.querySelector("a");
            if (dropLink) {
                dropLink.addEventListener("click", (e) => {
                    if (window.innerWidth <= 768 && !dropdown.classList.contains("mobile-open")) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        dropdown.classList.add("mobile-open");
                    }
                });
            }
        }

        // Zavření menu při kliknutí mimo něj
        document.addEventListener("click", (e) => {
            if (!navbar.contains(e.target)) {
                menuToggle.classList.remove("open");
                navElement.classList.remove("nav-open");
                if (dropdown) dropdown.classList.remove("mobile-open");
            }
        });
    }

    // Plynulý přechod při kliknutí na interní odkaz
    const internalLinks = document.querySelectorAll('a[href]');
    internalLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            if (e.defaultPrevented) return;

            const href = link.getAttribute("href");
            const target = link.getAttribute("target");

            if (
                !href ||
                href.startsWith("#") ||
                href.startsWith("http") ||
                href.startsWith("mailto:") ||
                target === "_blank" ||
                e.metaKey ||
                e.ctrlKey
            ) {
                return;
            }

            e.preventDefault();
            document.body.classList.add("page-leaving");

            setTimeout(() => {
                window.location.href = href;
            }, 240);
        });
    });

    window.addEventListener("pageshow", () => {
        document.body.classList.remove("page-leaving");
        document.body.classList.add("page-ready");
    });

    // 3. HORNÍ SCROLL PROGRESS BAR + ZMENŠENÍ NAVBARU PŘI SCROLLU
    const progressBar = document.createElement("div");
    progressBar.className = "scroll-progress";
    document.body.prepend(progressBar);

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = `${progress}%`;

        if (navbar) {
            if (scrollTop > 30) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        }
    });

    // 4. EFEKTY KURZORU A 3D NAKLÁNĚNÍ KARET (Pouze na zařízeních s myší)
    const isTouchDevice = window.matchMedia("(hover: none)").matches;

    if (!isTouchDevice) {
        const ambientLight = document.createElement("div");
        ambientLight.className = "cursor-ambient";
        document.body.appendChild(ambientLight);

        window.addEventListener("mousemove", (e) => {
            ambientLight.style.left = `${e.clientX}px`;
            ambientLight.style.top = `${e.clientY}px`;
        });

        const interactiveCards = document.querySelectorAll(
            ".flagship-card, .project-card, .bottom-card, .info-box, .hub-card, .gallery-item"
        );

        interactiveCards.forEach(card => {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty("--mouse-x", `${x}px`);
                card.style.setProperty("--mouse-y", `${y}px`);

                if (card.classList.contains("project-card") && window.innerWidth > 768) {
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -3.5;
                    const rotateY = ((x - centerX) / centerX) * 3.5;
                    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
                }
            });

            card.addEventListener("mouseleave", () => {
                if (card.classList.contains("project-card")) {
                    card.style.transform = "";
                }
            });
        });
    }

    // 5. SCROLL REVEAL (POSTUPNÉ VYJÍŽDĚNÍ PRVKŮ PŘI SCROLLOVÁNÍ)
    const elementsToReveal = document.querySelectorAll(
        ".hero-content, .section-header, .flagship-card, .project-card, .bottom-card, .video-showcase, .about-grid > div, .gallery-item, .hub-card"
    );

    elementsToReveal.forEach((el, index) => {
        el.classList.add("reveal-item");
        el.style.transitionDelay = `${(index % 4) * 65}ms`;
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elementsToReveal.forEach(el => revealObserver.observe(el));

    // 6. RYCHLÝ CYBER-DECODE EFEKT NA SECTION TAGU (// ...)
    const tags = document.querySelectorAll(".section-tag");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789//_#";

    tags.forEach(tag => {
        const originalText = tag.textContent;
        let iteration = 0;

        const interval = setInterval(() => {
            tag.textContent = originalText
                .split("")
                .map((letter, idx) => {
                    if (letter === " ") return " ";
                    if (idx < iteration) return originalText[idx];
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join("");

            if (iteration >= originalText.length) {
                clearInterval(interval);
            }
            iteration += 1.5;
        }, 22);
    });

    // 7. FULLSCREEN LIGHTBOX PRO SCREENSHOTY V GALERII
    const galleryImages = document.querySelectorAll(".gallery-item");
    if (galleryImages.length > 0) {
        const lightbox = document.createElement("div");
        lightbox.className = "lightbox-overlay";
        lightbox.innerHTML = `
            <img src="" alt="Expanded Screenshot">
            <div class="lightbox-caption"></div>
        `;
        document.body.appendChild(lightbox);

        const lightboxImg = lightbox.querySelector("img");
        const lightboxCap = lightbox.querySelector(".lightbox-caption");

        galleryImages.forEach(item => {
            item.addEventListener("click", () => {
                const img = item.querySelector("img");
                const title = item.querySelector("h4");
                if (img) {
                    lightboxImg.src = img.src;
                    lightboxCap.textContent = title ? title.textContent : "";
                    lightbox.classList.add("active");
                }
            });
        });

        lightbox.addEventListener("click", () => {
            lightbox.classList.remove("active");
        });

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                lightbox.classList.remove("active");
            }
        });
    }

    // 8. FILTROVÁNÍ PROJEKTŮ NA STRÁNCE PROJECTS.HTML (UNITY VS GODOT)
    const filterBtns = document.querySelectorAll(".filter-btn");
    const filterableItems = document.querySelectorAll("[data-category]");
    const emptyMsg = document.getElementById("emptyFilterMsg");

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                filterBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const filterValue = btn.getAttribute("data-filter");
                let visibleCount = 0;

                filterableItems.forEach(item => {
                    const category = item.getAttribute("data-category");
                    if (filterValue === "all" || filterValue === category) {
                        item.style.display = "";
                        visibleCount++;
                    } else {
                        item.style.display = "none";
                    }
                });

                if (emptyMsg) {
                    emptyMsg.style.display = visibleCount === 0 ? "block" : "none";
                }
            });
        });
    }

    // 9. KOPÍROVÁNÍ DISCORD PŘEZDÍVKY NA STRÁNCE CONTACT
    const copyButtons = document.querySelectorAll(".copy-trigger");

    copyButtons.forEach(button => {
        button.addEventListener("click", () => {
            const textToCopy = button.getAttribute("data-copy");
            const actionLabel = button.querySelector(".hub-action");
            const originalText = actionLabel.textContent;

            navigator.clipboard.writeText(textToCopy).then(() => {
                actionLabel.textContent = `COPIED: ${textToCopy} ✓`;
                button.classList.add("copied");

                setTimeout(() => {
                    actionLabel.textContent = originalText;
                    button.classList.remove("copied");
                }, 2200);
            });
        });
    });
});