const button = document.querySelector("button");
const nav = document.querySelector("nav");

if (button && nav) {
  button.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", isOpen);
  });

  const links = [...nav.querySelectorAll("a")];
  const sections = [...document.querySelectorAll("main section[id]")];
  let pendingNavigation = null;
  const setActiveLink = (activeLink) => {
    links.forEach((link) => link.classList.toggle("active", link === activeLink));

    const linkRect = activeLink.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    nav.style.setProperty("--active-left", `${linkRect.left - navRect.left}px`);
    nav.style.setProperty("--active-top", `${linkRect.top - navRect.top}px`);
    nav.style.setProperty("--active-width", `${linkRect.width}px`);
    nav.style.setProperty("--active-height", `${linkRect.height}px`);
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const targetSection = sections.find(
        (section) => link.hash === `#${section.id}`,
      );
      const targetRect = targetSection?.getBoundingClientRect();
      const activePoint = window.innerHeight * 0.425;
      pendingNavigation =
        targetRect && targetRect.top <= activePoint && targetRect.bottom >= activePoint
          ? null
          : link;
      setActiveLink(link);
      nav.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    });
  });

  if ("IntersectionObserver" in window) {
    // Menandai link navbar sesuai section yang sedang terlihat.
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        if (pendingNavigation) {
          const targetReached = entries.some(
            (entry) =>
              entry.isIntersecting &&
              pendingNavigation.hash === `#${entry.target.id}`,
          );
          if (!targetReached) return;

          const activeLink = pendingNavigation;
          pendingNavigation = null;
          setActiveLink(activeLink);
          return;
        }

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const activeLink = links.find(
            (link) => link.hash === `#${entry.target.id}`,
          );
          if (activeLink) setActiveLink(activeLink);
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
      },
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });

    // Menampilkan project, item timeline, dan skill saat discroll.
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("shown");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
      },
    );

    document
      .querySelectorAll(".grid article, .timeline article, .skills p")
      .forEach((item) => {
        item.classList.add("reveal");
        revealObserver.observe(item);
      });
  } else {
    // Fallback: konten tetap terlihat di browser lama.
    document
      .querySelectorAll(".grid article, .timeline article, .skills p")
      .forEach((item) => {
        item.classList.add("shown");
      });
  }
}

const introTarget = document.querySelector("#typing-intro");
const nameTarget = document.querySelector("#typing-name");

if (introTarget && nameTarget) {
  const introText = "Hello, I'm";
  const nameText = "Keivan.";
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion) {
    introTarget.textContent = introText;
    nameTarget.textContent = nameText;
  } else {
    let introIndex = 0;
    let nameIndex = 0;

    function typeIntro() {
      introTarget.textContent = introText.slice(0, introIndex);
      introIndex++;

      if (introIndex <= introText.length) {
        setTimeout(typeIntro, 95);
      } else {
        const cursor = document.querySelector(".typing-cursor");
        setTimeout(() => {
          nameTarget.after(cursor);
          typeName();
        }, 300);
      }
    }

    function typeName() {
      nameTarget.textContent = nameText.slice(0, nameIndex);
      nameIndex++;

      if (nameIndex <= nameText.length) {
        setTimeout(typeName, 125);
      } else {
        document.querySelector(".typing-cursor")?.classList.add("typing-done");
      }
    }

    typeIntro();
  }
}
// Build the carousel controls and accessible project detail dialog.
const projectGrid = document.querySelector("#projects .grid");

if (projectGrid) {
  const cards = [...projectGrid.querySelectorAll("article")];
  const carousel = document.createElement("div");
  carousel.className = "project-carousel";
  const track = document.createElement("div");
  track.className = "project-track";
  track.setAttribute("aria-label", "Project showcase");
  track.setAttribute("tabindex", "0");
  projectGrid.parentNode.insertBefore(carousel, projectGrid);
  carousel.append(track);
  track.append(...cards);

  const controls = document.createElement("div");
  controls.className = "carousel-controls";
  controls.innerHTML =
    '<button type="button" aria-label="Previous projects">?</button><button type="button" aria-label="Next projects">?</button>';
  carousel.append(controls);
  const [previous, next] = controls.querySelectorAll("button");
  const moveCarousel = (direction) => {
    const card = track.querySelector("article");
    track.scrollBy({
      left: direction * (card?.getBoundingClientRect().width + 22 || 320),
      behavior: "smooth",
    });
  };
  previous.addEventListener("click", () => moveCarousel(-1));
  next.addEventListener("click", () => moveCarousel(1));

  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;

    dragging = true;
    startX = event.clientX;
    startScroll = track.scrollLeft;
  });

  window.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    track.scrollLeft = startScroll - (event.clientX - startX);
  });

  window.addEventListener("pointerup", () => {
    dragging = false;
  });

  window.addEventListener("pointercancel", () => {
    dragging = false;
  });

  if ("IntersectionObserver" in window) {
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.target.classList.toggle("is-active", entry.isIntersecting),
        );
      },
      { root: track, threshold: 0.7 },
    );
    cards.forEach((card) => cardObserver.observe(card));
  } else if (cards[0]) {
    cards[0].classList.add("is-active");
  }

  const modal = document.createElement("div");
  modal.className = "project-modal";
  modal.hidden = true;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "project-modal-title");
  modal.innerHTML =
    '<div class="project-modal-backdrop"></div><div class="project-modal-panel"><button class="project-modal-close" type="button" aria-label="Close project details">�</button><div class="project-modal-copy"><small class="modal-category"></small><h3 id="project-modal-title"></h3><p class="modal-description"></p><p class="modal-tech"></p><div class="project-modal-links"></div></div><div class="project-modal-image"><img alt=""></div></div>';
  document.body.append(modal);
  const closeButton = modal.querySelector(".project-modal-close");
  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  };
  closeButton.addEventListener("click", closeModal);
  modal
    .querySelector(".project-modal-backdrop")
    .addEventListener("click", closeModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  cards.forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    const openModal = (event) => {
      if (event.target.closest("a")) return;
      const image = card.querySelector("img");
      const title = card.querySelector("h3")?.textContent.trim() || "Project";
      const category =
        card.querySelector("small")?.textContent.trim() || "PROJECT";
      const description = card.querySelector("p")?.textContent.trim() || "";
      const sourceLink = card.querySelector("a[href]");
      modal.querySelector(".modal-category").textContent = category;
      modal.querySelector("#project-modal-title").textContent = title;
      modal.querySelector(".modal-description").textContent = description;
      modal.querySelector(".modal-tech").textContent =
        "Technologies: " + category;
      const modalImage = modal.querySelector(".project-modal-image img");
      modalImage.src = image?.getAttribute("src") || "";
      modalImage.alt = image?.alt || title;
      const linkArea = modal.querySelector(".project-modal-links");
      linkArea.replaceChildren();
      if (sourceLink) {
        const link = sourceLink.cloneNode(true);
        link.textContent = "GitHub ?";
        link.target = "_blank";
        link.rel = "noreferrer";
        linkArea.append(link);
      }
      modal.hidden = false;
      document.body.classList.add("modal-open");
      closeButton.focus();
    };
    card.addEventListener("click", openModal);
    card.addEventListener("keydown", (event) => {
      if (event.target !== card || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      openModal(event);
    });
  });
}
