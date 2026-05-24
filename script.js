const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const menu = document.querySelector("[data-menu]");
const rideForm = document.querySelector("[data-ride-form]");
const formMessage = document.querySelector("[data-form-message]");
const faqList = document.querySelector("[data-faq-list]");

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  menu.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;
    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  });
}

if (rideForm && formMessage) {
  rideForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(rideForm);
    const from = String(formData.get("from") || "").trim();
    const to = String(formData.get("to") || "").trim();
    const moment = String(formData.get("moment") || "retour");

    formMessage.className = "form-message";

    if (!from || !to) {
      formMessage.classList.add("is-error");
      formMessage.textContent = "Ajoute un départ et une arrivée pour simuler le bon parcours.";
      return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      formMessage.classList.add("is-error");
      formMessage.textContent = "Le départ et l'arrivée doivent être différents.";
      return;
    }

    rideForm.classList.add("is-loading");
    formMessage.textContent = "Recherche des trajets compatibles dans la communauté...";

    window.setTimeout(() => {
      rideForm.classList.remove("is-loading");
      formMessage.classList.add("is-success");
      formMessage.textContent = buildRideMessage(from, to, moment);
    }, 620);
  });
}

if (faqList) {
  faqList.addEventListener("click", (event) => {
    const item = event.target instanceof Element ? event.target.closest(".faq-item") : null;
    if (!(item instanceof HTMLButtonElement)) return;

    const willOpen = item.getAttribute("aria-expanded") !== "true";

    faqList.querySelectorAll(".faq-item").forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });

    item.setAttribute("aria-expanded", String(willOpen));
  });
}

function buildRideMessage(from, to, moment) {
  const labels = {
    retour: "retour de soirée",
    travail: "trajet travail",
    ecole: "trajet école ou campus",
    vacances: "départ vacances",
  };

  const label = labels[moment] || "trajet";
  return `Trajet préparé pour ${from} vers ${to}, catégorie ${label}. Ouvre l'app pour publier ou réserver.`;
}
