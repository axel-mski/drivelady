const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const menu = document.querySelector("[data-menu]");
const navDropdowns = document.querySelectorAll("[data-nav-dropdown]");
const rideForm = document.querySelector("[data-ride-form]");
const formMessage = document.querySelector("[data-form-message]");
const faqList = document.querySelector("[data-faq-list]");
const trustJourney = document.querySelector("[data-trust-journey]");
const addressInputs = document.querySelectorAll("[data-address-input]");
const contactForms = document.querySelectorAll("[data-contact-form]");
const contactTopicLinks = document.querySelectorAll("[data-contact-topic]");
const currentYearTargets = document.querySelectorAll("[data-current-year]");
const selectedAddresses = new Map();
const appHost = "app.localhost";
const defaultAppPort = "5173";
const defaultRideTime = "22:30";
const announcementDismissKey = "drive-lady-announcement-dismissed-v1";
const workshopPopupDismissKey = "drive-lady-self-defense-popup-dismissed-v1";
const workshopPopupExpiresAt = Date.parse("2026-06-15T00:00:00+02:00");
const workshopReservationUrl = "https://app-drivelady.fr/";
const siteScriptUrl = document.currentScript?.src || document.querySelector('script[src$="script.js"], script[src$="site-script.js"]')?.src || window.location.href;
let activeSchedulePicker = null;
let schedulePickerGlobalsBound = false;
const appMode = renderLocalAppIfNeeded();

if (!appMode) {
initAnnouncementBanner();
initWorkshopPopup();

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const syncMobileMenuContentTop = () => {
  if (!header) return;
  const rect = header.getBoundingClientRect();
  document.documentElement.style.setProperty("--menu-content-top", `${Math.ceil(rect.bottom)}px`);
};

window.addEventListener("resize", () => {
  if (document.body.classList.contains("has-mobile-menu")) {
    syncMobileMenuContentTop();
  }
});

const closeNavDropdowns = (exceptDropdown = null) => {
  navDropdowns.forEach((dropdown) => {
    if (dropdown === exceptDropdown) return;
    dropdown.classList.remove("is-open");
    dropdown.querySelector("[data-nav-dropdown-trigger]")?.setAttribute("aria-expanded", "false");
  });
};

const setMobileMenuState = (isOpen) => {
  header?.classList.toggle("is-menu-open", isOpen);
  document.body.classList.toggle("has-mobile-menu", isOpen);

  if (isOpen) {
    syncMobileMenuContentTop();
  } else {
    document.documentElement.style.removeProperty("--menu-content-top");
  }
};

const keepMobileDropdownVisible = (dropdown) => {
  if (!menu || !window.matchMedia("(max-width: 780px)").matches) return;

  window.requestAnimationFrame(() => {
    const dropdownMenu = dropdown.querySelector(".nav-dropdown__menu");
    if (!dropdownMenu) return;

    const panelRect = menu.getBoundingClientRect();
    const dropdownRect = dropdownMenu.getBoundingClientRect();
    const bottomInset = 18;
    const overflow = dropdownRect.bottom - (panelRect.bottom - bottomInset);

    if (overflow > 0) {
      menu.scrollBy({ top: overflow, behavior: "smooth" });
    }
  });
};

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    setMobileMenuState(isOpen);

    if (!isOpen) {
      closeNavDropdowns();
    }
  });

  menu.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;
    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    setMobileMenuState(false);
    closeNavDropdowns();
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(max-width: 780px)").matches || !menu.classList.contains("is-open")) return;

    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    setMobileMenuState(false);
    closeNavDropdowns();
  });
}

if (navDropdowns.length) {
  navDropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector("[data-nav-dropdown-trigger]");

    if (!trigger) return;

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const willOpen = !dropdown.classList.contains("is-open");
      closeNavDropdowns(dropdown);
      dropdown.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));

      if (willOpen) {
        keepMobileDropdownVisible(dropdown);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node)) return;
    const clickedInsideDropdown = Array.from(navDropdowns).some((dropdown) => dropdown.contains(event.target));

    if (!clickedInsideDropdown) {
      closeNavDropdowns();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeNavDropdowns();
    menu?.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    setMobileMenuState(false);
  });
}

initAddressAutocomplete();
initRideScheduleDefaults();
hydrateRideFormFromUrl();
initSchedulePickers();
initBlogDirectoryFilters();

if (rideForm && formMessage) {
  rideForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(rideForm);
    const from = String(formData.get("from") || "").trim();
    const to = String(formData.get("to") || "").trim();
    const travelDate = readDateInputValue(formData.get("travelDate")) || getTodayInputValue();
    const travelTime = readTimeInputValue(formData.get("travelTime")) || defaultRideTime;
    const timeMode = readTimeMode(formData.get("timeMode"));

    formMessage.className = "form-message";

    if (!from || !to) {
      formMessage.classList.add("is-error");
      formMessage.textContent = "Ajoute un départ et une arrivée pour lancer la recherche.";
      return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      formMessage.classList.add("is-error");
      formMessage.textContent = "Le départ et l'arrivée doivent être différents.";
      return;
    }

    rideForm.classList.add("is-loading");
    formMessage.textContent = "Validation des adresses via la Géoplateforme...";

    try {
      const fromAddress = await resolveAddress("from", from);
      const toAddress = await resolveAddress("to", to);
      window.location.href = buildAppSearchUrl(fromAddress, toAddress, { travelDate, travelTime, timeMode });
    } catch {
      rideForm.classList.remove("is-loading");
      formMessage.classList.add("is-error");
      formMessage.textContent = "Impossible de préparer la recherche pour le moment.";
    }
  });
}

if (faqList) {
  faqList.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const tab = target ? target.closest("[data-faq-tab]") : null;

    if (tab instanceof HTMLButtonElement) {
      const selectedCategory = tab.dataset.faqTab;

      faqList.querySelectorAll("[data-faq-tab]").forEach((button) => {
        const isActive = button === tab;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
      });

      faqList.querySelectorAll("[data-faq-panel]").forEach((panel) => {
        const isActive = panel instanceof HTMLElement && panel.dataset.faqPanel === selectedCategory;
        panel.classList.toggle("is-active", isActive);
        panel.toggleAttribute("hidden", !isActive);
      });

      faqList.querySelectorAll(".faq-item").forEach((button) => {
        button.setAttribute("aria-expanded", "false");
      });

      return;
    }

    const item = target ? target.closest(".faq-item") : null;
    if (!(item instanceof HTMLButtonElement)) return;

    const willOpen = item.getAttribute("aria-expanded") !== "true";

    faqList.querySelectorAll(".faq-item").forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });

    item.setAttribute("aria-expanded", String(willOpen));
  });
}

if (trustJourney) {
  trustJourney.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const tab = target ? target.closest("[data-trust-tab]") : null;

    if (!(tab instanceof HTMLButtonElement)) return;

    const selectedStep = tab.dataset.trustTab;

    trustJourney.querySelectorAll("[data-trust-tab]").forEach((button) => {
      const isActive = button === tab;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    trustJourney.querySelectorAll("[data-trust-panel]").forEach((panel) => {
      const isActive = panel instanceof HTMLElement && panel.dataset.trustPanel === selectedStep;
      panel.classList.toggle("is-active", isActive);
      panel.toggleAttribute("hidden", !isActive);
    });
  });
}

currentYearTargets.forEach((target) => {
  target.textContent = String(new Date().getFullYear());
});

initContactForms();
}

function initAnnouncementBanner() {
  const pageStage = document.querySelector(".page-stage");
  if (!pageStage || document.querySelector("[data-announcement-banner]") || isAnnouncementDismissed()) return;

  const banner = document.createElement("section");
  banner.className = "announcement-banner";
  banner.dataset.announcementBanner = "";
  banner.setAttribute("aria-label", "Annonce Drive Lady");
  banner.innerHTML = `
    <div class="announcement-banner__inner">
      <a class="announcement-banner__message" href="${getAppHomeUrl()}">L&rsquo;application Drive Lady est l&agrave; !<br class="announcement-banner__mobile-break" /> Acc&egrave;de &agrave; l&rsquo;app d&egrave;s maintenant</a>
      <button class="announcement-banner__close" type="button" aria-label="Fermer le bandeau">
        <span aria-hidden="true"></span>
      </button>
    </div>
  `;

  const closeButton = banner.querySelector(".announcement-banner__close");

  closeButton?.addEventListener("click", () => {
    persistAnnouncementDismissal();
    document.body.classList.remove("has-announcement-banner");
    banner.classList.add("is-hiding");
    window.setTimeout(() => banner.remove(), 180);
  });

  pageStage.parentElement?.insertBefore(banner, pageStage);
  document.body.classList.add("has-announcement-banner");
}

