import { complexes, apartments, formatPrice } from "./data.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* --- Плейсхолдеры для картинок --- */
function fallbackSVG(label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c2126"/><stop offset="1" stop-color="#2a3138"/></linearGradient></defs>
      <rect width="800" height="500" fill="url(#g)"/>
      <g fill="none" stroke="#c9a96a" stroke-opacity="0.35" stroke-width="2"><rect x="40" y="40" width="720" height="420" rx="18"/></g>
      <text x="50%" y="47%" fill="#9aa4ad" font-family="Manrope, sans-serif" font-size="26" text-anchor="middle">${label}</text>
      <text x="50%" y="55%" fill="#6b747c" font-family="Manrope, sans-serif" font-size="16" text-anchor="middle">подставьте изображение по пути из data.js</text>
    </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function safeImg(src, alt, label, cls = "") {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  if (cls) img.className = cls;
  img.loading = "lazy";
  img.addEventListener("error", () => { img.src = fallbackSVG(label); }, { once: true });
  return img;
}

/* --- Шапка и Параллакс --- */
const header = $("#header");
const heroBg = $(".hero__bg");
window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
  if (heroBg && window.scrollY < window.innerHeight) {
    heroBg.style.transform = `translateY(${window.scrollY * 0.4}px)`;
  }
}, { passive: true });

/* --- Мобильное меню --- */
const burger = $("#burger");
const mobileMenu = $("#mobile-menu");
if (burger) {
  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!open));
    mobileMenu.classList.toggle("is-open", !open);
  });
}

/* --- Рендер ЖК --- */
const complexesGrid = $("#complexes-grid");
function renderComplexes() {
  complexesGrid.innerHTML = "";
  complexes.forEach((c, index) => {
    const card = document.createElement("article");
    card.className = "complex-card reveal";
    card.setAttribute("role", "listitem");
    card.dataset.complex = c.id;
    card.style.transitionDelay = `${index * 0.1}s`;

    const media = document.createElement("div");
    media.className = "complex-card__media";
    media.appendChild(safeImg(c.cover, c.name, c.name));
    const badge = document.createElement("span");
    badge.className = "complex-card__badge";
    badge.textContent = c.class;
    media.appendChild(badge);
    const overlay = document.createElement("div");
    overlay.className = "complex-card__overlay";
    overlay.innerHTML = `<h3 class="complex-card__name">${c.name}</h3><p class="complex-card__meta">${c.desc}</p>`;
    card.append(media, overlay);
    complexesGrid.appendChild(card);
  });
}

/* --- Рендер Квартир (с автосменой и избранным) --- */
const apartmentsGrid = $("#apartments-grid");
const apartmentsTitle = $("#apartments-title");
const apartmentsLead = $("#apartments-lead");

function renderApartments(list, title = "Все квартиры") {
  if (apartmentsTitle) apartmentsTitle.textContent = title;
  if (apartmentsLead) apartmentsLead.textContent = `Найдено ${list.length}. Нажмите на карточку, чтобы открыть подробности и карту.`;
  
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  apartmentsGrid.innerHTML = "";

  list.forEach((a, index) => {
    const isFavorite = favorites.includes(a.id);
    const card = document.createElement("article");
    card.className = "apartment-card reveal";
    card.setAttribute("role", "listitem");
    card.dataset.apartment = a.id;
    card.style.transitionDelay = `${index * 0.05}s`;

    const media = document.createElement("div");
    media.className = "apartment-card__media";
    const img = safeImg(a.photos[0], a.title, a.title);
    media.appendChild(img);

    if (a.photos.length > 1) {
      let currentIndex = 0;
      setInterval(() => {
        currentIndex = (currentIndex + 1) % a.photos.length;
        img.style.opacity = "0.5"; 
        setTimeout(() => {
          img.src = a.photos[currentIndex];
          img.onerror = () => { img.src = fallbackSVG(a.title); };
          img.style.opacity = "1";
        }, 400);
      }, 3000 + Math.random() * 2000);
    }

    const tag = document.createElement("span");
    tag.className = "apartment-card__tag";
    tag.textContent = a.tag;
    media.appendChild(tag);

    const favBtn = document.createElement("button");
    favBtn.className = `apartment-card__fav ${isFavorite ? "active" : ""}`;
    favBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    media.appendChild(favBtn);

    const body = document.createElement("div");
    body.className = "apartment-card__body";
    body.innerHTML = `
      <span class="apartment-card__complex">${a.complexName}</span>
      <h3 class="apartment-card__title">${a.title}</h3>
      <div class="apartment-card__meta"><span>${a.floor} этаж</span><span>${a.rooms} комн.</span><span>№ ${a.num}</span></div>
      <p class="apartment-card__price">${formatPrice(a.price)}</p>
    `;

    card.append(media, body);
    apartmentsGrid.appendChild(card);

    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      let favs = JSON.parse(localStorage.getItem("favorites")) || [];
      if (favs.includes(a.id)) {
        favs = favs.filter(id => id !== a.id);
        favBtn.classList.remove("active");
      } else {
        favs.push(a.id);
        favBtn.classList.add("active");
      }
      localStorage.setItem("favorites", JSON.stringify(favs));
    });
  });

  initRevealAnimation();
}

