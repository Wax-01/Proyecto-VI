// ============================================================
// server.js — Servidor Express para desarrollo local
// Expone los mismos endpoints que api/items.js (que se usa en
// producción vía Vercel), reutilizando la lógica de api/_lib/supabase.js.
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { listarLibros, insertarLibros } from './api/_lib/supabase.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ============================================================
// ENDPOINT POST /api/items
// Recibe el payload del scraper de Python, valida la estructura,
// busca/crea autores y ejecuta la inserción masiva en Supabase.
// ============================================================
app.post('/api/items', async (req, res) => {
  try {
    const librosRaw = req.body.libros;

    if (!Array.isArray(librosRaw) || librosRaw.length === 0) {
      return res.status(400).json({
        error: 'El payload debe contener un array "libros" con al menos un elemento.',
      });
    }

    console.log(`📥 Recibidos ${librosRaw.length} libros de la fuente "${req.body.fuente || 'desconocida'}"`);

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
});

// ============================================================
// ENDPOINT GET /api/items
// Consulta la tabla "libros" con JOIN a "autor" para retornar
// el listado completo de registros, ordenados por id descendente.
// ============================================================
app.get('/api/items', async (req, res) => {
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