function initWorkshopPopup() {
  const pageStage = document.querySelector(".page-stage");
  if (!pageStage || document.querySelector("[data-workshop-popup]") || isWorkshopPopupDismissed() || isWorkshopPopupExpired()) return;

  const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const popup = document.createElement("section");
  popup.className = "workshop-popup";
  popup.dataset.workshopPopup = "";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.setAttribute("aria-labelledby", "workshop-popup-title");
  popup.setAttribute("aria-describedby", "workshop-popup-description");
  popup.innerHTML = `
    <div class="workshop-popup__panel" role="presentation">
      <button class="workshop-popup__close" type="button" aria-label="Fermer la popup">
        <span aria-hidden="true"></span>
      </button>
      <div class="workshop-popup__copy">
        <h2 id="workshop-popup-title">Pr&ecirc;te &agrave; apprendre les bons r&eacute;flexes&nbsp;?</h2>
        <p id="workshop-popup-description" class="workshop-popup__intro"><strong>Drive Lady x La Grande &Eacute;cole</strong> organisent un cours de self-d&eacute;fense.</p>
        <ul class="workshop-popup__details" aria-label="D&eacute;tails du cours">
          <li><span class="workshop-popup__detail-icon workshop-popup__detail-icon--calendar" aria-hidden="true"></span><strong>Dimanche 14 juin</strong></li>
          <li><span class="workshop-popup__detail-icon workshop-popup__detail-icon--time" aria-hidden="true"></span><span>10h &agrave; 11h45</span></li>
          <li><span class="workshop-popup__detail-icon workshop-popup__detail-icon--pin" aria-hidden="true"></span><span>La Grande &Eacute;cole</span></li>
          <li><span class="workshop-popup__detail-icon workshop-popup__detail-icon--ticket" aria-hidden="true"></span><span>Places limit&eacute;es</span></li>
        </ul>
        <p class="workshop-popup__note">1h45 pour apprendre les bons r&eacute;flexes, mieux comprendre ses r&eacute;actions et repartir avec des cl&eacute;s concr&egrave;tes.</p>
        <a class="workshop-popup__cta" href="${workshopReservationUrl}">R&eacute;server <span aria-hidden="true"></span></a>
      </div>
      <figure class="workshop-popup__media">
        <img src="${getSiteAssetUrl("assets/self-defense-workshop.png")}" alt="Atelier de self-d&eacute;fense entre femmes" />
      </figure>
    </div>
  `;

  const closePopup = () => {
    persistWorkshopPopupDismissal();
    document.removeEventListener("keydown", handleKeydown);
    document.body.classList.remove("has-workshop-popup");
    popup.classList.add("is-hiding");
    window.setTimeout(() => {
      popup.remove();
      previouslyFocused?.focus?.();
    }, 220);
  };

  const getFocusableElements = () => Array.from(popup.querySelectorAll("a[href], button:not([disabled])"))
    .filter((element) => element instanceof HTMLElement && !element.hasAttribute("hidden"));

  const handleKeydown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closePopup();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements();
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  popup.addEventListener("click", (event) => {
    if (event.target === popup) closePopup();
  });

  popup.querySelector(".workshop-popup__close")?.addEventListener("click", closePopup);
  popup.querySelector(".workshop-popup__cta")?.addEventListener("click", persistWorkshopPopupDismissal);
  document.addEventListener("keydown", handleKeydown);
  document.body.append(popup);
  document.body.classList.add("has-workshop-popup");

  window.requestAnimationFrame(() => {
    popup.classList.add("is-visible");
    popup.querySelector(".workshop-popup__close")?.focus?.();
  });
}

function isAnnouncementDismissed() {
  try {
    return window.localStorage.getItem(announcementDismissKey) === "true";
  } catch {
    return false;
  }
}

function persistAnnouncementDismissal() {
  try {
    window.localStorage.setItem(announcementDismissKey, "true");
  } catch {
    // The banner should still close when storage is unavailable.
  }
}

function isWorkshopPopupDismissed() {
  try {
    return window.localStorage.getItem(workshopPopupDismissKey) === "true";
  } catch {
    return false;
  }
}

function persistWorkshopPopupDismissal() {
  try {
    window.localStorage.setItem(workshopPopupDismissKey, "true");
  } catch {
    // The popup should still close when storage is unavailable.
  }
}

function isWorkshopPopupExpired() {
  return Number.isFinite(workshopPopupExpiresAt) && Date.now() >= workshopPopupExpiresAt;
}

function getSiteAssetUrl(assetPath) {
  return new URL(assetPath, siteScriptUrl).toString();
}

function getAppHomeUrl() {
  const protocol = window.location.protocol === "file:" ? "http:" : window.location.protocol;
  const port = window.location.port || defaultAppPort;
  return `${protocol}//${appHost}:${port}/`;
}

function initContactForms() {
  if (!contactForms.length) return;

  contactForms.forEach((form) => {
    form.addEventListener("submit", handleContactSubmit);
  });

  const params = new URLSearchParams(window.location.search);
  const urlTopic = params.get("sujet");
  if (urlTopic) {
    setContactTopic(urlTopic);
  }

  if (params.get("sent") === "1") {
    const message = contactForms[0].querySelector("[data-contact-message]");
    setContactMessage(message, "Merci, votre message a bien été envoyé.", "success");
  }

  contactTopicLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setContactTopic(link.dataset.contactTopic || "");
    });
  });
}

function setContactTopic(topic) {
  const cleanTopic = String(topic || "").trim();
  if (!cleanTopic) return;

  contactForms.forEach((form) => {
    const topicField = form.querySelector('[name="sujet"]');
    if (!topicField) return;

    if (topicField instanceof HTMLSelectElement) {
      const hasMatchingOption = Array.from(topicField.options).some((option) => option.value === cleanTopic);

      if (!hasMatchingOption) {
        topicField.add(new Option(cleanTopic, cleanTopic));
      }
    }

    topicField.value = cleanTopic;
  });
}

async function handleContactSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  if (!(form instanceof HTMLFormElement)) return;

  const contactMessage = form.querySelector("[data-contact-message]");
  const submitButton = form.querySelector('button[type="submit"]');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  setContactMessage(contactMessage, "", "");

  try {
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.dataset.originalText = submitButton.textContent || "";
      submitButton.textContent = "Envoi en cours...";
    }

    const response = await fetch(form.action || "/api/contact", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.ok === false) {
      throw new Error(result.message || "Le formulaire est indisponible pour le moment.");
    }

    form.reset();
    setContactMessage(contactMessage, result.message || "Merci, votre message a bien été envoyé.", "success");
  } catch (error) {
    setContactMessage(contactMessage, error.message || "Impossible d'envoyer le message. Réessayez dans quelques minutes.", "error");
  } finally {
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.originalText || "Envoyer";
      delete submitButton.dataset.originalText;
    }
  }
}

function setContactMessage(messageElement, text, status) {
  if (!messageElement) return;

  messageElement.className = "form-message";
  if (status) messageElement.classList.add(`is-${status}`);
  messageElement.textContent = text;
}