/* --- Логика переключения вкладок (Табы) --- */
const tabs = $$(".tab-content");
const navLinks = $$(".nav-link");

function switchTab(targetId) {
  tabs.forEach(tab => tab.classList.remove("active"));
  const targetTab = $(`#tab-${targetId}`);
  if (targetTab) targetTab.classList.add("active");

  navLinks.forEach(link => {
    link.classList.remove("active-link");
    if (link.getAttribute("href") === `#${targetId}`) link.classList.add("active-link");
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (burger && mobileMenu) {
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
  }
}

navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.getAttribute("href").replace("#", "");
    
    const currentTitle = document.querySelector("#apartments-title");
    if (target === "apartments" && currentTitle && currentTitle.textContent !== "Все квартиры") {
       renderApartments(apartments); 
    }
    
    if (target === "request") {
      const hiddenTotal = $("#req-total");
      if (hiddenTotal) {
        const calcTotal = localStorage.getItem("calc_total");
        const furnTotal = localStorage.getItem("furniture_total");
        let commentText = "";
        if (calcTotal && parseInt(calcTotal) > 0) commentText += `Квартира: ${formatPrice(parseInt(calcTotal))}. `;
        if (furnTotal && parseInt(furnTotal) > 0) commentText += `Мебель: ${formatPrice(parseInt(furnTotal))}. `;
        hiddenTotal.value = commentText || "Без предварительного расчета";
      }
    }

    switchTab(target);
    history.pushState(null, null, `#${target}`);
  });
});

// Фильтр по ЖК
complexesGrid.addEventListener("click", (e) => {
  const card = e.target.closest("[data-complex]");
  if (!card) return;
  const id = card.dataset.complex;
  const complex = complexes.find((c) => c.id === id);
  const list = apartments.filter((a) => a.complexId === id);
  renderApartments(list, complex.name);
  switchTab("apartments");
  history.pushState(null, null, `#apartments`);
});

// Проверка хэша при загрузке
if (window.location.hash) {
  const hash = window.location.hash.replace("#", "");
  if ($(`#tab-${hash}`)) switchTab(hash);
}

/* --- Логика Калькулятора --- */
const calcComplex = $("#calc-complex");
const calcArea = $("#calc-area");
const calcAreaVal = $("#calc-area-val");
const calcFloor = $("#calc-floor");
const calcFloorVal = $("#calc-floor-val");
const calcFinish = $("#calc-finish");
const calcParking = $("#calc-parking");
const calcTotal = $("#calc-total");
const calcBreakdown = $("#calc-breakdown");

if (calcComplex) {
  complexes.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    const apt = apartments.find(a => a.complexId === c.id);
    opt.dataset.price = apt ? apt.pricePerM2 : 300000;
    calcComplex.appendChild(opt);
  });

  let currentFinishPrice = 0;

  function updateCalculator() {
    const basePrice = parseInt(calcComplex.selectedOptions[0].dataset.price);
    const area = parseInt(calcArea.value);
    const floor = parseInt(calcFloor.value);
    
    const floorMultiplier = 1 + (floor * 0.005);
    const baseCost = basePrice * area * floorMultiplier;
    const finishCost = currentFinishPrice * area;
    const parkingCost = calcParking.checked ? 1500000 : 0;
    
    const total = baseCost + finishCost + parkingCost;

    calcTotal.classList.remove("pulse");
    void calcTotal.offsetWidth;
    calcTotal.classList.add("pulse");
    
    calcTotal.textContent = formatPrice(total);
    calcAreaVal.textContent = area;
    calcFloorVal.textContent = floor;

    calcBreakdown.innerHTML = `
      <div class="calc-breakdown-row"><span>Базовая стоимость</span><span>${formatPrice(basePrice * area)}</span></div>
      <div class="calc-breakdown-row"><span>Наценка за этаж (${floor})</span><span>+${formatPrice(baseCost - basePrice * area)}</span></div>
      <div class="calc-breakdown-row"><span>Отделка</span><span>${finishCost > 0 ? "+" + formatPrice(finishCost) : "Включена"}</span></div>
      <div class="calc-breakdown-row"><span>Паркинг</span><span>${parkingCost > 0 ? "+" + formatPrice(parkingCost) : "Нет"}</span></div>
    `;

    localStorage.setItem("calc_total", total);
  }

  calcComplex.addEventListener("change", updateCalculator);
  calcArea.addEventListener("input", updateCalculator);
  calcFloor.addEventListener("input", updateCalculator);
  calcParking.addEventListener("change", updateCalculator);

  $$(".calc-option").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".calc-option").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFinishPrice = parseInt(btn.dataset.value);
      updateCalculator();
    });
  });

  updateCalculator();
}

