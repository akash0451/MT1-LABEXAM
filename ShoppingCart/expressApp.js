import express from 'express';

const app = express();
const PORT = 4000;

app.use(express.json());

let cart = [
  { id: 1, productName: 'Wireless Mouse', price: 799, quantity: 2, category: 'Electronics' },
  { id: 2, productName: 'Notebook', price: 120, quantity: 5, category: 'Stationery' },
  { id: 3, productName: 'Water Bottle', price: 350, quantity: 1, category: 'Lifestyle' }
];

const withTotal = item => ({ ...item, totalPrice: item.price * item.quantity });

const isValid = ({ productName, price, quantity, category }) =>
  productName && category && typeof price === 'number' && typeof quantity === 'number' &&
  price >= 0 && quantity > 0;

// GET all
app.get('/cart', (req, res) => {
  res.json(cart.map(withTotal));
});

// GET by id
app.get('/cart/:id', (req, res) => {
  const item = cart.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Product not found' });
  res.json(withTotal(item));
});

// POST
app.post('/cart', (req, res) => {
  const { id } = req.body;
  if (id == null || !isValid(req.body)) {
    return res.status(400).json({ error: 'id, productName, price, quantity and category are required (valid values)' });
  }
  if (cart.some(i => i.id === id)) {
    return res.status(409).json({ error: 'Product with this id already exists' });
  }
  const { productName, price, quantity, category } = req.body;
  const product = { id, productName, price, quantity, category };
  cart.push(product);
  res.status(201).json({ message: 'Product added successfully', product });
});

// PUT
app.put('/cart/:id', (req, res) => {
  const index = cart.findIndex(i => i.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  if (!isValid(req.body)) {
    return res.status(400).json({ error: 'productName, price, quantity and category are required (valid values)' });
  }
  const { productName, price, quantity, category } = req.body;
  cart[index] = { id: cart[index].id, productName, price, quantity, category };
  res.json({ message: 'Product updated successfully', product: cart[index] });
});

// DELETE
app.delete('/cart/:id', (req, res) => {
  const index = cart.findIndex(i => i.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  const [removed] = cart.splice(index, 1);
  res.json({ message: 'Product removed successfully', product: removed });
});

// Invalid routes
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