function renderLocalAppIfNeeded() {
  if (window.location.hostname !== appHost) return false;

  const stage = document.querySelector(".page-stage");
  if (!stage) return false;

  const params = new URLSearchParams(window.location.search);
  const from = params.get("from") || "Lorient";
  const to = params.get("to") || "Saint-Denis";
  const travelDate = readDateInputValue(params.get("date")) || getTodayInputValue();
  const travelTime = readTimeInputValue(params.get("time")) || defaultRideTime;
  const timeMode = readTimeMode(params.get("timeMode"));
  const dateLabel = formatRideDateLabel(travelDate);
  const scheduleLabel = formatRideScheduleLabel(travelTime, timeMode);
  const protocol = window.location.protocol === "file:" ? "http:" : window.location.protocol;
  const port = window.location.port || defaultAppPort;
  const searchUrl = `${protocol}//localhost:${port}/#trajets`;
  const fromShort = getPlaceShortName(from);
  const toShort = getPlaceShortName(to);
  const fromMeta = getAddressMeta(params, "from");
  const toMeta = getAddressMeta(params, "to");
  const results = buildLocalRideResults(fromShort, toShort);
  const availableResults = results.filter((ride) => !ride.soldOut);
  const totalAvailable = 112;
  const initialView = params.get("view") === "map" ? "map" : "list";
  const hasRequestedOffer = params.has("offer");
  const requestedOffer = hasRequestedOffer ? Number(params.get("offer")) : NaN;
  const selectedRide = hasRequestedOffer && Number.isInteger(requestedOffer) && requestedOffer >= 0 ? results[requestedOffer] : null;

  if (selectedRide && !selectedRide.soldOut) {
    document.title = `Drive Lady | ${selectedRide.from} vers ${selectedRide.to}`;
    stage.classList.add("is-local-app");
    stage.innerHTML = `
      <main class="local-app local-detail-app" aria-labelledby="local-detail-title" data-local-app>
        ${renderLocalHeader(searchUrl)}
        ${renderLocalRideDetail(selectedRide, requestedOffer, buildLocalListUrl())}
      </main>
    `;
    return true;
  }

  document.title = "Drive Lady | Recherche locale";
  stage.classList.add("is-local-app");
  stage.innerHTML = `
    <main class="local-app" aria-labelledby="local-app-title" data-local-app data-view="${initialView}">
      ${renderLocalHeader(searchUrl)}

      <section class="local-search-panel" aria-label="Recherche de trajet">
        <form class="local-search-form" data-local-search-form novalidate>
          <label class="local-search-cell">
            <span class="local-search-label">Départ</span>
            <span class="local-search-icon local-search-icon--origin" aria-hidden="true"></span>
            <input type="text" name="from" value="${escapeHtml(from)}" autocomplete="off" />
          </label>
          <label class="local-search-cell">
            <span class="local-search-label">Arrivée</span>
            <span class="local-search-icon local-search-icon--destination" aria-hidden="true"></span>
            <input type="text" name="to" value="${escapeHtml(to)}" autocomplete="off" />
          </label>
          <div class="local-search-cell local-search-cell--compact">
            <span class="local-search-label">Date</span>
            <span class="local-search-icon local-search-icon--date" aria-hidden="true"></span>
            <input type="date" name="travelDate" value="${escapeHtml(travelDate)}" />
          </div>
          <div class="local-search-cell local-search-cell--compact">
            <span class="local-search-label">Heure</span>
            <span class="local-search-icon local-search-icon--date" aria-hidden="true"></span>
            <div class="local-time-field">
              <select name="timeMode" aria-label="Type d'heure">
                <option value="departure"${timeMode === "departure" ? " selected" : ""}>Départ</option>
                <option value="arrival"${timeMode === "arrival" ? " selected" : ""}>Arrivée</option>
              </select>
              <input type="time" name="travelTime" value="${escapeHtml(travelTime)}" />
            </div>
          </div>
          <button class="local-search-submit" type="submit">Rechercher</button>
        </form>
        <p class="local-form-error" data-local-error role="alert" hidden></p>
      </section>

      <section class="local-view-tabs" aria-label="Types de trajet">
        <button type="button" class="is-active" aria-pressed="true">
          <span>Tout</span>
          <strong>${totalAvailable}</strong>
        </button>
        <button type="button" aria-pressed="false">
          <span>DriveLady</span>
          <strong>${availableResults.length}</strong>
        </button>
        <button type="button" aria-pressed="false">
          <span>Instantané</span>
          <strong>${results.filter((ride) => ride.instant && !ride.soldOut).length}</strong>
        </button>
        <button type="button" aria-pressed="false">
          <span>Complet</span>
          <strong>${results.filter((ride) => ride.soldOut).length}</strong>
        </button>
        <div class="local-view-switch" aria-label="Affichage">
          <button type="button" class="${initialView === "list" ? "is-active" : ""}" data-view-mode="list" aria-pressed="${initialView === "list"}">Liste</button>
          <button type="button" class="${initialView === "map" ? "is-active" : ""}" data-view-mode="map" aria-pressed="${initialView === "map"}">Carte</button>
        </div>
      </section>

      <section class="local-results-layout" aria-label="Résultats de recherche">
        <aside class="local-filter-panel" aria-label="Filtres de trajet">
          <button class="local-map-preview" type="button" data-view-mode="map">
            <span class="local-map-preview__roads" aria-hidden="true"></span>
            <strong>Afficher sur la carte</strong>
          </button>

          <form class="local-filter-form" data-local-filter-form>
            <div class="local-filter-header">
              <h2>Trier par</h2>
              <button type="button" data-clear-filters>Tout effacer</button>
            </div>
            <label class="local-radio-row">
              <input type="radio" name="sort" value="early" checked />
              <span>Départ le plus tôt</span>
              <i class="filter-glyph filter-glyph--clock" aria-hidden="true"></i>
            </label>
            <label class="local-radio-row">
              <input type="radio" name="sort" value="price" />
              <span>Prix le plus bas</span>
              <i class="filter-glyph filter-glyph--coins" aria-hidden="true"></i>
            </label>
            <label class="local-radio-row">
              <input type="radio" name="sort" value="near" />
              <span>Proche du point de départ</span>
              <i class="filter-glyph filter-glyph--walk" aria-hidden="true"></i>
            </label>
            <label class="local-radio-row">
              <input type="radio" name="sort" value="short" />
              <span>Trajet le plus court</span>
              <i class="filter-glyph filter-glyph--hourglass" aria-hidden="true"></i>
            </label>

            <div class="local-filter-divider"></div>

            <fieldset class="local-check-group">
              <legend>Heure de départ</legend>
              <label>
                <input type="checkbox" name="period" value="before6" />
                <span>Avant 06:00</span>
                <small>1</small>
              </label>
              <label>
                <input type="checkbox" name="period" value="morning" />
                <span>06:00 - 12:00</span>
                <small>4</small>
              </label>
              <label>
                <input type="checkbox" name="period" value="evening" />
                <span>Après 18:00</span>
                <small>3</small>
              </label>
            </fieldset>

            <fieldset class="local-check-group">
              <legend>Préférences DriveLady</legend>
              <label>
                <input type="checkbox" name="instant" value="true" />
                <span>Réservation instantanée</span>
                <small>5</small>
              </label>
              <label>
                <input type="checkbox" name="backSeat" value="true" />
                <span>Max. 2 à l'arrière</span>
                <small>4</small>
              </label>
              <label>
                <input type="checkbox" name="verified" value="true" />
                <span>Profil vérifié</span>
                <small>8</small>
              </label>
            </fieldset>
          </form>
        </aside>

        <section class="local-results" aria-label="Trajets disponibles">
          <div class="local-results__bar">
            <div>
              <p class="local-route-eyebrow">${escapeHtml(dateLabel)}</p>
              <h1 id="local-app-title">${escapeHtml(fromShort)} <span>vers</span> ${escapeHtml(toShort)}</h1>
              <p class="local-route-meta">${escapeHtml(scheduleLabel)} · ${escapeHtml(fromMeta)} · ${escapeHtml(toMeta)}</p>
            </div>
            <strong data-result-count>${availableResults.length} trajets affichés</strong>
          </div>

          <div class="local-loading-list" data-local-loading hidden>
            <article></article>
            <article></article>
            <article></article>
          </div>

          <div class="local-empty-state" data-local-empty hidden>
            <strong>Aucun trajet ne correspond à ces filtres.</strong>
            <p>Retire un filtre ou repasse en tri par départ pour retrouver les trajets disponibles.</p>
          </div>

          <div class="local-result-list" data-local-results>
            ${results.map(renderLocalRideCard).join("")}
          </div>

          <p class="local-results-status" data-results-status role="status" aria-live="polite">${availableResults.length} trajets affichés.</p>
        </section>

        <aside class="local-map-panel" aria-label="Carte des départs">
          <div class="local-map-toolbar">
            <button type="button" class="is-active">Départs</button>
            <button type="button">Arrivées</button>
            <a href="${searchUrl}">Modifier</a>
          </div>
          <div class="local-map-canvas" role="img" aria-label="Carte stylisée des départs autour de ${escapeHtml(fromShort)}">
            <span class="map-river"></span>
            <span class="map-road map-road--one"></span>
            <span class="map-road map-road--two"></span>
            <span class="map-road map-road--three"></span>
            <span class="map-road map-road--four"></span>
            <span class="map-label map-label--one">${escapeHtml(fromShort)}</span>
            <span class="map-label map-label--two">${escapeHtml(toShort)}</span>
            <span class="map-pin" aria-hidden="true"></span>
            ${results.map(renderLocalMapMarker).join("")}
          </div>
        </aside>
      </section>
    </main>
  `;

  initSchedulePickers(stage);
  initLocalSearchApp(stage);
  return true;
}

function renderLocalHeader(searchUrl) {
  return `
    <header class="local-app__header">
      <a class="local-brand" href="${searchUrl}" aria-label="Drive Lady accueil">
        <img src="./assets/drive-lady-logo.png" alt="Logo Drive Lady" />
        <span>Drive Lady</span>
      </a>
      <nav class="local-nav" aria-label="Navigation app">
        <a href="${searchUrl}">Accueil</a>
        <a href="${searchUrl}">Mes trajets</a>
        <a href="${searchUrl}">Messages</a>
      </nav>
      <div class="local-header-actions">
        <a class="local-publish-action" href="${searchUrl}">Proposer un trajet</a>
        <button class="local-avatar-button" type="button" aria-label="Profil d'Axelle">A</button>
      </div>
    </header>
  `;
}

