import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("wanderai.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'user',
    bio TEXT,
    avatar TEXT,
    isPublic INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    image TEXT,
    rating REAL,
    price TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS itineraries (
    id TEXT PRIMARY KEY,
    userId TEXT,
    location TEXT,
    text TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (id, name, email, role, bio, avatar, isPublic) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run("admin-1", "Main Admin", "asimbyans@gmail.com", "admin", "System Administrator", "https://picsum.photos/seed/admin/100/100", 0);
  
  const locations = [
    { id: '1', name: 'Santorini, Greece', description: 'Stunning sunsets and white-washed buildings.', image: 'https://picsum.photos/seed/santorini/800/600', rating: 4.9, price: '$$$', category: 'Beach' },
    { id: '2', name: 'Kyoto, Japan', description: 'Ancient temples and beautiful cherry blossoms.', image: 'https://picsum.photos/seed/kyoto/800/600', rating: 4.8, price: '$$', category: 'Culture' },
    { id: '3', name: 'Swiss Alps, Switzerland', description: 'Breathtaking mountain views and world-class skiing.', image: 'https://picsum.photos/seed/alps/800/600', rating: 4.9, price: '$$$$', category: 'Adventure' },
    { id: '4', name: 'Machu Picchu, Peru', description: 'Incan citadel set high in the Andes Mountains.', image: 'https://picsum.photos/seed/peru/800/600', rating: 4.7, price: '$$', category: 'History' },
    { id: '5', name: 'Bali, Indonesia', description: 'Tropical paradise with lush jungles and beaches.', image: 'https://picsum.photos/seed/bali/800/600', rating: 4.6, price: '$', category: 'Relax' },
    { id: '6', name: 'Reykjavik, Iceland', description: 'Land of fire and ice with stunning natural wonders.', image: 'https://picsum.photos/seed/iceland/800/600', rating: 4.8, price: '$$$', category: 'Nature' },
  ];

  const insertLocation = db.prepare("INSERT INTO locations (id, name, description, image, rating, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)");
  locations.forEach(loc => insertLocation.run(loc.id, loc.name, loc.description, loc.image, loc.rating, loc.price, loc.category));
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  });

  app.get("/api/locations", (req, res) => {
    const locations = db.prepare("SELECT * FROM locations").all();
    res.json(locations);
  });

  app.post("/api/locations", (req, res) => {
    const { name, description, image, rating, price, category } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare("INSERT INTO locations (id, name, description, image, rating, price, category) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, description, image, rating, price, category);
    res.json({ id, name, description, image, rating, price, category });
  });

  app.delete("/api/locations/:id", (req, res) => {
    db.prepare("DELETE FROM locations WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.put("/api/locations/:id", (req, res) => {
    const { name, description, image, rating, price, category } = req.body;
    db.prepare("UPDATE locations SET name = ?, description = ?, image = ?, rating = ?, price = ?, category = ? WHERE id = ?")
      .run(name, description, image, rating, price, category, req.params.id);
    res.json({ id: req.params.id, name, description, image, rating, price, category });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
