const http = require('http');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'productos.json');
const PORT = process.env.PORT || 3000;

function loadProducts() {
  if (!fs.existsSync(DB_FILE)) {
    return [];
  }

  try {
    const text = fs.readFileSync(DB_FILE, { encoding: 'utf8' });
    return JSON.parse(text) || [];
  } catch (error) {
    console.error('Error leyendo la base de datos:', error.message);
    return [];
  }
}

function saveProducts(products) {
  fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2), { encoding: 'utf8' });
}

function normalizeProduct(payload) {
  return {
    id: payload.id || `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    nombre: payload.nombre || payload.name || null,
    precio: payload.precio || payload.price || null,
    precio_lista: payload.precio_lista || payload.list_price || null,
    url: payload.url || null,
    imagen: payload.imagen || payload.image || null,
    created_at: new Date().toISOString(),
  };
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (req.url === '/productos' && req.method === 'GET') {
    const products = loadProducts();
    return sendJson(res, 200, products);
  }

  if (req.url === '/productos' && req.method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.socket.destroy();
      }
    });

    req.on('end', () => {
      let payload;
      try {
        payload = body ? JSON.parse(body) : {};
      } catch (error) {
        return sendJson(res, 400, { error: 'JSON inválido en el cuerpo de la petición.' });
      }

      const products = loadProducts();
      const items = Array.isArray(payload) ? payload : [payload];
      const saved = items.map((item) => {
        const product = normalizeProduct(item);
        products.push(product);
        return product;
      });

      saveProducts(products);
      return sendJson(res, 201, {
        message: 'Productos guardados exitosamente.',
        saved,
      });
    });

    return;
  }

  sendJson(res, 404, { error: 'Ruta no encontrada.' });
});

server.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
  console.log('GET  /productos  -> lista los productos guardados');
  console.log('POST /productos  -> guarda productos desde el webscraping');
});