function renderLocalRideDetail(ride, index, listUrl) {
  const passenger = ride.passenger || "Carine";
  const detailOptions = [
    ride.verified ? { icon: "shield", label: "Profil vérifié" } : null,
    { icon: "calendar", label: "Annule rarement ses trajets" },
    ride.instant
      ? { icon: "instant", label: "Réservation instantanée" }
      : { icon: "calendar", label: "Votre réservation sera confirmée lorsque la conductrice acceptera votre demande" },
    ride.backSeat ? { icon: "people", label: "Max. 2 à l'arrière" } : null,
  ].filter(Boolean);

  return `
    <section class="local-detail-page">
      <a class="local-detail-back" href="${listUrl}">Retour aux trajets</a>
      <div class="local-detail-grid">
        <div class="local-detail-main">
          <h1 id="local-detail-title">Détails du trajet</h1>

          <article class="detail-card detail-route-card" aria-label="Itinéraire">
            ${renderDetailTimeline(ride, false)}
          </article>

          <article class="detail-card detail-driver-card" aria-label="Conductrice">
            <a class="detail-driver-header" href="${listUrl}" aria-label="Voir le profil de ${escapeHtml(ride.driver)}">
              <div class="driver-avatar driver-avatar--large${ride.verified ? " is-verified" : ""}">
                <img src="${ride.avatar}" alt="${escapeHtml(ride.driver)}" />
              </div>
              <div>
                <strong>${escapeHtml(ride.driver)}</strong>
                <span><i class="rating-mark" aria-hidden="true"></i>${escapeHtml(ride.rating)} / 5 · ${ride.reviewCount} avis</span>
              </div>
              <i class="detail-chevron" aria-hidden="true"></i>
            </a>

            <div class="detail-fact-list">
              ${detailOptions.map((option) => `
                <div class="detail-fact">
                  <i class="option-icon option-icon--${option.icon}" aria-hidden="true"></i>
                  <span>${escapeHtml(option.label)}</span>
                </div>
              `).join("")}
            </div>

            <a class="detail-contact-button" href="${listUrl}">
              <i class="option-icon option-icon--message" aria-hidden="true"></i>
              Contacter ${escapeHtml(ride.driver.split(" ")[0])}
            </a>
          </article>

          <article class="detail-card detail-passenger-card" aria-label="Passagères">
            <h2>Passagères</h2>
            <a class="detail-passenger-row" href="${listUrl}">
              <div class="driver-avatar driver-avatar--small is-verified">
                <img src="./assets/journey-weekend.png" alt="${escapeHtml(passenger)}" />
              </div>
              <div>
                <strong>${escapeHtml(passenger)}</strong>
                <span>${escapeHtml(ride.from)} vers ${escapeHtml(ride.to)}</span>
              </div>
              <i class="detail-chevron" aria-hidden="true"></i>
            </a>
          </article>

          <aside class="detail-impact-note" aria-label="Impact carbone">
            <i class="option-icon option-icon--leaf" aria-hidden="true"></i>
            <p>En choisissant ce trajet, vous contribuez à éviter environ ${ride.co2Saved} de CO2 par rapport à un trajet solo en voiture.</p>
          </aside>
        </div>

        <aside class="local-detail-summary" aria-label="Résumé de réservation">
          <article class="detail-card detail-summary-card">
            <h2>${escapeHtml(ride.dateLabel)}</h2>
            ${renderDetailTimeline(ride, true)}
            <div class="detail-summary-driver">
              <span class="ride-mode-icon ride-mode-icon--car" aria-hidden="true"></span>
              <div class="driver-avatar${ride.verified ? " is-verified" : ""}">
                <img src="${ride.avatar}" alt="${escapeHtml(ride.driver)}" />
              </div>
              <div>
                <strong>${escapeHtml(ride.driver)}</strong>
                <span><i class="rating-mark" aria-hidden="true"></i>${escapeHtml(ride.rating)}</span>
              </div>
            </div>
          </article>

          <article class="detail-card detail-price-card">
            <span>${escapeHtml(ride.seats)}</span>
            <strong>${ride.price}</strong>
          </article>

          <a class="detail-reserve-button" href="${listUrl}">
            <i class="option-icon option-icon--calendar" aria-hidden="true"></i>
            Demande de réservation
          </a>
        </aside>
      </div>
    </section>
  `;
}

function renderDetailTimeline(ride, compact) {
  return `
    <div class="detail-timeline${compact ? " detail-timeline--compact" : ""}">
      <div class="detail-time">
        <strong>${ride.departure}</strong>
        <span>${ride.duration}</span>
        <strong>${ride.arrival}</strong>
      </div>
      <div class="detail-line" aria-hidden="true">
        <span></span>
        <span></span>
      </div>
      <div class="detail-places">
        <div>
          <strong>${escapeHtml(ride.from)}</strong>
          <span>${escapeHtml(ride.fromAddress)}</span>
        </div>
        <div>
          <strong>${escapeHtml(ride.to)}</strong>
          <span>${escapeHtml(ride.toAddress)}</span>
        </div>
      </div>
    </div>
  `;
}

function buildLocalListUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("offer");
  url.searchParams.delete("ride");
  url.searchParams.delete("view");
  return url.toString();
}

function buildLocalDetailUrl(index) {
  const url = new URL(window.location.href);
  url.searchParams.set("offer", String(index));
  url.searchParams.delete("ride");
  url.searchParams.delete("view");
  return url.toString();
}

function renderLocalRideCard(ride, index) {
  const soldOutText = ride.soldOut ? '<strong class="local-card-full">Complet</strong>' : "";
  const priceText = ride.soldOut ? soldOutText : `<strong>${ride.price}</strong><span>${ride.seats}</span>`;
  const detailUrl = ride.soldOut ? "" : buildLocalDetailUrl(index);
  const options = [
    ride.instant ? { icon: "instant", label: "Réservation instantanée" } : null,
    ride.backSeat ? { icon: "people", label: "Max. 2 à l'arrière" } : null,
  ].filter(Boolean);

  return `
    <article
      class="local-result-card${ride.soldOut ? " is-sold-out" : ""}"
      role="link"
      tabindex="${ride.soldOut ? "-1" : "0"}"
      style="--index: ${index}"
      data-result-card
      data-detail-url="${escapeHtml(detailUrl)}"
      data-result-index="${index}"
      data-period="${ride.period}"
      data-instant="${ride.instant}"
      data-back-seat="${ride.backSeat}"
      data-verified="${ride.verified}"
      data-sold-out="${ride.soldOut}"
      data-price="${ride.priceValue}"
      data-departure="${ride.departureValue}"
      data-duration="${ride.durationValue}"
      data-proximity="${ride.proximity}"
    >
      <div class="local-card-main">
        <div class="local-result-card__times">
          <div>
            <strong>${ride.departure}</strong>
            <span>${escapeHtml(ride.from)}</span>
          </div>
          <div class="travel-thread">
            <span></span>
            <small>${ride.duration}</small>
            <span></span>
          </div>
          <div>
            <strong>${ride.arrival}</strong>
            <span>${escapeHtml(ride.to)}</span>
          </div>
        </div>
        <div class="local-result-card__price">
          ${priceText}
        </div>
      </div>
      <div class="local-card-footer">
        <span class="ride-mode-icon ride-mode-icon--car" aria-hidden="true"></span>
        <div class="driver-avatar${ride.verified ? " is-verified" : ""}">
          <img src="${ride.avatar}" alt="${escapeHtml(ride.driver)}" />
        </div>
        <div class="local-result-card__meta">
          <strong>${escapeHtml(ride.driver)}</strong>
          <span><i class="rating-mark" aria-hidden="true"></i>${ride.rating}</span>
        </div>
        ${options.length > 0 ? '<span class="local-footer-divider" aria-hidden="true"></span>' : ""}
        ${options.length > 0 ? `
          <div class="local-card-options">
            ${options.map((option) => `
              <span>
                <i class="option-icon option-icon--${option.icon}" aria-hidden="true"></i>
                ${escapeHtml(option.label)}
              </span>
            `).join("")}
          </div>
        ` : ""}
      </div>
    </article>
  `;
}

function renderLocalMapMarker(ride, index) {
  return `
    <button
      class="local-map-marker${ride.soldOut ? " is-sold-out" : ""}"
      type="button"
      style="--x: ${ride.mapX}%; --y: ${ride.mapY}%; --index: ${index}"
      data-map-marker
      data-marker-index="${index}"
      data-period="${ride.period}"
      data-instant="${ride.instant}"
      data-back-seat="${ride.backSeat}"
      data-verified="${ride.verified}"
      data-sold-out="${ride.soldOut}"
      aria-label="${escapeHtml(ride.driver)}, ${ride.soldOut ? "trajet complet" : ride.price}"
    >
      <span><img src="${ride.avatar}" alt="" /></span>
      <strong>${ride.soldOut ? "Complet" : ride.price}</strong>
    </button>
  `;
}