/* --- Логика Мебели (Иконки) --- */
const furnitureTotal = $("#furniture-total");
const furnitureBreakdown = $("#furniture-breakdown");
const furnitureVisual = $("#furniture-visual");

// Векторные иконки (SVG) для каждой комнаты
const icons = {
  kitchen: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 16H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V8h8v2z"/></svg>`,
  living: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 18h16c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2h-1V7c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2zm11-9v3H9V9h6zm-8 3V7h2v5H7zm10 0V7h2v5h-2zM2 20c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2H2v2z"/></svg>`,
  bedroom: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 9.557V3h-2v2H6V3H4v6.557C2.81 10.25 2 11.525 2 13v4c0 1.103.897 2 2 2h1v2h2v-2h10v2h2v-2h1c1.103 0 2-.897 2-2v-4c0-1.475-.81-2.75-2-3.443zM18 9v2h-5V9h5zM6 9h5v2H6V9zM4 13h16v4H4v-4z"/></svg>`
};

const selectedFurniture = { kitchen: 0, living: 0, bedroom: 0 };
const roomNames = { kitchen: "Кухня", living: "Гостиная", bedroom: "Спальня" };

function updateFurniture() {
  let total = 0;
  let htmlBreakdown = "";
  let visualHtml = "";

  Object.keys(selectedFurniture).forEach(room => {
    const price = selectedFurniture[room];
    total += price;

    if (price > 0) {
      const packageName = price < 250000 ? "Базовая" : "Премиум";
      htmlBreakdown += `<div class="calc-breakdown-row"><span>${roomNames[room]} (${packageName})</span><span>${formatPrice(price)}</span></div>`;
      
      // Добавляем стильную иконку в золотой рамке
      visualHtml += `
        <div class="furniture-visual-item">
          <div class="furniture-icon-wrapper">${icons[room]}</div>
          <span>${roomNames[room]}</span>
        </div>`;
    }
  });

  if (furnitureTotal) {
    furnitureTotal.classList.remove("pulse");
    void furnitureTotal.offsetWidth;
    furnitureTotal.classList.add("pulse");
    
    furnitureTotal.textContent = formatPrice(total);
  }
  
  if (total === 0) {
    if (furnitureBreakdown) furnitureBreakdown.innerHTML = `<p style="text-align:center;">Мебель пока не выбрана</p>`;
    if (furnitureVisual) furnitureVisual.innerHTML = `<p style="color: var(--muted); font-size: 0.9rem;">Выберите мебель слева, чтобы увидеть её здесь</p>`;
  } else {
    if (furnitureBreakdown) furnitureBreakdown.innerHTML = htmlBreakdown;
    if (furnitureVisual) furnitureVisual.innerHTML = visualHtml;
  }

  localStorage.setItem("furniture_total", total);
}

$$(".furniture-options").forEach(group => {
  const room = group.dataset.room;
  const buttons = group.querySelectorAll(".furniture-option");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedFurniture[room] = parseInt(btn.dataset.price);
      updateFurniture();
    });
  });
});

if (furnitureTotal) updateFurniture();

/* --- Логика Квиза (Заявка) --- */
const quizForm = $("#quiz-form");
const quizSteps = $$(".quiz-step");
const quizSuccess = $("#quiz-success");
const quizBudget = $("#quiz-budget");
const quizBudgetValue = $("#quiz-budget-value");

