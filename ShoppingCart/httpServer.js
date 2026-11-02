import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const cart = [
  { id: 1, productName: 'Wireless Mouse', price: 799, quantity: 2 },
  { id: 2, productName: 'Keyboard', price: 1299, quantity: 1 }
];

const sendJSON = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const sendHTML = (res, status, html) => {
  res.writeHead(status, { 'Content-Type': 'text/html' });
  res.end(html);
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // GET routes
  if (method === 'GET') {
    if (url === '/') {
      return sendHTML(res, 200, '<h1>Welcome to Shopping Cart Application</h1>');
    }
    if (url === '/cart') {
      return sendJSON(res, 200, cart);
    }
    if (url === '/about') {
      return sendJSON(res, 200, {
        app: 'Shopping Cart Management',
        tech: 'Node.js HTTP Module',
        version: '1.0.0'
      });
    }
    if (url === '/home') {
      const filePath = path.join(__dirname, 'public', 'index.html');
      return fs.readFile(filePath, (err, data) => {
        if (err) return sendHTML(res, 500, '<h1>500 - Error reading file</h1>');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    }
  }

  // POST /add-to-cart
  if (method === 'POST' && url === '/add-to-cart') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      let product;
      try {
        product = JSON.parse(body);
      } catch {
        return sendJSON(res, 400, { error: 'Invalid JSON' });
      }

      const { id, productName, price, quantity } = product;
      if (id == null || !productName || price == null || quantity == null) {
        return sendJSON(res, 400, {
          error: 'id, productName, price and quantity are required'
        });
      }
      if (cart.some(item => item.id === id)) {
        return sendJSON(res, 409, { error: 'Product with this id already exists' });
      }

      cart.push({ id, productName, price, quantity });
      sendJSON(res, 201, { message: 'Product added to cart', product: { id, productName, price, quantity } });
    });
    return;
  }

  // Everything else -> 404
  sendJSON(res, 404, { error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