function buildLocalRideResults(from, to) {
  return [
    {
      departure: "04:40",
      arrival: "06:50",
      duration: "2h10",
      departureValue: 280,
      durationValue: 130,
      priceValue: 1559,
      proximity: 4,
      period: "before6",
      from,
      to: "Roissy-en-France",
      driver: "Jody Mesnat",
      rating: "4,7",
      reviewCount: 28,
      tag: "Conductrice vérifiée",
      price: "15,59 €",
      seats: "1 passagère",
      instant: true,
      backSeat: false,
      verified: true,
      soldOut: false,
      dateLabel: "Dimanche 24 mai",
      fromAddress: `${from} centre`,
      toAddress: "Avenue Charles de Gaulle",
      passenger: "Mina",
      co2Saved: "18,9 kg",
      avatar: "./assets/journey-night.png",
      mapX: 31,
      mapY: 26,
    },
    {
      departure: "06:30",
      arrival: "08:20",
      duration: "1h50",
      departureValue: 390,
      durationValue: 110,
      priceValue: 1490,
      proximity: 2,
      period: "morning",
      from: "Le Petit-Quevilly",
      to,
      driver: "Maëlle Picard",
      rating: "5",
      reviewCount: 41,
      tag: "Trajet complet",
      price: "14,90 €",
      seats: "0 passagère",
      instant: false,
      backSeat: true,
      verified: true,
      soldOut: true,
      dateLabel: "Dimanche 24 mai",
      fromAddress: "Place des Chartreux",
      toAddress: `${to} centre`,
      passenger: "Inès",
      co2Saved: "17,4 kg",
      avatar: "./assets/drive-lady-hero.avif",
      mapX: 42,
      mapY: 38,
    },
    {
      departure: "07:00",
      arrival: "08:40",
      duration: "1h40",
      departureValue: 420,
      durationValue: 100,
      priceValue: 1559,
      proximity: 1,
      period: "morning",
      from,
      to,
      driver: "Diane Vauvert",
      rating: "5",
      reviewCount: 36,
      tag: "Profil vérifié",
      price: "15,59 €",
      seats: "2 passagères",
      instant: false,
      backSeat: true,
      verified: true,
      soldOut: false,
      dateLabel: "Dimanche 24 mai",
      fromAddress: "11 Bd d'Orléans appartement 2142",
      toAddress: "Porte d'Orléans",
      passenger: "Carine",
      co2Saved: "18,9 kg",
      avatar: "./assets/journey-daily.png",
      mapX: 37,
      mapY: 47,
    },
    {
      departure: "08:00",
      arrival: "09:40",
      duration: "1h40",
      departureValue: 480,
      durationValue: 100,
      priceValue: 779,
      proximity: 6,
      period: "morning",
      from: "Bourg-Beaudouin",
      to: "Versailles",
      driver: "Sylvie Marceau",
      rating: "4,8",
      reviewCount: 19,
      tag: "Réservation instantanée",
      price: "7,79 €",
      seats: "2 passagères",
      instant: true,
      backSeat: true,
      verified: true,
      soldOut: false,
      dateLabel: "Dimanche 24 mai",
      fromAddress: "Parking mairie",
      toAddress: "Avenue de Paris",
      passenger: "Lina",
      co2Saved: "16,8 kg",
      avatar: "./assets/journey-weekend.png",
      mapX: 78,
      mapY: 56,
    },
    {
      departure: "11:20",
      arrival: "13:04",
      duration: "1h44",
      departureValue: 680,
      durationValue: 104,
      priceValue: 1949,
      proximity: 3,
      period: "morning",
      from: "Mont-Saint-Aignan",
      to: "Paris 10e",
      driver: "Samira Belair",
      rating: "4,9",
      reviewCount: 52,
      tag: "Bagage accepté",
      price: "19,49 €",
      seats: "1 passagère",
      instant: true,
      backSeat: false,
      verified: true,
      soldOut: false,
      dateLabel: "Dimanche 24 mai",
      fromAddress: "Place Colbert",
      toAddress: "Gare de l'Est",
      passenger: "Nora",
      co2Saved: "19,2 kg",
      avatar: "./assets/drive-lady-hero.avif",
      mapX: 48,
      mapY: 32,
    },
    {
      departure: "18:05",
      arrival: "19:36",
      duration: "1h31",
      departureValue: 1085,
      durationValue: 91,
      priceValue: 1180,
      proximity: 5,
      period: "evening",
      from: "Grand-Couronne",
      to,
      driver: "Clémence Arbaud",
      rating: "5",
      reviewCount: 24,
      tag: "Retour tardif",
      price: "11,80 €",
      seats: "3 passagères",
      instant: true,
      backSeat: true,
      verified: true,
      soldOut: false,
      dateLabel: "Dimanche 24 mai",
      fromAddress: "Route de Moulineaux",
      toAddress: `${to} centre`,
      passenger: "Sarah",
      co2Saved: "18,1 kg",
      avatar: "./assets/journey-night.png",
      mapX: 24,
      mapY: 72,
    },
    {
      departure: "19:15",
      arrival: "20:52",
      duration: "1h37",
      departureValue: 1155,
      durationValue: 97,
      priceValue: 1620,
      proximity: 7,
      period: "evening",
      from: "Sotteville-lès-Rouen",
      to: "Gare de l'Est",
      driver: "Aïcha Kerrou",
      rating: "4,9",
      reviewCount: 33,
      tag: "Profil vérifié",
      price: "16,20 €",
      seats: "1 passagère",
      instant: false,
      backSeat: true,
      verified: true,
      soldOut: false,
      dateLabel: "Dimanche 24 mai",
      fromAddress: "Rue Garibaldi",
      toAddress: "Rue du 8 Mai 1945",
      passenger: "Leïla",
      co2Saved: "17,9 kg",
      avatar: "./assets/journey-daily.png",
      mapX: 52,
      mapY: 44,
    },
    {
      departure: "21:00",
      arrival: "22:42",
      duration: "1h42",
      departureValue: 1260,
      durationValue: 102,
      priceValue: 1380,
      proximity: 8,
      period: "evening",
      from,
      to,
      driver: "Zoé Le Goff",
      rating: "5",
      reviewCount: 46,
      tag: "Trajet complet",
      price: "13,80 €",
      seats: "0 passagère",
      instant: true,
      backSeat: false,
      verified: true,
      soldOut: true,
      dateLabel: "Dimanche 24 mai",
      fromAddress: `${from} centre`,
      toAddress: `${to} centre`,
      passenger: "Julie",
      co2Saved: "18,6 kg",
      avatar: "./assets/journey-weekend.png",
      mapX: 63,
      mapY: 68,
    },
  ];
}