if (quizForm) {
  const formatBudget = (val) => {
    if (val >= 1000000) {
      const millions = val / 1000000;
      return millions.toFixed(0) + " млн ₽";
    }
    return formatPrice(val);
  };

  quizBudget.addEventListener("input", (e) => {
    quizBudgetValue.textContent = formatBudget(parseInt(e.target.value));
  });

  $$(".quiz-next").forEach(btn => {
    btn.addEventListener("click", () => {
      const nextStep = btn.dataset.next;
      quizSteps.forEach(step => step.classList.remove("active"));
      $(`.quiz-step[data-step="${nextStep}"]`).classList.add("active");
    });
  });

  $$(".quiz-prev").forEach(btn => {
    btn.addEventListener("click", () => {
      const prevStep = btn.dataset.prev;
      quizSteps.forEach(step => step.classList.remove("active"));
      $(`.quiz-step[data-step="${prevStep}"]`).classList.add("active");
    });
  });

  const quizPhone = $("#quiz-phone");
  if (quizPhone) {
    quizPhone.addEventListener("input", (e) => {
      let input = e.target.value.replace(/\D/g, "");
      let formatted = "";
      if (input.length > 0) {
        formatted = "+7";
        if (input.length > 1) formatted += " (" + input.substring(1, 4);
        if (input.length > 4) formatted += ") " + input.substring(4, 7);
        if (input.length > 7) formatted += "-" + input.substring(7, 9);
        if (input.length > 9) formatted += "-" + input.substring(9, 11);
      }
      e.target.value = formatted;
    });
  }

  function updateHiddenData() {
    const hiddenInput = $("#req-total");
    if (!hiddenInput) return;
    const calcTotal = localStorage.getItem("calc_total");
    const furnTotal = localStorage.getItem("furniture_total");
    let commentText = "";
    if (calcTotal && parseInt(calcTotal) > 0) commentText += `Квартира: ${formatPrice(parseInt(calcTotal))}. `;
    if (furnTotal && parseInt(furnTotal) > 0) commentText += `Мебель: ${formatPrice(parseInt(furnTotal))}. `;
    hiddenInput.value = commentText || "Без предварительного расчета";
  }

  $$(".quiz-next").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.next === "3") updateHiddenData();
    });
  });

  quizForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#quiz-name").value;
    const email = $("#quiz-email").value;
    const phone = quizPhone.value;

    if (!name || !phone || !email) {
      alert("Пожалуйста, заполните имя, почту и телефон.");
      return;
    }

    const submitBtn = quizForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Отправка...";
    submitBtn.disabled = true;

    const formData = new FormData(quizForm);
    
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        $("#success-name").textContent = name;
        quizForm.hidden = true;
        quizSuccess.hidden = false;
      } else {
        alert("Ошибка отправки: " + data.message);
      }
    })
    .catch(error => {
      console.error("Ошибка:", error);
      alert("Произошла ошибка при отправке. Проверьте интернет.");
    })
    .finally(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  });

  $("#btn-reset-quiz").addEventListener("click", () => {
    quizSuccess.hidden = true;
    quizForm.hidden = false;
    quizForm.reset();
    quizSteps.forEach(step => step.classList.remove("active"));
    $('.quiz-step[data-step="1"]').classList.add("active");
    quizBudgetValue.textContent = "15 млн ₽";
    quizBudget.value = 15000000;
  });
}

/* --- Модалка Квартиры --- */
const modal = $("#apartment-modal");
const modalContent = $("#modal-content");

