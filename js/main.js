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

/* --- Шапка --- */
const header = $("#header");
window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
}, { passive: true });

/* --- Мобильное меню --- */
const burger = $("#burger");
const mobileMenu = $("#mobile-menu");
burger.addEventListener("click", () => {
  const open = burger.getAttribute("aria-expanded") === "true";
  burger.setAttribute("aria-expanded", String(!open));
  mobileMenu.classList.toggle("is-open", !open);
});

/* --- Рендер ЖК --- */
const complexesGrid = $("#complexes-grid");
function renderComplexes() {
  complexesGrid.innerHTML = "";
  complexes.forEach((c) => {
    const card = document.createElement("article");
    card.className = "complex-card";
    card.setAttribute("role", "listitem");
    card.dataset.complex = c.id;
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

/* --- Рендер Квартир (с автосменой) --- */
const apartmentsGrid = $("#apartments-grid");
const apartmentsTitle = $("#apartments-title");
const apartmentsLead = $("#apartments-lead");

function renderApartments(list, title = "Все квартиры") {
  if (apartmentsTitle) apartmentsTitle.textContent = title;
  if (apartmentsLead) apartmentsLead.textContent = `Найдено ${list.length}. Нажмите на карточку, чтобы открыть подробности и карту.`;
  
  apartmentsGrid.innerHTML = "";
  list.forEach((a) => {
    const card = document.createElement("article");
    card.className = "apartment-card";
    card.setAttribute("role", "listitem");
    card.dataset.apartment = a.id;
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
  });
}

renderComplexes();
renderApartments(apartments);
$("#year").textContent = new Date().getFullYear();

/* --- Логика переключения вкладок (Табы) --- */
const tabs = $$(".tab-content");
const navLinks = $$(".nav-link");

function switchTab(targetId) {
  // Скрываем все вкладки
  tabs.forEach(tab => tab.classList.remove("active"));
  // Показываем нужную
  const targetTab = $(`#tab-${targetId}`);
  if (targetTab) targetTab.classList.add("active");

  // Подсвечиваем ссылку
  navLinks.forEach(link => {
    link.classList.remove("active-link");
    if (link.getAttribute("href") === `#${targetId}`) {
      link.classList.add("active-link");
    }
  });

  // Скролл вверх
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Закрываем мобильное меню
  if (burger && mobileMenu) {
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
  }
}

navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.getAttribute("href").replace("#", "");
    if (target === "apartments" && document.querySelector("#apartments-title").textContent !== "Все квартиры") {
       renderApartments(apartments); // Сброс фильтра ЖК при переходе на вкладку Квартиры
    }
    switchTab(target);
    history.pushState(null, null, `#${target}`);
  });
});

// Клик по карточке ЖК - фильтруем квартиры и переходим на вкладку
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

/* --- Модалка --- */
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
    const obj = document.createElement("object");
    obj.data = apartment.plan;
    obj.type = "image/svg+xml";
    obj.innerHTML = "План квартиры (заглушка)";
    mediaContainer.appendChild(obj);
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

  // Кнопка "Перейти к расчету" внутри модалки
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
/* ---------- Логика Калькулятора ---------- */
const calcComplex = $("#calc-complex");
const calcArea = $("#calc-area");
const calcAreaVal = $("#calc-area-val");
const calcFloor = $("#calc-floor");
const calcFloorVal = $("#calc-floor-val");
const calcFinish = $("#calc-finish");
const calcParking = $("#calc-parking");
const calcTotal = $("#calc-total");
const calcBreakdown = $("#calc-breakdown");

// Заполняем select комплексами
if (calcComplex) {
  complexes.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    // Берем базовую цену из первой квартиры этого ЖК
    const apt = apartments.find(a => a.complexId === c.id);
    opt.dataset.price = apt ? apt.pricePerM2 : 300000;
    calcComplex.appendChild(opt);
  });

  let currentFinishPrice = 0;

  function updateCalculator() {
    const basePrice = parseInt(calcComplex.selectedOptions[0].dataset.price);
    const area = parseInt(calcArea.value);
    const floor = parseInt(calcFloor.value);
    
    // Коэффициент этажа (с 1 по 25, каждый этаж +0.5%)
    const floorMultiplier = 1 + (floor * 0.005);
    
    const baseCost = basePrice * area * floorMultiplier;
    const finishCost = currentFinishPrice * area;
    const parkingCost = calcParking.checked ? 1500000 : 0;
    
    const total = baseCost + finishCost + parkingCost;

    // Анимация цифр
    calcTotal.textContent = formatPrice(total);
    calcAreaVal.textContent = area;
    calcFloorVal.textContent = floor;

    // Детализация
    calcBreakdown.innerHTML = `
      <div class="calc-breakdown-row"><span>Базовая стоимость</span><span>${formatPrice(basePrice * area)}</span></div>
      <div class="calc-breakdown-row"><span>Наценка за этаж</span><span>+${formatPrice(baseCost - basePrice * area)}</span></div>
      <div class="calc-breakdown-row"><span>Отделка</span><span>${finishCost > 0 ? "+" + formatPrice(finishCost) : "Включена"}</span></div>
      <div class="calc-breakdown-row"><span>Паркинг</span><span>${parkingCost > 0 ? "+" + formatPrice(parkingCost) : "Нет"}</span></div>
    `;
  }

  // Слушатели
  calcComplex.addEventListener("change", updateCalculator);
  calcArea.addEventListener("input", updateCalculator);
  calcFloor.addEventListener("input", updateCalculator);
  calcParking.addEventListener("change", updateCalculator);

  // Кнопки отделки
  $$(".calc-option").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".calc-option").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFinishPrice = parseInt(btn.dataset.value);
      updateCalculator();
    });
  });

  // Первичный расчет
  updateCalculator();
}
/* ---------- Логика Конфигуратора мебели ---------- */
const furnitureTotal = $("#furniture-total");
const furnitureBreakdown = $("#furniture-breakdown");
const furnitureVisual = $("#furniture-visual");