function initLocalSearchApp(stage) {
  const app = stage.querySelector("[data-local-app]");
  const filterForm = stage.querySelector("[data-local-filter-form]");
  const searchForm = stage.querySelector("[data-local-search-form]");
  const resultList = stage.querySelector("[data-local-results]");
  const loadingList = stage.querySelector("[data-local-loading]");
  const emptyState = stage.querySelector("[data-local-empty]");
  const resultCount = stage.querySelector("[data-result-count]");
  const status = stage.querySelector("[data-results-status]");
  const error = stage.querySelector("[data-local-error]");
  const cards = Array.from(stage.querySelectorAll("[data-result-card]"));
  const markers = Array.from(stage.querySelectorAll("[data-map-marker]"));
  let loadingTimer = 0;

  if (!app || !filterForm || !resultList || !loadingList || !emptyState || !resultCount || !status) return;

  stage.querySelectorAll("[data-view-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.getAttribute("data-view-mode") || "list";
      app.dataset.view = view;
      stage.querySelectorAll("[data-view-mode]").forEach((item) => {
        const isActive = item.getAttribute("data-view-mode") === view;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
    });
  });

  filterForm.addEventListener("change", applyLocalFilters);

  stage.querySelector("[data-clear-filters]")?.addEventListener("click", () => {
    filterForm.reset();
    const defaultSort = filterForm.querySelector('input[name="sort"][value="early"]');
    if (defaultSort instanceof HTMLInputElement) defaultSort.checked = true;
    applyLocalFilters();
  });

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    window.clearTimeout(loadingTimer);

    const formData = new FormData(searchForm);
    const from = String(formData.get("from") || "").trim();
    const to = String(formData.get("to") || "").trim();

    if (error) {
      error.hidden = true;
      error.textContent = "";
    }

    if (!from || !to) {
      if (error) {
        error.textContent = "Ajoute un départ et une arrivée pour lancer la recherche.";
        error.hidden = false;
      }
      return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      if (error) {
        error.textContent = "Le départ et l'arrivée doivent être différents.";
        error.hidden = false;
      }
      return;
    }

    app.classList.add("is-loading-results");
    resultList.hidden = true;
    emptyState.hidden = true;
    loadingList.hidden = false;
    status.textContent = "Recherche des trajets DriveLady disponibles.";

    loadingTimer = window.setTimeout(() => {
      app.classList.remove("is-loading-results");
      loadingList.hidden = true;
      applyLocalFilters();
      status.textContent = "Trajets actualisés.";
    }, 620);
  });

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => syncLocalSelection(card.dataset.resultIndex));
    card.addEventListener("focusin", () => syncLocalSelection(card.dataset.resultIndex));
    card.addEventListener("click", () => {
      const detailUrl = card.dataset.detailUrl;
      if (card.dataset.soldOut === "true" || !detailUrl) return;
      window.location.href = detailUrl;
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const detailUrl = card.dataset.detailUrl;
      if (card.dataset.soldOut === "true" || !detailUrl) return;
      event.preventDefault();
      window.location.href = detailUrl;
    });
  });

  markers.forEach((marker) => {
    marker.addEventListener("click", () => {
      app.dataset.view = "map";
      syncLocalSelection(marker.dataset.markerIndex);
      const target = stage.querySelector(`[data-result-card][data-result-index="${marker.dataset.markerIndex}"]`);
      target?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  });

  applyLocalFilters();

  function applyLocalFilters() {
    const formData = new FormData(filterForm);
    const selectedPeriods = formData.getAll("period");
    const instantOnly = formData.get("instant") === "true";
    const backSeatOnly = formData.get("backSeat") === "true";
    const verifiedOnly = formData.get("verified") === "true";
    const sort = String(formData.get("sort") || "early");
    let visibleCount = 0;

    const sortedCards = [...cards].sort((first, second) => {
      const key = sort === "price" ? "price" : sort === "short" ? "duration" : sort === "near" ? "proximity" : "departure";
      return Number(first.dataset[key] || 0) - Number(second.dataset[key] || 0);
    });

    sortedCards.forEach((card) => resultList.appendChild(card));

    cards.forEach((card) => {
      const marker = stage.querySelector(`[data-map-marker][data-marker-index="${card.dataset.resultIndex}"]`);
      const matchesPeriod = selectedPeriods.length === 0 || selectedPeriods.includes(card.dataset.period || "");
      const matchesInstant = !instantOnly || card.dataset.instant === "true";
      const matchesBackSeat = !backSeatOnly || card.dataset.backSeat === "true";
      const matchesVerified = !verifiedOnly || card.dataset.verified === "true";
      const visible = matchesPeriod && matchesInstant && matchesBackSeat && matchesVerified;

      card.hidden = !visible;
      if (marker instanceof HTMLElement) marker.hidden = !visible;
      if (visible && card.dataset.soldOut !== "true") visibleCount += 1;
    });

    const hasVisibleCard = cards.some((card) => !card.hidden);
    resultList.hidden = !hasVisibleCard;
    emptyState.hidden = hasVisibleCard;
    resultCount.textContent = `${visibleCount} trajets affichés`;
    status.textContent = `${visibleCount} trajets affichés.`;
  }

  function syncLocalSelection(index) {
    if (!index) return;
    cards.forEach((card) => card.classList.toggle("is-selected", card.dataset.resultIndex === index));
    markers.forEach((marker) => marker.classList.toggle("is-selected", marker.dataset.markerIndex === index));
  }
}

function getPlaceShortName(value) {
  return String(value).split(",")[0].trim() || value;
}

function getAddressMeta(params, prefix) {
  const details = [params.get(`${prefix}Postcode`), params.get(`${prefix}City`)].filter(Boolean);
  const lat = params.get(`${prefix}Lat`);
  const lon = params.get(`${prefix}Lon`);

  if (lat && lon) details.push(`${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}`);
  return details.join(" · ") || "Adresse locale";
}

function getMomentLabel(moment) {
  const labels = {
    retour: "Retour de soirée",
    travail: "Trajet travail",
    ecole: "École ou campus",
    vacances: "Départ vacances",
  };

  return labels[moment] || "Trajet";
}

function initAddressAutocomplete() {
  addressInputs.forEach((input) => {
    const field = input.closest("[data-address-field]");
    const suggestions = field?.querySelector("[data-address-suggestions]");
    const role = input.dataset.addressRole || input.name;
    let debounceId = 0;
    let activeController = null;

    if (!field || !suggestions || !role) return;

    input.addEventListener("input", () => {
      selectedAddresses.delete(role);
      window.clearTimeout(debounceId);
      const query = input.value.trim();

      if (query.length < 2) {
        closeSuggestions(input, suggestions);
        return;
      }

      debounceId = window.setTimeout(async () => {
        activeController?.abort();
        activeController = new AbortController();
        field.classList.add("is-searching");

        try {
          const results = await fetchAddressSuggestions(query, activeController.signal);
          renderSuggestions(input, suggestions, role, results);
        } catch {
          suggestions.innerHTML = '<p class="address-empty">Adresse indisponible pour le moment.</p>';
          input.setAttribute("aria-expanded", "true");
        } finally {
          field.classList.remove("is-searching");
        }
      }, 180);
    });

    input.addEventListener("focus", () => {
      if (suggestions.children.length > 0) input.setAttribute("aria-expanded", "true");
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSuggestions(input, suggestions);
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("[data-address-field]")) return;

    document.querySelectorAll("[data-address-suggestions]").forEach((suggestions) => {
      const input = suggestions.closest("[data-address-field]")?.querySelector("[data-address-input]");
      if (input instanceof HTMLInputElement) closeSuggestions(input, suggestions);
    });
  });
}

function renderSuggestions(input, suggestions, role, results) {
  suggestions.innerHTML = "";

  if (results.length === 0) {
    suggestions.innerHTML = '<p class="address-empty">Aucune adresse trouvée.</p>';
    input.setAttribute("aria-expanded", "true");
    return;
  }

  results.slice(0, 6).forEach((result) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "address-option";
    button.setAttribute("role", "option");
    button.innerHTML = `
      <span>${escapeHtml(result.label)}</span>
      <small>${escapeHtml([result.postcode, result.city, result.context].filter(Boolean).join(" · ") || "Géoplateforme")}</small>
    `;

    button.addEventListener("click", () => {
      selectedAddresses.set(role, result);
      input.value = result.label;
      closeSuggestions(input, suggestions);
    });

    suggestions.appendChild(button);
  });

  input.setAttribute("aria-expanded", "true");
}

function closeSuggestions(input, suggestions) {
  suggestions.innerHTML = "";
  input.setAttribute("aria-expanded", "false");
}

async function resolveAddress(role, value) {
  const selected = selectedAddresses.get(role);
  if (selected && selected.label === value) return selected;

  const [firstResult] = await fetchAddressSuggestions(value);
  return firstResult || { label: value };
}

async function fetchAddressSuggestions(query, signal) {
  try {
    const url = new URL("https://data.geopf.fr/geocodage/completion/");
    url.searchParams.set("text", query);
    url.searchParams.set("terr", "METROPOLE");
    url.searchParams.set("maximumResponses", "6");

    const response = await fetch(url, { signal, headers: { accept: "application/json" } });
    if (!response.ok) throw new Error("Géoplateforme unavailable");
    return normalizeAddressPayload(await response.json(), "Géoplateforme");
  } catch (error) {
    if (error?.name === "AbortError") throw error;

    const fallbackUrl = new URL("https://api-adresse.data.gouv.fr/search/");
    fallbackUrl.searchParams.set("q", query);
    fallbackUrl.searchParams.set("limit", "6");
    fallbackUrl.searchParams.set("autocomplete", "1");

    const fallbackResponse = await fetch(fallbackUrl, { signal, headers: { accept: "application/json" } });
    if (!fallbackResponse.ok) throw new Error("Address API unavailable");
    return normalizeAddressPayload(await fallbackResponse.json(), "BAN");
  }
}

function normalizeAddressPayload(payload, source) {
  const items = Array.isArray(payload?.results)
    ? payload.results
    : Array.isArray(payload?.features)
      ? payload.features
      : [];
  const seen = new Set();

  return items
    .map((item, index) => normalizeAddressItem(item, index, source))
    .filter(Boolean)
    .filter((item) => {
      const key = item.label.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeAddressItem(item, index, source) {
  const data = item?.properties || item || {};
  const coordinates = Array.isArray(item?.geometry?.coordinates) ? item.geometry.coordinates : [];
  const label = data.fulltext || data.label || data.name || data.city || data.street;

  if (!label) return null;

  return {
    id: data.id || item.id || `${source}-${index}-${label}`,
    label,
    city: data.city || data.municipality || data.commune,
    postcode: data.postcode || data.zipcode,
    context: data.context || data.department || data.territory,
    lat: readNumber(data.lat) ?? readNumber(data.latitude) ?? readNumber(data.y) ?? readNumber(coordinates[1]),
    lon: readNumber(data.lon) ?? readNumber(data.longitude) ?? readNumber(data.x) ?? readNumber(coordinates[0]),
    source,
  };
}

function buildAppSearchUrl(fromAddress, toAddress, schedule) {
  const protocol = window.location.protocol === "file:" ? "http:" : window.location.protocol;
  const port = window.location.port || defaultAppPort;
  const url = new URL(`${protocol}//${appHost}:${port}/`);

  appendAddressParams(url.searchParams, "from", fromAddress);
  appendAddressParams(url.searchParams, "to", toAddress);
  url.searchParams.set("date", schedule.travelDate);
  url.searchParams.set("time", schedule.travelTime);
  url.searchParams.set("timeMode", schedule.timeMode);

  return url.toString();
}

function appendAddressParams(params, prefix, address) {
  params.set(prefix, address.label);
  if (address.city) params.set(`${prefix}City`, address.city);
  if (address.postcode) params.set(`${prefix}Postcode`, address.postcode);
  if (typeof address.lat === "number") params.set(`${prefix}Lat`, String(address.lat));
  if (typeof address.lon === "number") params.set(`${prefix}Lon`, String(address.lon));
}

function initBlogDirectoryFilters() {
  const directory = document.querySelector("[data-blog-filters]");
  if (!directory) return;

  const searchInput = directory.querySelector("[data-blog-search]");
  const resultNumber = directory.querySelector("[data-blog-result-number]");
  const resultLabel = directory.querySelector("[data-blog-result-label]");
  const emptyState = directory.querySelector("[data-blog-empty]");
  const cards = Array.from(directory.querySelectorAll("[data-blog-card]"));

  const updateFilters = () => {
    const query = normalizeBlogFilterText(searchInput instanceof HTMLInputElement ? searchInput.value : "");
    let visibleCount = 0;

    cards.forEach((card) => {
      const searchText = normalizeBlogFilterText(card.dataset.blogSearch || card.textContent || "");
      const searchMatch = !query || searchText.includes(query);

      card.toggleAttribute("hidden", !searchMatch);
      if (searchMatch) visibleCount += 1;
    });

    if (resultNumber) resultNumber.textContent = String(visibleCount);
    if (resultLabel) resultLabel.textContent = ` guide${visibleCount > 1 ? "s" : ""} trouv\u00e9${visibleCount > 1 ? "s" : ""}`;
    emptyState?.toggleAttribute("hidden", visibleCount > 0);
  };

  searchInput?.addEventListener("input", updateFilters);

  updateFilters();
}

function normalizeBlogFilterText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function initSchedulePickers(root = document) {
  if (!root || typeof root.querySelectorAll !== "function") return;

  bindSchedulePickerGlobals();
  initDatePickers(root);
  initTimePickers(root);
}

function bindSchedulePickerGlobals() {
  if (schedulePickerGlobalsBound) return;
  schedulePickerGlobalsBound = true;

  document.addEventListener("click", (event) => {
    if (!activeSchedulePicker || !(event.target instanceof Node)) return;
    if (!activeSchedulePicker.contains(event.target)) closeSchedulePicker(activeSchedulePicker);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeSchedulePicker) {
      closeSchedulePicker(activeSchedulePicker);
    }
  });
}

function initDatePickers(root) {
  root.querySelectorAll('input[name="travelDate"]').forEach((input) => {
    if (!(input instanceof HTMLInputElement) || input.dataset.schedulePicker === "date") return;

    input.dataset.schedulePicker = "date";
    input.classList.add("schedule-native-control");
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");

    const picker = document.createElement("div");
    picker.className = "dl-schedule-picker dl-schedule-picker--date";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "dl-schedule-button dl-schedule-button--date";
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-expanded", "false");

    const panel = document.createElement("div");
    panel.className = "dl-schedule-panel dl-calendar-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Choix de la date");
    panel.hidden = true;

    picker.append(button, panel);
    input.insertAdjacentElement("afterend", picker);

    const state = {
      visibleMonth: getMonthStart(getPickerDate(input)),
    };

    const render = () => renderDatePicker(input, picker, button, panel, state);

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      render();
      toggleSchedulePicker(picker);
    });

    input.addEventListener("change", () => {
      state.visibleMonth = getMonthStart(getPickerDate(input));
      updateDatePickerButton(input, button);
      render();
    });

    updateDatePickerButton(input, button);
    render();
  });
}

