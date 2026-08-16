import express from 'express';
import path from 'path';
import { initDb } from './db';
import { createRoutes } from './routes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');

// initialize db
const db = initDb();

// serve static files
app.use(express.static(CLIENT_DIST));

// parse request body
app.use(express.json());

// define route handlers
app.use('/api', createRoutes(db));

// handler to serve index.html
app.get('/*splat', (req, res) => {
  return res.status(200).sendFile(path.join(CLIENT_DIST, 'index.html'));
});

// start server
app.listen(PORT, () => {
  console.log(`Server running smoothly on http://localhost:${PORT}`);
});
