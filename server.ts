import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.resolve(process.cwd(), "database.db");
const db = new Database(dbPath);

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    month_gregorian TEXT,
    month_hijri TEXT,
    men_count INTEGER DEFAULT 0,
    women_count INTEGER DEFAULT 0,
    children_count INTEGER DEFAULT 0,
    infants_count INTEGER DEFAULT 0,
    visa_issued BOOLEAN DEFAULT 0,
    barcode_created BOOLEAN DEFAULT 0,
    flight_added BOOLEAN DEFAULT 0,
    ids_prepared BOOLEAN DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pilgrims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    agent_id INTEGER,
    trip_id INTEGER,
    passport_type TEXT CHECK(passport_type IN ('Physical', 'WhatsApp')),
    passport_image_exists BOOLEAN DEFAULT 0,
    data_complete BOOLEAN DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(agent_id) REFERENCES agents(id),
    FOREIGN KEY(trip_id) REFERENCES trips(id)
  );

  CREATE TABLE IF NOT EXISTS flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER,
    raw_text TEXT,
    airline TEXT,
    flight_number TEXT,
    route TEXT,
    departure_date TEXT,
    departure_time TEXT,
    arrival_time TEXT,
    description TEXT,
    reference_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(trip_id) REFERENCES trips(id)
  );
`);

// Seed Data if empty
const tripCount = db.prepare("SELECT COUNT(*) as count FROM trips").get() as { count: number };
if (tripCount.count === 0) {
  const insertTrip = db.prepare("INSERT INTO trips (name, month_gregorian, month_hijri) VALUES (?, ?, ?)");
  insertTrip.run("رحلة رمضان الأولى", "مارس 2024", "رمضان 1445");
  
  const insertAgent = db.prepare("INSERT INTO agents (name) VALUES (?)");
  insertAgent.run("مندوب القاهرة - أحمد علي");
  insertAgent.run("مندوب الإسكندرية - محمد حسن");
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.get("/api/stats", (req, res) => {
    const trips = db.prepare("SELECT COUNT(*) as count FROM trips").get() as any;
    const pilgrims = db.prepare("SELECT COUNT(*) as count FROM pilgrims").get() as any;
    const agents = db.prepare("SELECT COUNT(*) as count FROM agents").get() as any;
    const completedTrips = db.prepare("SELECT COUNT(*) as count FROM trips WHERE visa_issued = 1 AND flight_added = 1").get() as any;
    
    res.json({
      totalTrips: trips.count,
      totalPilgrims: pilgrims.count,
      totalAgents: agents.count,
      completedTrips: completedTrips.count,
      incompleteTrips: trips.count - completedTrips.count
    });
  });

  // Trips
  app.get("/api/trips", (req, res) => {
    const rows = db.prepare("SELECT * FROM trips ORDER BY created_at DESC").all();
    res.json(rows);
  });

  app.post("/api/trips", (req, res) => {
    const { name, month_gregorian, month_hijri, notes } = req.body;
    const info = db.prepare("INSERT INTO trips (name, month_gregorian, month_hijri, notes) VALUES (?, ?, ?, ?)").run(name, month_gregorian, month_hijri, notes);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/trips/:id", (req, res) => {
    const trip = db.prepare("SELECT * FROM trips WHERE id = ?").get(req.params.id);
    const pilgrims = db.prepare("SELECT p.*, a.name as agent_name FROM pilgrims p LEFT JOIN agents a ON p.agent_id = a.id WHERE p.trip_id = ?").all(req.params.id);
    res.json({ ...trip as object, pilgrims });
  });

  // Agents
  app.get("/api/agents", (req, res) => {
    const rows = db.prepare(`
      SELECT a.*, (SELECT COUNT(*) FROM pilgrims WHERE agent_id = a.id) as pilgrim_count 
      FROM agents a ORDER BY name ASC
    `).all();
    res.json(rows);
  });

  app.post("/api/agents", (req, res) => {
    const { name } = req.body;
    const info = db.prepare("INSERT INTO agents (name) VALUES (?)").run(name);
    res.json({ id: info.lastInsertRowid });
  });

  // Pilgrims
  app.get("/api/pilgrims", (req, res) => {
    const { search } = req.query;
    let query = "SELECT p.*, t.name as trip_name, a.name as agent_name FROM pilgrims p LEFT JOIN trips t ON p.trip_id = t.id LEFT JOIN agents a ON p.agent_id = a.id";
    let params: any[] = [];
    if (search) {
      query += " WHERE p.full_name LIKE ?";
      params.push(`%${search}%`);
    }
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  });

  app.post("/api/pilgrims", (req, res) => {
    const { full_name, agent_id, trip_id, passport_type, passport_image_exists, data_complete, notes } = req.body;
    const info = db.prepare(`
      INSERT INTO pilgrims (full_name, agent_id, trip_id, passport_type, passport_image_exists, data_complete, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(full_name, agent_id, trip_id, passport_type, passport_image_exists ? 1 : 0, data_complete ? 1 : 0, notes);
    
    // Update trip counts
    // Simplified: just incrementing total is fine for now, or we could recalculate
    res.json({ id: info.lastInsertRowid });
  });

  // Flights
  app.get("/api/flights", (req, res) => {
    const rows = db.prepare("SELECT f.*, t.name as trip_name FROM flights f LEFT JOIN trips t ON f.trip_id = t.id").all();
    res.json(rows);
  });

  app.post("/api/flights", (req, res) => {
    const { trip_id, raw_text, airline, flight_number, route, departure_date, departure_time, arrival_time, description, reference_code } = req.body;
    const info = db.prepare(`
      INSERT INTO flights (trip_id, raw_text, airline, flight_number, route, departure_date, departure_time, arrival_time, description, reference_code) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(trip_id, raw_text, airline, flight_number, route, departure_date, departure_time, arrival_time, description, reference_code);
    
    // Mark trip as flight added
    db.prepare("UPDATE trips SET flight_added = 1 WHERE id = ?").run(trip_id);
    
    res.json({ id: info.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