function initTimePickers(root) {
  root.querySelectorAll('input[name="travelTime"]').forEach((input) => {
    if (!(input instanceof HTMLInputElement) || input.dataset.schedulePicker === "time") return;

    const host = input.closest(".ride-time-grid, .local-time-field") || input.parentElement;
    const select = host?.querySelector('select[name="timeMode"]');

    if (!(host instanceof HTMLElement) || !(select instanceof HTMLSelectElement)) return;

    input.dataset.schedulePicker = "time";
    select.dataset.schedulePicker = "time";
    input.classList.add("schedule-native-control");
    select.classList.add("schedule-native-control");
    input.tabIndex = -1;
    select.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");
    select.setAttribute("aria-hidden", "true");
    host.classList.add("dl-time-host");

    const picker = document.createElement("div");
    picker.className = "dl-schedule-picker dl-schedule-picker--time";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "dl-schedule-button dl-schedule-button--time";
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-expanded", "false");

    const panel = document.createElement("div");
    panel.className = "dl-schedule-panel dl-time-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Choix de l'heure");
    panel.hidden = true;

    picker.append(button, panel);
    host.appendChild(picker);

    const render = () => renderTimePicker(input, select, picker, button, panel);

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      render();
      toggleSchedulePicker(picker);
    });

    input.addEventListener("change", () => {
      updateTimePickerButton(input, select, button);
      render();
    });

    select.addEventListener("change", () => {
      updateTimePickerButton(input, select, button);
      render();
    });

    updateTimePickerButton(input, select, button);
    render();
  });
}

function renderDatePicker(input, picker, button, panel, state) {
  const selectedDate = getPickerDate(input);
  const minDate = parseInputDate(input.min);
  const todayValue = getTodayInputValue();
  const selectedValue = formatInputDate(selectedDate);
  const visibleMonth = state.visibleMonth || getMonthStart(selectedDate);
  const minMonth = minDate ? getMonthStart(minDate) : null;

  panel.replaceChildren();

  const header = document.createElement("div");
  header.className = "dl-calendar-header";

  const previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.className = "dl-calendar-nav dl-calendar-nav--prev";
  previousButton.setAttribute("aria-label", "Mois précédent");
  previousButton.disabled = Boolean(minMonth && formatInputDate(visibleMonth) <= formatInputDate(minMonth));

  const title = document.createElement("strong");
  title.className = "dl-calendar-title";
  title.textContent = capitalizeText(
    new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(visibleMonth),
  );

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "dl-calendar-nav dl-calendar-nav--next";
  nextButton.setAttribute("aria-label", "Mois suivant");

  previousButton.addEventListener("click", () => {
    state.visibleMonth = addMonths(visibleMonth, -1);
    renderDatePicker(input, picker, button, panel, state);
  });

  nextButton.addEventListener("click", () => {
    state.visibleMonth = addMonths(visibleMonth, 1);
    renderDatePicker(input, picker, button, panel, state);
  });

  header.append(previousButton, title, nextButton);

  const presets = document.createElement("div");
  presets.className = "dl-calendar-presets";

  [
    { label: "Aujourd'hui", date: parseInputDate(todayValue) },
    { label: "Demain", date: addDays(parseInputDate(todayValue), 1) },
    { label: "Week-end", date: getNextWeekendDate(parseInputDate(todayValue)) },
  ].forEach((preset) => {
    if (!preset.date) return;
    const presetValue = formatInputDate(preset.date);
    const presetButton = document.createElement("button");
    presetButton.type = "button";
    presetButton.textContent = preset.label;
    presetButton.disabled = Boolean(minDate && presetValue < formatInputDate(minDate));
    presetButton.classList.toggle("is-active", presetValue === selectedValue);
    presetButton.addEventListener("click", () => {
      setDatePickerValue(input, presetValue);
      state.visibleMonth = getMonthStart(preset.date);
      updateDatePickerButton(input, button);
      renderDatePicker(input, picker, button, panel, state);
      closeSchedulePicker(picker);
    });
    presets.appendChild(presetButton);
  });

  const weekdays = document.createElement("div");
  weekdays.className = "dl-calendar-weekdays";
  ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].forEach((day) => {
    const label = document.createElement("span");
    label.textContent = day;
    weekdays.appendChild(label);
  });

  const grid = document.createElement("div");
  grid.className = "dl-calendar-grid";

  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const firstWeekdayOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();

  for (let index = 0; index < firstWeekdayOffset; index += 1) {
    const emptyCell = document.createElement("span");
    emptyCell.className = "dl-calendar-empty";
    grid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    const value = formatInputDate(date);
    const dayButton = document.createElement("button");
    dayButton.type = "button";
    dayButton.textContent = String(day);
    dayButton.setAttribute("aria-label", formatFullDateLabel(value));
    dayButton.disabled = Boolean(minDate && value < formatInputDate(minDate));
    dayButton.classList.toggle("is-selected", value === selectedValue);
    dayButton.classList.toggle("is-today", value === todayValue);
    dayButton.addEventListener("click", () => {
      setDatePickerValue(input, value);
      updateDatePickerButton(input, button);
      renderDatePicker(input, picker, button, panel, state);
      closeSchedulePicker(picker);
    });
    grid.appendChild(dayButton);
  }

  panel.append(header, presets, weekdays, grid);
}

