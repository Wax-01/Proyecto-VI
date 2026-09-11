// ============================================================
// api/_lib/supabase.js — Lógica compartida de acceso a Supabase
// Usada tanto por el servidor Express local (server.js) como por
// la función serverless de Vercel (api/items.js) para no duplicar
// las reglas de negocio en dos runtimes distintos.
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    'Faltan las variables VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en el entorno.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Convierte un string de precio como "$139.000" a un entero (139000).
 * Si el valor ya es un número, lo retorna directamente.
 * @param {string|number} precioRaw
 * @returns {number}
 */
export function parsearPrecio(precioRaw) {
  if (typeof precioRaw === 'number') return precioRaw;
  if (!precioRaw) return 0;

  const limpio = String(precioRaw).replace(/[$\s.]/g, '');
  const numero = parseInt(limpio, 10);
  return isNaN(numero) ? 0 : numero;
}

/**
 * Busca un autor por nombre en la tabla 'autor'.
 * Si no existe, lo crea y retorna su id.
 * @param {string} nombreAutor
 * @returns {Promise<number|null>}
 */
export async function obtenerOCrearAutor(nombreAutor) {
  if (!nombreAutor || nombreAutor.trim() === '') return null;

  const nombreLimpio = nombreAutor.trim();

  const { data: autorExistente, error: errorBusqueda } = await supabase
    .from('autor')
    .select('id')
    .eq('nombre', nombreLimpio)
    .maybeSingle();

  if (errorBusqueda) {
    console.error('Error buscando autor:', errorBusqueda.message);
    return null;
  }

  if (autorExistente) {
    return autorExistente.id;
  }

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

/**
 * Consulta la tabla "libros" con JOIN a "autor", ordenados por id descendente.
 */
export async function listarLibros() {
  return supabase
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
      nombres_alternativos,
      autor:autor_id ( id, nombre )
    `)
    .order('id', { ascending: false });
}

/**
 * Inserta un array de libros crudos (formato del scraper), resolviendo
 * autor y parseando precio/año por cada uno.
 * @param {any[]} librosRaw
 * @returns {Promise<{insertados: number, errores: {nombre: string, error: string}[]}>}
 */
export async function insertarLibros(librosRaw) {
  let insertados = 0;
  const errores = [];

  for (const libroRaw of librosRaw) {
    try {
      const autorId = await obtenerOCrearAutor(libroRaw.autor);

      let anioPublicacion = null;
      if (libroRaw.anio_edicion) {
        const anio = parseInt(String(libroRaw.anio_edicion), 10);
        anioPublicacion = isNaN(anio) ? null : anio;
      }

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

      const { error: errorInsert } = await supabase.from('libros').insert(libroParaInsertar);

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

  return { insertados, errores };
}