// Иконки для визуала (SVG)
const icons = {
  kitchen: `<svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 16H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V8h8v2z"/></svg>`,
  living: `<svg viewBox="0 0 24 24"><path d="M4 18h16c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2h-1V7c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2zm11-9v3H9V9h6zm-8 3V7h2v5H7zm10 0V7h2v5h-2zM2 20c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2H2v2z"/></svg>`,
  bedroom: `<svg viewBox="0 0 24 24"><path d="M20 9.557V3h-2v2H6V3H4v6.557C2.81 10.25 2 11.525 2 13v4c0 1.103.897 2 2 2h1v2h2v-2h10v2h2v-2h1c1.103 0 2-.897 2-2v-4c0-1.475-.81-2.75-2-3.443zM18 9v2h-5V9h5zM6 9h5v2H6V9zM4 13h16v4H4v-4z"/></svg>`
};

const selectedFurniture = {
  kitchen: 0,
  living: 0,
  bedroom: 0
};

const roomNames = {
  kitchen: "Кухня",
  living: "Гостиная",
  bedroom: "Спальня"
};

function updateFurniture() {
  let total = 0;
  let htmlBreakdown = "";
  let visualHtml = "";

  // Перебираем комнаты
  Object.keys(selectedFurniture).forEach(room => {
    const price = selectedFurniture[room];
    total += price;

    if (price > 0) {
      // Добавляем в детализацию
      const packageName = price < 250000 ? "Базовая" : "Премиум";
      htmlBreakdown += `
        <div class="calc-breakdown-row">
          <span>${roomNames[room]} (${packageName})</span>
          <span>${formatPrice(price)}</span>
        </div>`;
      
      // Добавляем иконку в визуал
      visualHtml += `
        <div class="furniture-icon">
          ${icons[room]}
          <span>${roomNames[room]}</span>
        </div>`;
    }
  });

  // Обновляем цифры
  furnitureTotal.textContent = formatPrice(total);
  
  if (total === 0) {
    furnitureBreakdown.innerHTML = `<p style="text-align:center;">Мебель пока не выбрана</p>`;
    furnitureVisual.innerHTML = `<p style="color: var(--muted); font-size: 0.9rem;">Выберите мебель слева, чтобы увидеть её здесь</p>`;
  } else {
    furnitureBreakdown.innerHTML = htmlBreakdown;
    furnitureVisual.innerHTML = visualHtml;
  }
}

// Добавляем обработчики на кнопки выбора мебели
$$(".furniture-options").forEach(group => {
  const room = group.dataset.room;
  const buttons = group.querySelectorAll(".furniture-option");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Убираем активный класс у всех кнопок этой комнаты
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Сохраняем цену
      selectedFurniture[room] = parseInt(btn.dataset.price);
      updateFurniture();
    });
  });
});

// Первичная инициализация
if (furnitureTotal) updateFurniture();
/* ---------- Логика Формы Заявки ---------- */
const requestForm = $("#request-form");
const requestSuccess = $("#request-success");
const reqApartment = $("#req-apartment");
const reqPhone = $("#req-phone");

// Заполняем select квартирами
if (reqApartment) {
  apartments.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = `${a.complexName} — ${a.title} (${formatPrice(a.price)})`;
    reqApartment.appendChild(opt);
  });
}

// Маска для телефона
if (reqPhone) {
  reqPhone.addEventListener("input", (e) => {
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

// Отправка формы
if (requestForm) {
  requestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = $("#req-name").value;
    const phone = reqPhone.value;
    
    // Показываем блок успеха
    $("#success-name").textContent = name;
    $("#success-phone").textContent = phone;
    
    requestForm.hidden = true;
    requestSuccess.hidden = false;
    
    // Очищаем форму (для следующего раза)
    requestForm.reset();
  });

  // Кнопка "Отправить еще одну"
  $("#btn-reset-form").addEventListener("click", () => {
    requestSuccess.hidden = true;
    requestForm.hidden = false;
  });
}