function renderTimePicker(input, select, picker, button, panel) {
  const { hour, minute } = getTimeParts(input.value);

  panel.replaceChildren();

  const modeGroup = document.createElement("div");
  modeGroup.className = "dl-time-mode";

  Array.from(select.options).forEach((option) => {
    const modeButton = document.createElement("button");
    modeButton.type = "button";
    modeButton.textContent = option.textContent.trim();
    modeButton.classList.toggle("is-active", option.value === select.value);
    modeButton.setAttribute("aria-pressed", String(option.value === select.value));
    modeButton.addEventListener("click", () => {
      setSelectValue(select, option.value);
      updateTimePickerButton(input, select, button);
      renderTimePicker(input, select, picker, button, panel);
    });
    modeGroup.appendChild(modeButton);
  });

  const presets = document.createElement("div");
  presets.className = "dl-time-presets";

  ["20:00", "21:30", "22:30", "23:00", "00:30", "02:00"].forEach((time) => {
    const presetButton = document.createElement("button");
    presetButton.type = "button";
    presetButton.textContent = time;
    presetButton.classList.toggle("is-active", time === input.value);
    presetButton.addEventListener("click", () => {
      setTimePickerValue(input, time);
      updateTimePickerButton(input, select, button);
      renderTimePicker(input, select, picker, button, panel);
    });
    presets.appendChild(presetButton);
  });

  const wheels = document.createElement("div");
  wheels.className = "dl-time-wheels";
  wheels.append(
    renderTimeColumn("Heures", getHourOptions(), hour, (nextHour) => {
      setTimePickerValue(input, `${nextHour}:${minute}`);
      updateTimePickerButton(input, select, button);
      renderTimePicker(input, select, picker, button, panel);
    }),
    renderTimeColumn("Minutes", getMinuteOptions(minute), minute, (nextMinute) => {
      setTimePickerValue(input, `${hour}:${nextMinute}`);
      updateTimePickerButton(input, select, button);
      renderTimePicker(input, select, picker, button, panel);
    }),
  );

  const footer = document.createElement("div");
  footer.className = "dl-time-footer";

  const selected = document.createElement("strong");
  selected.textContent = `${getSelectedOptionLabel(select)} ${readTimeInputValue(input.value) || defaultRideTime}`;

  const doneButton = document.createElement("button");
  doneButton.type = "button";
  doneButton.textContent = "Valider";
  doneButton.addEventListener("click", () => closeSchedulePicker(picker));

  footer.append(selected, doneButton);
  panel.append(modeGroup, presets, wheels, footer);
}

function renderTimeColumn(label, values, selectedValue, onSelect) {
  const column = document.createElement("div");
  column.className = "dl-time-column";
  column.setAttribute("aria-label", label);

  values.forEach((value) => {
    const item = document.createElement("button");
    item.type = "button";
    item.textContent = value;
    item.classList.toggle("is-selected", value === selectedValue);
    item.addEventListener("click", () => onSelect(value));
    column.appendChild(item);
  });

  return column;
}

function toggleSchedulePicker(picker) {
  const shouldOpen = !picker.classList.contains("is-open");

  if (activeSchedulePicker && activeSchedulePicker !== picker) {
    closeSchedulePicker(activeSchedulePicker);
  }

  picker.classList.toggle("is-open", shouldOpen);
  picker.querySelector(".dl-schedule-panel").hidden = !shouldOpen;
  picker.querySelector(".dl-schedule-button")?.setAttribute("aria-expanded", String(shouldOpen));
  activeSchedulePicker = shouldOpen ? picker : null;
}

function closeSchedulePicker(picker) {
  picker.classList.remove("is-open");
  picker.querySelector(".dl-schedule-panel").hidden = true;
  picker.querySelector(".dl-schedule-button")?.setAttribute("aria-expanded", "false");

  if (activeSchedulePicker === picker) {
    activeSchedulePicker = null;
  }
}

function updateDatePickerButton(input, button) {
  button.innerHTML = `
    <span class="dl-schedule-button__glyph dl-schedule-button__glyph--date" aria-hidden="true"></span>
    <span class="dl-schedule-button__copy">
      <strong>${escapeHtml(formatDateButtonLabel(input.value))}</strong>
      <small>${escapeHtml(formatDateMetaLabel(input.value))}</small>
    </span>
    <span class="dl-schedule-button__chevron" aria-hidden="true"></span>
  `;
  button.setAttribute("aria-label", `Date du trajet, ${formatFullDateLabel(input.value)}`);
}

function updateTimePickerButton(input, select, button) {
  const time = readTimeInputValue(input.value) || defaultRideTime;
  button.innerHTML = `
    <span class="dl-schedule-button__glyph dl-schedule-button__glyph--time" aria-hidden="true"></span>
    <span class="dl-schedule-button__copy">
      <strong>${escapeHtml(`${getSelectedOptionLabel(select)} ${time}`)}</strong>
      <small>${escapeHtml(formatTimeMetaLabel(time))}</small>
    </span>
    <span class="dl-schedule-button__chevron" aria-hidden="true"></span>
  `;
  button.setAttribute("aria-label", `${getSelectedOptionLabel(select)} à ${time}`);
}

function setDatePickerValue(input, value) {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function setTimePickerValue(input, value) {
  input.value = readTimeInputValue(value) || defaultRideTime;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function setSelectValue(select, value) {
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

function getPickerDate(input) {
  return parseInputDate(input.value) || parseInputDate(input.min) || parseInputDate(getTodayInputValue()) || new Date();
}

function parseInputDate(value) {
  const cleanValue = readDateInputValue(value);
  if (!cleanValue) return null;

  const [year, month, day] = cleanValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

function formatInputDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return getTodayInputValue();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addDays(date, amount) {
  if (!(date instanceof Date)) return null;
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function getNextWeekendDate(date) {
  if (!(date instanceof Date)) return null;
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  const daysUntilSaturday = day === 0 ? 0 : day <= 6 ? (6 - day) % 7 : 0;
  nextDate.setDate(nextDate.getDate() + daysUntilSaturday);
  return nextDate;
}

function formatDateButtonLabel(value) {
  const date = parseInputDate(value);
  if (!date) return "Choisir une date";

  return capitalizeText(
    new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
      .format(date)
      .replace(/\.$/, ""),
  );
}

function formatDateMetaLabel(value) {
  const date = parseInputDate(value);
  const today = parseInputDate(getTodayInputValue());
  if (!date || !today) return "Date du trajet";

  const diffDays = Math.round((date.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  if (diffDays > 1 && diffDays < 7) {
    return capitalizeText(
      new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
      }).format(date),
    );
  }

  return capitalizeText(
    new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date),
  );
}

function formatFullDateLabel(value) {
  const date = parseInputDate(value);
  if (!date) return "date non sélectionnée";

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getTimeParts(value) {
  const time = readTimeInputValue(value) || defaultRideTime;
  const [hour, minute] = time.split(":");
  return { hour, minute };
}

function getHourOptions() {
  return ["18", "19", "20", "21", "22", "23", "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17"];
}

function getMinuteOptions(currentMinute) {
  const minutes = new Set(Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0")));
  minutes.add(currentMinute);
  return Array.from(minutes).sort((left, right) => Number(left) - Number(right));
}

function getSelectedOptionLabel(select) {
  return select.selectedOptions[0]?.textContent?.trim() || "Départ";
}

function formatTimeMetaLabel(value) {
  const { hour } = getTimeParts(value);
  const numericHour = Number(hour);

  if (numericHour >= 18 || numericHour < 5) return "Ce soir";
  if (numericHour < 12) return "Matinée";
  return "Après-midi";
}

function capitalizeText(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function hydrateRideFormFromUrl() {
  if (!rideForm || !formMessage) return;
  const params = new URLSearchParams(window.location.search);
  const from = params.get("from");
  const to = params.get("to");

  if (!from && !to) return;

  const fromInput = rideForm.querySelector('[name="from"]');
  const toInput = rideForm.querySelector('[name="to"]');
  const dateInput = rideForm.querySelector('[name="travelDate"]');
  const timeInput = rideForm.querySelector('[name="travelTime"]');
  const timeModeInput = rideForm.querySelector('[name="timeMode"]');

  if (fromInput instanceof HTMLInputElement) fromInput.value = from || fromInput.value;
  if (toInput instanceof HTMLInputElement) toInput.value = to || toInput.value;
  if (dateInput instanceof HTMLInputElement && params.get("date")) dateInput.value = readDateInputValue(params.get("date")) || dateInput.value;
  if (timeInput instanceof HTMLInputElement && params.get("time")) timeInput.value = readTimeInputValue(params.get("time")) || timeInput.value;
  if (timeModeInput instanceof HTMLSelectElement && params.get("timeMode")) timeModeInput.value = readTimeMode(params.get("timeMode"));

  formMessage.className = "form-message is-success";
  formMessage.textContent = "Recherche prête sur l'app locale.";
}

function initRideScheduleDefaults() {
  if (!rideForm) return;

  const today = getTodayInputValue();

  rideForm.querySelectorAll('[name="travelDate"]').forEach((input) => {
    if (!(input instanceof HTMLInputElement)) return;
    input.min = today;
    if (!input.value) input.value = today;
  });

  const timeInput = rideForm.querySelector('[name="travelTime"]');
  if (timeInput instanceof HTMLInputElement && !timeInput.value) {
    timeInput.value = defaultRideTime;
  }
}

function getTodayInputValue() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function readDateInputValue(value) {
  const date = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

function readTimeInputValue(value) {
  const time = String(value || "").trim();
  return /^\d{2}:\d{2}$/.test(time) ? time : "";
}

function readTimeMode(value) {
  return value === "arrival" ? "arrival" : "departure";
}

function formatRideDateLabel(value) {
  const date = readDateInputValue(value);
  if (!date) return "Aujourd'hui";

  const parsedDate = new Date(`${date}T12:00:00`);
  const label = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parsedDate);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatRideScheduleLabel(time, mode) {
  const timeLabel = readTimeInputValue(time) || defaultRideTime;
  const modeLabel = readTimeMode(mode) === "arrival" ? "Arrivée" : "Départ";
  return `${modeLabel} ${timeLabel}`;
}

function readNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return replacements[char];
  });
}