function openApartmentModal(apartment) {
  modal.hidden = false;
  document.body.style.overflow = "hidden"; 

  let currentPhotoIndex = 0;
  let isMapOpen = false;
  let mapInstance = null;

  modalContent.innerHTML = `
    <div class="apt-gallery" id="apt-gallery">
      <div id="apt-media-container"></div>
      <button class="apt-gallery__nav apt-gallery__nav--prev" id="apt-prev">❮</button>
      <button class="apt-gallery__nav apt-gallery__nav--next" id="apt-next">❯</button>
      <div class="apt-gallery__tabs">
        <button class="apt-gallery__tab active" data-tab="photos">Фото</button>
        <button class="apt-gallery__tab" data-tab="plan">План</button>
      </div>
    </div>
    <div class="apt-modal__head">
      <div><div class="apt-modal__complex">${apartment.complexName}</div><h2 class="apt-modal__title">${apartment.title}</h2></div>
      <div class="apt-modal__price">${formatPrice(apartment.price)}</div>
    </div>
    <div class="apt-modal__meta">
      <div class="apt-modal__meta-item"><span class="apt-modal__meta-label">Площадь</span><span class="apt-modal__meta-value">${apartment.area} м²</span></div>
      <div class="apt-modal__meta-item"><span class="apt-modal__meta-label">Этаж</span><span class="apt-modal__meta-value">${apartment.floor}</span></div>
      <div class="apt-modal__meta-item"><span class="apt-modal__meta-label">Комнат</span><span class="apt-modal__meta-value">${apartment.rooms}</span></div>
      <div class="apt-modal__meta-item"><span class="apt-modal__meta-label">Цена за м²</span><span class="apt-modal__meta-value">${formatPrice(apartment.pricePerM2)}</span></div>
    </div>
    <div class="apt-modal__actions">
      <button class="btn btn--primary" id="btn-toggle-map">Показать на карте</button>
      <a href="#calculator" class="btn btn--ghost nav-link" id="modal-to-calc">Перейти к расчёту</a>
    </div>
    <div class="apt-modal__map-container" id="map-wrapper"><div id="modal-map"></div></div>
  `;

  const mediaContainer = $("#apt-media-container");
  function renderPhoto() {
    mediaContainer.innerHTML = "";
    const img = safeImg(apartment.photos[currentPhotoIndex], apartment.title, "Фото квартиры");
    mediaContainer.appendChild(img);
  }
  
  function renderPlan() {
    mediaContainer.innerHTML = "";
    const img = safeImg(apartment.plan, "План квартиры", "План квартиры");
    img.style.objectFit = "contain"; // Чтобы чертеж не обрезался
    img.style.background = "#fff"; // Белый фон для чертежа
    mediaContainer.appendChild(img);
  }
  
  renderPhoto();

  $("#apt-prev").addEventListener("click", () => {
    currentPhotoIndex = (currentPhotoIndex - 1 + apartment.photos.length) % apartment.photos.length;
    renderPhoto();
  });
  $("#apt-next").addEventListener("click", () => {
    currentPhotoIndex = (currentPhotoIndex + 1) % apartment.photos.length;
    renderPhoto();
  });

  $$(".apt-gallery__tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      $$(".apt-gallery__tab").forEach(t => t.classList.remove("active"));
      e.target.classList.add("active");
      if (e.target.dataset.tab === "photos") {
        renderPhoto();
        $("#apt-prev").style.display = "grid"; $("#apt-next").style.display = "grid";
      } else {
        renderPlan();
        $("#apt-prev").style.display = "none"; $("#apt-next").style.display = "none";
      }
    });
  });

  const mapWrapper = $("#map-wrapper");
  $("#btn-toggle-map").addEventListener("click", (e) => {
    isMapOpen = !isMapOpen;
    if (isMapOpen) {
      mapWrapper.classList.add("active");
      e.target.textContent = "Скрыть карту";
      if (!mapInstance) {
        setTimeout(() => {
          mapInstance = L.map('modal-map').setView(apartment.coords, 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mapInstance);
          L.marker(apartment.coords).addTo(mapInstance).bindPopup(`<b>${apartment.complexName}</b><br>${apartment.address}`).openPopup();
        }, 100);
      } else { setTimeout(() => mapInstance.invalidateSize(), 100); }
    } else {
      mapWrapper.classList.remove("active");
      e.target.textContent = "Показать на карте";
    }
  });

  $("#modal-to-calc").addEventListener("click", () => {
    modal.hidden = true;
    document.body.style.overflow = "";
  });
}

apartmentsGrid.addEventListener("click", (e) => {
  const card = e.target.closest("[data-apartment]");
  if (!card) return;
  const apartment = apartments.find(a => a.id === card.dataset.apartment);
  if (apartment) openApartmentModal(apartment);
});

modal.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close") || e.target.classList.contains("modal__backdrop")) {
    modal.hidden = true;
    document.body.style.overflow = "";
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) {
    modal.hidden = true;
    document.body.style.overflow = "";
  }
});

/* --- Анимация появления (Scroll Reveal) --- */
function initRevealAnimation() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const revealElements = $$(".reveal:not(.is-visible)");
  revealElements.forEach(el => revealObserver.observe(el));
}

// Запускаем после инициализации DOM
renderComplexes();
renderApartments(apartments);
$("#year").textContent = new Date().getFullYear();
setTimeout(initRevealAnimation, 200);