// ============================================================
// server.js — API Backend RESTful para Bhook (E-commerce de libros)
// Servidor intermedio que desacopla la recolección de datos
// (scraper) de la persistencia (Supabase) y la presentación
// (frontend React).
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

// --- Configuración de Supabase ---
// Reutilizamos las mismas variables de entorno que usa el frontend (Vite)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan las variables VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Configuración del servidor Express ---
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: habilitar CORS para que el frontend pueda consumir la API
app.use(cors());
// Middleware: parsear cuerpos JSON (limite de 5MB para payloads grandes del scraper)
app.use(express.json({ limit: '5mb' }));

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Convierte un string de precio como "$139.000" a un entero (139000).
 * Si el valor ya es un número, lo retorna directamente.
 * @param {string|number} precioRaw - El precio en formato string o número.
 * @returns {number} El precio como entero.
 */
function parsearPrecio(precioRaw) {
  if (typeof precioRaw === 'number') return precioRaw;
  if (!precioRaw) return 0;

  // Eliminar el símbolo "$", espacios y puntos de miles
  const limpio = String(precioRaw).replace(/[$\s.]/g, '');
  const numero = parseInt(limpio, 10);
  return isNaN(numero) ? 0 : numero;
}

/**
 * Busca un autor por nombre en la tabla 'autor'.
 * Si no existe, lo crea y retorna su id.
 * @param {string} nombreAutor - Nombre del autor a buscar/crear.
 * @returns {Promise<number|null>} El id del autor, o null si no hay nombre.
 */
async function obtenerOCrearAutor(nombreAutor) {
  if (!nombreAutor || nombreAutor.trim() === '') return null;

  const nombreLimpio = nombreAutor.trim();

  // Intentar encontrar el autor existente
  const { data: autorExistente, error: errorBusqueda } = await supabase
    .from('autor')
    .select('id')
    .eq('nombre', nombreLimpio)
    .maybeSingle();

  if (errorBusqueda) {
    console.error('Error buscando autor:', errorBusqueda.message);
    return null;
  }

  // Si ya existe, retornar su id
  if (autorExistente) {
    return autorExistente.id;
  }

  // Si no existe, crear uno nuevo
  const { data: nuevoAutor, error: errorInsercion } = await supabase
    .from('autor')
    .insert({ nombre: nombreLimpio })
    .select('id')
    .single();

  if (errorInsercion) {
    console.error('Error creando autor:', errorInsercion.message);
    return null;
  }

  console.log(`✅ Autor creado: "${nombreLimpio}" (id: ${nuevoAutor.id})`);
  return nuevoAutor.id;
}

// ============================================================
// ENDPOINT POST /api/items
// Recibe el payload del scraper de Python, valida la estructura,
// busca/crea autores y ejecuta la inserción masiva en Supabase.
// ============================================================
app.post('/api/items', async (req, res) => {
  try {
    const payload = req.body;

    // Validar que venga el array de libros
    const librosRaw = payload.libros;
    if (!Array.isArray(librosRaw) || librosRaw.length === 0) {
      return res.status(400).json({
        error: 'El payload debe contener un array "libros" con al menos un elemento.',
      });
    }

    console.log(`📥 Recibidos ${librosRaw.length} libros de la fuente "${payload.fuente || 'desconocida'}"`);

    let insertados = 0;
    const errores = [];

    // Procesar cada libro individualmente para manejar la relación con autor
    for (const libroRaw of librosRaw) {
      try {
        // Buscar o crear el autor
        const autorId = await obtenerOCrearAutor(libroRaw.autor);

        // Parsear el año de publicación a entero
        let anioPublicacion = null;
        if (libroRaw.anio_edicion) {
          const anio = parseInt(String(libroRaw.anio_edicion), 10);
          anioPublicacion = isNaN(anio) ? null : anio;
        }

        // Armar el objeto para insertar en la tabla "libros"
        const libroParaInsertar = {
          nombre: libroRaw.nombre || 'Sin título',
          descripcion: libroRaw.descripcion || null,
          autor_id: autorId,
          precio: parsearPrecio(libroRaw.precio),
          imagen_url: libroRaw.imagen_url || null,
          paginas: libroRaw.num_paginas || null,
          idioma: libroRaw.idioma || null,
          tipo_tapa: libroRaw.encuadernacion || null,
          editorial: libroRaw.marca_editorial || null,
          codigo_producto: libroRaw.codigo_interno || null,
          año_publicacion: anioPublicacion,
        };

        // Insertar en la tabla "libros"
        const { error: errorInsert } = await supabase
          .from('libros')
          .insert(libroParaInsertar);

        if (errorInsert) {
          errores.push({ nombre: libroRaw.nombre, error: errorInsert.message });
          console.error(`❌ Error insertando "${libroRaw.nombre}":`, errorInsert.message);
        } else {
          insertados++;
        }
      } catch (errorLibro) {
        errores.push({ nombre: libroRaw.nombre, error: errorLibro.message });
        console.error(`❌ Excepción procesando "${libroRaw.nombre}":`, errorLibro.message);
      }
    }

    console.log(`✅ Inserción completada: ${insertados}/${librosRaw.length} libros guardados`);

    return res.status(201).json({
      message: 'Procesamiento completado.',
      insertados,
      errores: errores.length > 0 ? errores : undefined,
    });
  } catch (error) {
    console.error('❌ Error general en POST /api/items:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ============================================================
// ENDPOINT GET /api/items
// Consulta la tabla "libros" con JOIN a "autor" para retornar
// el listado completo de registros, ordenados por id descendente.
// ============================================================
app.get('/api/items', async (req, res) => {
  try {
    // Supabase permite hacer joins embebidos usando la sintaxis "tabla(columnas)"
    const { data, error } = await supabase
      .from('libros')
      .select(`
        id,
        nombre,
        descripcion,
        precio,
        nota_promedio,
        imagen_url,
        paginas,
        idioma,
        tipo_tapa,
        editorial,
        codigo_producto,
        año_publicacion,
        autor:autor_id ( id, nombre )
      `)
      .order('id', { ascending: false });

    if (error) {
      console.error('❌ Error consultando libros:', error.message);
      return res.status(500).json({ error: 'Error consultando la base de datos.' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Error general en GET /api/items:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ============================================================
// INICIAR EL SERVIDOR
// ============================================================
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  🚀 API Bhook escuchando en http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════════');
  console.log(`  GET  /api/items  → lista los libros almacenados`);
  console.log(`  POST /api/items  → guarda libros desde el scraper`);
  console.log('═══════════════════════════════════════════════════');
  console.log('');
});
