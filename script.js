const button = document.querySelector("button");
const nav = document.querySelector("nav");

if (button && nav) {
  button.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    });
  });

  const links = [...nav.querySelectorAll("a")];
  const sections = [...document.querySelectorAll("main section[id]")];

  if ("IntersectionObserver" in window) {
    // Menandai link navbar sesuai section yang sedang terlihat.
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          links.forEach((link) => {
            link.classList.toggle(
              "active",
              link.hash === `#${entry.target.id}`
            );
          });
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
      }
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
      }
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