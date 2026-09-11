// ============================================================
// api/items.js — Función serverless de Vercel para /api/items
// Equivalente a los endpoints GET/POST de server.js, pero corriendo
// como función Node individual (sin servidor Express persistente).
// ============================================================

import { listarLibros, insertarLibros } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await listarLibros();

      if (error) {
        console.error('❌ Error consultando libros:', error.message);
        return res.status(500).json({ error: 'Error consultando la base de datos.' });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('❌ Error general en GET /api/items:', error.message);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const librosRaw = req.body?.libros;

      if (!Array.isArray(librosRaw) || librosRaw.length === 0) {
        return res.status(400).json({
          error: 'El payload debe contener un array "libros" con al menos un elemento.',
        });
      }

      console.log(`📥 Recibidos ${librosRaw.length} libros de la fuente "${req.body?.fuente || 'desconocida'}"`);

      const { insertados, errores } = await insertarLibros(librosRaw);

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
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Método ${req.method} no permitido.` });
}
