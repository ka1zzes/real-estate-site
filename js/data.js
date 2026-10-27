export const complexes = [
  { id: "north-park", name: "Северный Парк", class: "Бизнес-класс", address: "Москва, Северный район, ул. Парковая, 12", coords: [55.8558, 37.5173], cover: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80", hero: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80", desc: "Клубный дом у парка: панорамные окна, тихий двор, своя оранжерея." },
  { id: "river-quarter", name: "Речной Квартал", class: "Комфорт-класс", address: "Москва, Набережная, ул. Речная, 4", coords: [55.7358, 37.6373], cover: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", hero: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80", desc: "Малоэтажные дома на набережной: террасы, вода, велодорожки." },
  { id: "atlas", name: "Атлас", class: "Премиум", address: "Москва, Центр, ул. Атласная, 1", coords: [55.7558, 37.6173], cover: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", hero: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80", desc: "Клубный дом в центре: 9 этажей, консьерж, приватный лифт." },
  { id: "sosny", name: "Сосны", class: "Загородный", address: "Московская обл., Сосновый бор, 7", coords: [55.9158, 37.4173], cover: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80", hero: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=80", desc: "Таунхаусы в лесу: свой вход, терраса, парковка у дома." },
];

const apartmentSeeds = {
  "north-park": [
    { num: "101", rooms: 1, area: 42, floor: 3, pricePerM2: 310000, tag: "Свободна" },
    { num: "102", rooms: 2, area: 64, floor: 7, pricePerM2: 320000, tag: "Свободна" },
    { num: "103", rooms: 2, area: 71, floor: 9, pricePerM2: 330000, tag: "Бронь" },
  ],
  "river-quarter": [
    { num: "201", rooms: 1, area: 38, floor: 1, pricePerM2: 240000, tag: "Свободна" },
    { num: "202", rooms: 2, area: 58, floor: 2, pricePerM2: 250000, tag: "Свободна" },
    { num: "203", rooms: 2, area: 62, floor: 3, pricePerM2: 255000, tag: "Свободна" },
  ],
  "atlas": [
    { num: "301", rooms: 1, area: 46, floor: 2, pricePerM2: 480000, tag: "Свободна" },
    { num: "302", rooms: 2, area: 70, floor: 3, pricePerM2: 500000, tag: "Свободна" },
    { num: "303", rooms: 2, area: 78, floor: 4, pricePerM2: 510000, tag: "Бронь" },
  ],
  "sosny": [
    { num: "401", rooms: 2, area: 66, floor: 1, pricePerM2: 210000, tag: "Свободна" },
    { num: "402", rooms: 3, area: 88, floor: 1, pricePerM2: 220000, tag: "Свободна" },
    { num: "403", rooms: 3, area: 94, floor: 2, pricePerM2: 225000, tag: "Бронь" },
  ],
};

const interiorPhotos = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80"
];

export const apartments = complexes.flatMap((c, cIndex) =>
  apartmentSeeds[c.id].map((s, aIndex) => {
    const id = `a${s.num}`;
    const p1 = interiorPhotos[(cIndex + aIndex) % interiorPhotos.length];
    const p2 = interiorPhotos[(cIndex + aIndex + 1) % interiorPhotos.length];
    const p3 = interiorPhotos[(cIndex + aIndex + 2) % interiorPhotos.length];

    return {
      id, complexId: c.id, complexName: c.name, num: s.num, rooms: s.rooms, area: s.area, floor: s.floor, pricePerM2: s.pricePerM2, price: s.area * s.pricePerM2, tag: s.tag,
      title: `${s.rooms}-комнатная, ${s.area} м²`, coords: c.coords, address: c.address,
      photos: [p1, p2, p3],
      plan: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    };
  })
);

export const formatPrice = (value) => new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";