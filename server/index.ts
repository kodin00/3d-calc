import express from 'express';
import { getPresets, savePreset, deletePreset, getSetting, setSetting, getFilaments, addFilament, updateFilament, deleteFilament, getProductsWithFilament, addProduct, updateProduct, deleteProduct, printProduct, clearAllProducts } from '../src/db/actions.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());

app.get('/api/presets', async (_req, res) => { res.json(await getPresets()); });
app.post('/api/presets', async (req, res) => {
  const { name, inputs } = req.body;
  res.json({ id: await savePreset(name, inputs) });
});
app.delete('/api/presets/:id', async (req, res) => {
  await deletePreset(req.params.id); res.json({ ok: true });
});
app.get('/api/settings/:key', async (req, res) => {
  res.json({ value: await getSetting(req.params.key) });
});
app.put('/api/settings/:key', async (req, res) => {
  await setSetting(req.params.key, req.body.value); res.json({ ok: true });
});

// Filament routes
app.get('/api/filaments', async (_req, res) => { res.json(await getFilaments()); });
app.post('/api/filaments', async (req, res) => {
  res.json({ id: await addFilament(req.body) });
});
app.put('/api/filaments/:id', async (req, res) => {
  await updateFilament(req.params.id, req.body);
  res.json({ ok: true });
});
app.delete('/api/filaments/:id', async (req, res) => {
  await deleteFilament(req.params.id);
  res.json({ ok: true });
});

// Product routes
app.get('/api/products', async (_req, res) => { res.json(await getProductsWithFilament()); });
app.post('/api/products', async (req, res) => {
  const { name, gramsUsed, printHours, sellingPrice, pricePerGram } = req.body;
  // Validate required fields
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (typeof gramsUsed !== 'number' || gramsUsed <= 0) {
    return res.status(400).json({ error: 'gramsUsed must be a positive number' });
  }
  if (typeof printHours !== 'number' || printHours <= 0) {
    return res.status(400).json({ error: 'printHours must be a positive number' });
  }
  if (typeof sellingPrice !== 'number' || sellingPrice <= 0) {
    return res.status(400).json({ error: 'sellingPrice must be a positive number' });
  }
  try {
    res.json({ id: await addProduct(req.body) });
  } catch (err) {
    console.error('Failed to create product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});
app.put('/api/products/:id', async (req, res) => {
  const { gramsUsed, printHours, sellingPrice } = req.body;
  // Validate numeric fields if present
  if (gramsUsed !== undefined && (typeof gramsUsed !== 'number' || gramsUsed <= 0)) {
    return res.status(400).json({ error: 'gramsUsed must be a positive number' });
  }
  if (printHours !== undefined && (typeof printHours !== 'number' || printHours <= 0)) {
    return res.status(400).json({ error: 'printHours must be a positive number' });
  }
  if (sellingPrice !== undefined && (typeof sellingPrice !== 'number' || sellingPrice <= 0)) {
    return res.status(400).json({ error: 'sellingPrice must be a positive number' });
  }
  try {
    await updateProduct(req.params.id, req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to update product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});
app.delete('/api/products/:id', async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Clear all products
app.delete('/api/products', async (_req, res) => {
  try {
    await clearAllProducts();
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to clear products:', err);
    res.status(500).json({ error: 'Failed to clear products' });
  }
});

// Print product - deduct filament weight
app.post('/api/products/:id/print', async (req, res) => {
  try {
    const result = await printProduct(req.params.id);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to print product';
    console.error('Failed to print product:', err);
    res.status(400).json({ error: message });
  }
});

// Production: serve Vite build + SPA fallback
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dist = path.resolve(__dirname, '../dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(3001, () => console.log('API on http://localhost:3001'));
