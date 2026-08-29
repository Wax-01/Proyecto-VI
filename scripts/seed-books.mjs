// ============================================================
// scripts/seed-books.mjs — Alimenta la BD con libros sin usar el scraper.
//
// Para cada título de la lista: busca metadatos (autor, año, portada,
// sinopsis) en Open Library (API pública, sin key), arma el mismo payload
// que espera POST /api/items (server.js) y lo envía — reutilizando toda
// la lógica de dedupe de autores e inserción que ya existe.
//
// El precio no lo da ninguna API pública para el mercado colombiano:
// se asigna aleatorio dentro del rango real de tu catálogo ($38.000–$99.000),
// redondeado a miles. Edítalo luego a mano si quieres precios exactos.
//
// Uso: node scripts/seed-books.mjs   (con el server.js corriendo en :3000)
// ============================================================

const API_URL = "http://localhost:3000/api/items";
const OPENLIBRARY_HEADERS = { "User-Agent": "Bhook-ecommerce/1.0 (seed script, personal project)" };
const PRECIO_MIN = 38000;
const PRECIO_MAX = 99000;

const TITULOS = [
  "Percy Jackson y el ladrón del rayo",
  "Culpa mía",
  "El día que dejó de nevar en Alaska",
  "Culpa tuya",
  "Percy Jackson: El mar de los monstruos",
  "Hija de humo y hueso",
  "Ciudad de hueso",
  "Percy Jackson: La batalla del laberinto",
  "Ciudad de Cenizas",
  "Culpa Nuestra",
  "Ruina y ascenso",
  "Días de sangre y resplandor",
  "Ciudad de cristal",
  "Todo lo que nunca fuimos",
  "Percy Jackson: El último héroe del Olimpo",
  "Maravilloso desastre",
  "Deja que suene nuestra canción",
  "Las reglas del juego",
  "Noches de verano en Taipéi",
  "Ángel mecánico",
  "Sueños de dioses y monstruos",
  "Mestiza",
  "Save Me",
  "Sin amor",
  "Todo lo que somos juntos",
  "Príncipe mecánico",
  "Princesa mecánica",
  "Puro",
  "Cuento de un cielo en llamas",
  "Ciudad de fuego celestial",
  "Seis de cuervos",
  "Mala fama",
  "Vampire Academy",
  "Nosotros en la luna",
  "Vampire Academy: Sangre fría",
  "Lady Midnight",
  "Vampire Academy: Bendecida por la sombra",
  "Romper el hielo",
  "Reino de ladrones",
  "El faro de los amores dormidos",
  "Vampire Academy: Promesa de sangre",
  "El señor de las sombras",
  "Vampire Academy: Deuda de espíritu",
  "Saltan chispas",
  "Warcross",
  "Lo que la nieve susurra al caer",
  "Vampire Academy: Último sacrificio",
  "Alaska sin ti",
  "Destrózame",
  "Rozando el cielo",
  "Susurros",
  "Juliette y las canciones perdidas",
  "Wardraft",
  "Gente que conocimos en vacaciones",
  "Donde todo brilla",
  "Los siete maridos de Evelyn Hugo",
  "La reina del aire y la oscuridad",
  "El mapa de los anhelos",
  "Cuando despierten las flores",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function precioAleatorio() {
  const rango = PRECIO_MAX - PRECIO_MIN;
  return Math.round((PRECIO_MIN + Math.random() * rango) / 1000) * 1000;
}

async function buscarEnOpenLibrary(titulo) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(titulo)}&limit=5&fields=title,author_name,first_publish_year,cover_i,key,language,number_of_pages_median,publisher`;
  const res = await fetch(url, { headers: OPENLIBRARY_HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.docs || data.docs.length === 0) return null;

  // Preferir un resultado que tenga edición en español; si no, el primero.
  const conEspanol = data.docs.find((d) => Array.isArray(d.language) && d.language.includes("spa"));
  return conEspanol || data.docs[0];
}

async function obtenerDescripcion(workKey) {
  if (!workKey) return null;
  try {
    const res = await fetch(`https://openlibrary.org${workKey}.json`, { headers: OPENLIBRARY_HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.description) return null;
    return typeof data.description === "string" ? data.description : data.description.value ?? null;
  } catch {
    return null;
  }
}

async function construirLibro(titulo) {
  const match = await buscarEnOpenLibrary(titulo);
  await sleep(300); // ser cordial con la API pública

  let descripcion = null;
  if (match?.key) {
    descripcion = await obtenerDescripcion(match.key);
    await sleep(300);
  }

  return {
    nombre: titulo,
    descripcion,
    autor: match?.author_name?.[0] || null,
    precio: precioAleatorio(),
    imagen_url: match?.cover_i ? `https://covers.openlibrary.org/b/id/${match.cover_i}-L.jpg` : null,
    num_paginas: match?.number_of_pages_median || null,
    idioma: "Español",
    encuadernacion: null,
    marca_editorial: match?.publisher?.[0] || null,
    codigo_interno: null,
    anio_edicion: match?.first_publish_year ? String(match.first_publish_year) : null,
    _match_encontrado: !!match,
  };
}

async function main() {
  console.log(`Buscando metadatos para ${TITULOS.length} libros en Open Library...\n`);
  const libros = [];

  for (let i = 0; i < TITULOS.length; i++) {
    const titulo = TITULOS[i];
    process.stdout.write(`[${i + 1}/${TITULOS.length}] ${titulo} ... `);
    try {
      const libro = await construirLibro(titulo);
      libros.push(libro);
      console.log(libro._match_encontrado ? `OK (${libro.autor || "autor desconocido"})` : "SIN COINCIDENCIA");
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      libros.push({
        nombre: titulo,
        descripcion: null,
        autor: null,
        precio: precioAleatorio(),
        imagen_url: null,
        num_paginas: null,
        idioma: "Español",
        encuadernacion: null,
        marca_editorial: null,
        codigo_interno: null,
        anio_edicion: null,
        _match_encontrado: false,
      });
    }
  }

  const payload = {
    fuente: "openlibrary-seed",
    cantidad: libros.length,
    extraido_en: new Date().toISOString(),
    libros: libros.map(({ _match_encontrado, ...resto }) => resto),
  };

  console.log(`\nEnviando ${libros.length} libros a ${API_URL} ...`);
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const resultado = await res.json();
  console.log("\nRespuesta del servidor:");
  console.log(JSON.stringify(resultado, null, 2));

  const sinCoincidencia = libros.filter((l) => !l._match_encontrado).map((l) => l.nombre);
  if (sinCoincidencia.length > 0) {
    console.log(`\nSin coincidencia en Open Library (se insertaron igual, sin autor/portada/descripción):`);
    sinCoincidencia.forEach((n) => console.log(`  - ${n}`));
  }
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
