import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";

const dbPath = path.resolve(process.cwd(), "database.db");
const db = new Database(dbPath);

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

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
    list_prepared BOOLEAN DEFAULT 0,
    rawdah_added BOOLEAN DEFAULT 0,
    supervisor1_id INTEGER,
    supervisor2_id INTEGER,
    notes TEXT,
    status TEXT DEFAULT 'Draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(supervisor1_id) REFERENCES agents(id),
    FOREIGN KEY(supervisor2_id) REFERENCES agents(id)
  );

  CREATE TABLE IF NOT EXISTS pilgrims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT,
    passport_number TEXT,
    gender TEXT CHECK(gender IN ('Male', 'Female')),
    age_group TEXT CHECK(age_group IN ('Adult', 'Child', 'Infant')),
    agent_id INTEGER,
    trip_id INTEGER,
    visa_type TEXT DEFAULT 'Umrah',
    room_type TEXT,
    room_id TEXT,
    passport_type TEXT CHECK(passport_type IN ('Physical', 'WhatsApp')),
    passport_image_exists BOOLEAN DEFAULT 0,
    passport_image TEXT,
    data_complete BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'Registered',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(agent_id) REFERENCES agents(id),
    FOREIGN KEY(trip_id) REFERENCES trips(id)
  );

  CREATE TABLE IF NOT EXISTS flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER,
    type TEXT DEFAULT 'Outbound',
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

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('Admin', 'User')) DEFAULT 'User',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration helper to add columns if they don't exist
const addColumnIfNotExists = (tableName: string, columnName: string, columnDef: string) => {
  const info = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
  if (!info.find(col => col.name === columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
    console.log(`Added column ${columnName} to table ${tableName}`);
  }
};

// Run migrations
addColumnIfNotExists('trips', 'supervisor1_id', 'INTEGER');
addColumnIfNotExists('trips', 'supervisor2_id', 'INTEGER');
addColumnIfNotExists('trips', 'status', "TEXT DEFAULT 'Draft'");
addColumnIfNotExists('trips', 'list_prepared', "BOOLEAN DEFAULT 0");
addColumnIfNotExists('trips', 'rawdah_added', "BOOLEAN DEFAULT 0");
addColumnIfNotExists('pilgrims', 'phone', 'TEXT');
addColumnIfNotExists('pilgrims', 'passport_number', 'TEXT');
addColumnIfNotExists('pilgrims', 'visa_type', "TEXT DEFAULT 'Umrah'");
addColumnIfNotExists('pilgrims', 'room_type', 'TEXT');
addColumnIfNotExists('pilgrims', 'gender', "TEXT CHECK(gender IN ('Male', 'Female'))");
addColumnIfNotExists('pilgrims', 'age_group', "TEXT CHECK(age_group IN ('Adult', 'Child', 'Infant'))");
addColumnIfNotExists('pilgrims', 'status', "TEXT DEFAULT 'Registered'");
addColumnIfNotExists('pilgrims', 'passport_image', 'TEXT');
addColumnIfNotExists('flights', 'type', "TEXT DEFAULT 'Outbound'");

// Seed Data if empty
const tripCount = db.prepare("SELECT COUNT(*) as count FROM trips").get() as { count: number };
if (tripCount.count === 0) {
  const insertTrip = db.prepare("INSERT INTO trips (name, month_gregorian, month_hijri) VALUES (?, ?, ?)");
  insertTrip.run("رحلة رمضان الأولى", "مارس 2024", "رمضان 1445");
  
  const insertAgent = db.prepare("INSERT INTO agents (name) VALUES (?)");
  insertAgent.run("مندوب القاهرة - أحمد علي");
  insertAgent.run("مندوب الإسكندرية - محمد حسن");

  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run("password", "123456");
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run("language", "ar");
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run("theme", "light");

  const insertUser = db.prepare("INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)");
  insertUser.run("admin", "admin123", "Admin");
  insertUser.run("user", "user123", "User");
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  app.use(express.json());
  const PORT = 3000;

  // Add a simple health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Auth
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT id, username, role FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    }
  });

  // Stats
  app.get("/api/stats", (req, res) => {
    const trips = db.prepare("SELECT COUNT(*) as count FROM trips").get() as any;
    const pilgrims = db.prepare("SELECT COUNT(*) as count FROM pilgrims").get() as any;
    const agents = db.prepare("SELECT COUNT(*) as count FROM agents").get() as any;
    const completedTrips = db.prepare("SELECT COUNT(*) as count FROM trips WHERE visa_issued = 1 AND flight_added = 1 AND barcode_created = 1 AND ids_prepared = 1 AND list_prepared = 1 AND rawdah_added = 1").get() as any;
    const occupiedRooms = db.prepare("SELECT COUNT(DISTINCT room_id) as count FROM pilgrims WHERE room_id IS NOT NULL AND room_id != ''").get() as any;
    
    // Missing data counts
    const missingAgent = db.prepare("SELECT COUNT(*) as count FROM pilgrims WHERE agent_id IS NULL").get() as any;
    const missingRoom = db.prepare("SELECT COUNT(*) as count FROM pilgrims WHERE room_id IS NULL OR room_id = ''").get() as any;
    const missingPassport = db.prepare("SELECT COUNT(*) as count FROM pilgrims WHERE passport_number IS NULL OR passport_number = ''").get() as any;
    const missingTrip = db.prepare("SELECT COUNT(*) as count FROM pilgrims WHERE trip_id IS NULL").get() as any;

    res.json({
      totalTrips: trips.count,
      totalPilgrims: pilgrims.count,
      totalAgents: agents.count,
      completedTrips: completedTrips.count,
      incompleteTrips: trips.count - completedTrips.count,
      occupiedRooms: occupiedRooms.count,
      missingData: {
        agent: missingAgent.count,
        room: missingRoom.count,
        passport: missingPassport.count,
        trip: missingTrip.count
      }
    });
  });

  // Trips
  app.get("/api/trips", (req, res) => {
    const rows = db.prepare(`
      SELECT t.*, 
             a1.name as supervisor1_name, 
             a2.name as supervisor2_name,
             (SELECT COUNT(*) FROM pilgrims WHERE trip_id = t.id) as pilgrim_count,
             (SELECT COUNT(*) FROM pilgrims WHERE trip_id = t.id AND gender = 'Male' AND age_group = 'Adult') as men_count_calc,
             (SELECT COUNT(*) FROM pilgrims WHERE trip_id = t.id AND gender = 'Female' AND age_group = 'Adult') as women_count_calc,
             (SELECT COUNT(*) FROM pilgrims WHERE trip_id = t.id AND age_group = 'Child') as children_count_calc,
             (SELECT COUNT(*) FROM pilgrims WHERE trip_id = t.id AND age_group = 'Infant') as infants_count_calc
      FROM trips t
      LEFT JOIN agents a1 ON t.supervisor1_id = a1.id
      LEFT JOIN agents a2 ON t.supervisor2_id = a2.id
      ORDER BY t.created_at DESC
    `).all();
    
    // Note: Since gender/age isn't a dedicated column yet, we rely on notes or we should add columns.
    // To be professional, let's add gender and age_group columns to pilgrims table.
    res.json(rows);
  });

  app.post("/api/trips", (req, res) => {
    const { name, month_gregorian, month_hijri, supervisor1_id, supervisor2_id, notes } = req.body;
    const info = db.prepare("INSERT INTO trips (name, month_gregorian, month_hijri, supervisor1_id, supervisor2_id, notes) VALUES (?, ?, ?, ?, ?, ?)").run(name, month_gregorian, month_hijri, supervisor1_id, supervisor2_id, notes);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/trips/:id", (req, res) => {
    const { name, month_gregorian, month_hijri, supervisor1_id, supervisor2_id, notes, visa_issued, flight_added, barcode_created, ids_prepared, list_prepared, rawdah_added, status } = req.body;
    db.prepare(`
      UPDATE trips 
      SET name = ?, month_gregorian = ?, month_hijri = ?, supervisor1_id = ?, supervisor2_id = ?, notes = ?, 
          visa_issued = ?, flight_added = ?, barcode_created = ?, ids_prepared = ?, list_prepared = ?, rawdah_added = ?, status = ?
      WHERE id = ?
    `).run(
      name, month_gregorian, month_hijri, supervisor1_id, supervisor2_id, notes, 
      visa_issued ? 1 : 0, flight_added ? 1 : 0, barcode_created ? 1 : 0, ids_prepared ? 1 : 0, list_prepared ? 1 : 0, rawdah_added ? 1 : 0,
      status || 'Draft', req.params.id
    );
    res.json({ success: true });
  });

  app.post("/api/trips/:id/confirm", (req, res) => {
    db.prepare("UPDATE trips SET status = 'Confirmed' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/trips/:id", (req, res) => {
    db.prepare("DELETE FROM pilgrims WHERE trip_id = ?").run(req.params.id);
    db.prepare("DELETE FROM flights WHERE trip_id = ?").run(req.params.id);
    db.prepare("DELETE FROM trips WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/trips/:id", (req, res) => {
    const trip = db.prepare(`
      SELECT t.*, 
             a1.name as supervisor1_name, 
             a2.name as supervisor2_name,
             (SELECT COUNT(*) FROM pilgrims WHERE trip_id = t.id) as pilgrim_count,
             (SELECT COUNT(*) FROM pilgrims WHERE trip_id = t.id AND gender = 'Male' AND age_group = 'Adult') as men_count_calc,
             (SELECT COUNT(*) FROM pilgrims WHERE trip_id = t.id AND gender = 'Female' AND age_group = 'Adult') as women_count_calc,
             (SELECT COUNT(*) FROM pilgrims WHERE trip_id = t.id AND age_group = 'Child') as children_count_calc,
             (SELECT COUNT(*) FROM pilgrims WHERE trip_id = t.id AND age_group = 'Infant') as infants_count_calc
      FROM trips t
      LEFT JOIN agents a1 ON t.supervisor1_id = a1.id
      LEFT JOIN agents a2 ON t.supervisor2_id = a2.id
      WHERE t.id = ?
    `).get(req.params.id);
    const pilgrims = db.prepare("SELECT p.*, a.name as agent_name FROM pilgrims p LEFT JOIN agents a ON p.agent_id = a.id WHERE p.trip_id = ? ORDER BY p.room_id ASC, p.full_name ASC").all(req.params.id);
    const flights = db.prepare("SELECT * FROM flights WHERE trip_id = ?").all(req.params.id);
    res.json({ ...trip as object, pilgrims, flights });
  });

  // Agents
  app.get("/api/agents", (req, res) => {
    const rows = db.prepare(`
      SELECT a.*, (SELECT COUNT(*) FROM pilgrims WHERE agent_id = a.id) as pilgrim_count 
      FROM agents a ORDER BY name ASC
    `).all();
    res.json(rows);
  });

  app.get("/api/agents/:id/pilgrims", (req, res) => {
    const rows = db.prepare(`
      SELECT p.*, t.name as trip_name 
      FROM pilgrims p 
      LEFT JOIN trips t ON p.trip_id = t.id 
      WHERE p.agent_id = ?
      ORDER BY p.created_at DESC
    `).all(req.params.id);
    res.json(rows);
  });

  app.post("/api/agents", (req, res) => {
    const { name, phone } = req.body;
    const info = db.prepare("INSERT INTO agents (name, phone) VALUES (?, ?)").run(name, phone);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/agents/:id", (req, res) => {
    const { name, phone } = req.body;
    db.prepare("UPDATE agents SET name = ?, phone = ? WHERE id = ?").run(name, phone, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/agents/:id", (req, res) => {
    db.prepare("UPDATE pilgrims SET agent_id = NULL WHERE agent_id = ?").run(req.params.id);
    db.prepare("UPDATE trips SET supervisor1_id = NULL WHERE supervisor1_id = ?").run(req.params.id);
    db.prepare("UPDATE trips SET supervisor2_id = NULL WHERE supervisor2_id = ?").run(req.params.id);
    db.prepare("DELETE FROM agents WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Pilgrims
  app.get("/api/pilgrims", (req, res) => {
    const { search, trip_id } = req.query;
    let query = `
      SELECT p.*, t.name as trip_name, a.name as agent_name 
      FROM pilgrims p 
      LEFT JOIN trips t ON p.trip_id = t.id 
      LEFT JOIN agents a ON p.agent_id = a.id
    `;
    let params: any[] = [];
    let conditions: string[] = [];

    if (search) {
      conditions.push("(p.full_name LIKE ? OR p.phone LIKE ? OR a.name LIKE ? OR t.name LIKE ?)");
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    if (trip_id) {
      conditions.push("p.trip_id = ?");
      params.push(trip_id);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    
    query += " ORDER BY p.created_at DESC";
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  });

  app.post("/api/pilgrims", (req, res) => {
    const { full_name, phone, passport_number, gender, age_group, agent_id, trip_id, visa_type, room_type, room_id, passport_type, passport_image_exists, passport_image, data_complete, notes } = req.body;
    
    if (!trip_id) {
      return res.status(400).json({ error: "يجب اختيار رحلة للمعتمر" });
    }

    let finalNotes = notes || "";
    if (visa_type === "Tourism" || visa_type === "Visit") {
      const visaNote = "لديه تأشيرة — لا يحتاج إصدار تأشيرة أو باركود";
      if (!finalNotes.includes(visaNote)) {
        finalNotes = visaNote + (finalNotes ? "\n" + finalNotes : "");
      }
    }

    const info = db.prepare(`
      INSERT INTO pilgrims (full_name, phone, passport_number, gender, age_group, agent_id, trip_id, visa_type, room_type, room_id, passport_type, passport_image_exists, passport_image, data_complete, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(full_name, phone, passport_number, gender, age_group, agent_id, trip_id, visa_type, room_type, room_id, passport_type, passport_image_exists ? 1 : 0, passport_image, data_complete ? 1 : 0, finalNotes);
    
    io.emit("pilgrim_updated", { 
      type: "create", 
      pilgrim: { id: info.lastInsertRowid, full_name, trip_id, room_id } 
    });

    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/pilgrims/:id", (req, res) => {
    const { full_name, phone, passport_number, gender, age_group, agent_id, trip_id, visa_type, room_type, room_id, passport_type, passport_image_exists, passport_image, data_complete, notes, companion_ids, status } = req.body;
    
    let finalNotes = notes || "";
    if (visa_type === "Tourism" || visa_type === "Visit") {
      const visaNote = "لديه تأشيرة — لا يحتاج إصدار تأشيرة أو باركود";
      if (!finalNotes.includes(visaNote)) {
        finalNotes = visaNote + (finalNotes ? "\n" + finalNotes : "");
      }
    }

    const transaction = db.transaction(() => {
      // Get current pilgrim info to know their old room
      const currentPilgrim = db.prepare("SELECT room_id, trip_id FROM pilgrims WHERE id = ?").get(req.params.id) as any;

      // Update the main pilgrim
      db.prepare(`
        UPDATE pilgrims 
        SET full_name = ?, phone = ?, passport_number = ?, gender = ?, age_group = ?, agent_id = ?, trip_id = ?, visa_type = ?, room_type = ?, room_id = ?, passport_type = ?, passport_image_exists = ?, passport_image = ?, data_complete = ?, notes = ?, status = ?
        WHERE id = ?
      `).run(full_name, phone, passport_number, gender, age_group, agent_id, trip_id, visa_type, room_type, room_id, passport_type, passport_image_exists ? 1 : 0, passport_image, data_complete ? 1 : 0, finalNotes, status || 'Registered', req.params.id);

      // Roommate logic
      if (trip_id) {
        // 1. Clear room info for anyone who was in the OLD room (if it changed or was cleared)
        if (currentPilgrim && currentPilgrim.room_id && currentPilgrim.room_id !== room_id) {
          db.prepare("UPDATE pilgrims SET room_id = NULL, room_type = NULL WHERE room_id = ? AND trip_id = ?").run(currentPilgrim.room_id, trip_id);
        }

        // 2. If a NEW room is set, update the selected companions
        if (room_id && room_type && companion_ids && Array.isArray(companion_ids)) {
          // First, clear any existing room info for these specific companions to avoid double assignment
          // Actually, the UI prevents selecting someone in another room, but let's be safe.
          const updateRoommate = db.prepare("UPDATE pilgrims SET room_id = ?, room_type = ? WHERE id = ? AND trip_id = ?");
          for (const companionId of companion_ids) {
            updateRoommate.run(room_id, room_type, companionId, trip_id);
          }
        }
      }
    });

    transaction();
    
    io.emit("pilgrim_updated", { 
      type: "update", 
      pilgrim: { id: req.params.id, full_name, trip_id, room_id, room_type } 
    });

    res.json({ success: true });
  });

  app.post("/api/pilgrims/:id/check-in", (req, res) => {
    db.prepare("UPDATE pilgrims SET status = 'Arrived' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/pilgrims/:id", (req, res) => {
    db.prepare("DELETE FROM pilgrims WHERE id = ?").run(req.params.id);
    io.emit("pilgrim_updated", { type: "delete", id: req.params.id });
    res.json({ success: true });
  });

  app.get("/api/pilgrims/missing/:type", (req, res) => {
    const { type } = req.params;
    let query = `
      SELECT p.*, t.name as trip_name, a.name as agent_name 
      FROM pilgrims p 
      LEFT JOIN trips t ON p.trip_id = t.id 
      LEFT JOIN agents a ON p.agent_id = a.id
    `;
    
    switch (type) {
      case 'agent': query += " WHERE p.agent_id IS NULL"; break;
      case 'room': query += " WHERE p.room_id IS NULL OR p.room_id = ''"; break;
      case 'passport': query += " WHERE p.passport_number IS NULL OR p.passport_number = ''"; break;
      case 'trip': query += " WHERE p.trip_id IS NULL"; break;
      default: return res.status(400).json({ error: "Invalid type" });
    }
    
    const rows = db.prepare(query).all();
    res.json(rows);
  });

  // Flights
  app.get("/api/flights", (req, res) => {
    const rows = db.prepare("SELECT f.*, t.name as trip_name FROM flights f LEFT JOIN trips t ON f.trip_id = t.id ORDER BY f.created_at DESC").all();
    res.json(rows);
  });

  app.post("/api/flights/unified", (req, res) => {
    const { trip_id, outbound, inbound } = req.body;
    
    const deleteExisting = db.prepare("DELETE FROM flights WHERE trip_id = ?");
    const insertFlight = db.prepare(`
      INSERT INTO flights (trip_id, type, raw_text, airline, flight_number, route, departure_date, departure_time, arrival_time, description, reference_code) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      deleteExisting.run(trip_id);
      
      if (outbound) {
        insertFlight.run(
          trip_id, 'Outbound', outbound.raw_text, outbound.airline, outbound.flight_number, 
          outbound.route, outbound.departure_date, outbound.departure_time, 
          outbound.arrival_time, outbound.description, outbound.reference_code
        );
      }
      
      if (inbound) {
        insertFlight.run(
          trip_id, 'Inbound', inbound.raw_text, inbound.airline, inbound.flight_number, 
          inbound.route, inbound.departure_date, inbound.departure_time, 
          inbound.arrival_time, inbound.description, inbound.reference_code
        );
      }

      db.prepare("UPDATE trips SET flight_added = 1 WHERE id = ?").run(trip_id);
    });

    transaction();
    res.json({ success: true });
  });

  app.post("/api/flights", (req, res) => {
    const { trip_id, type, raw_text, airline, flight_number, route, departure_date, departure_time, arrival_time, description, reference_code } = req.body;
    const info = db.prepare(`
      INSERT INTO flights (trip_id, type, raw_text, airline, flight_number, route, departure_date, departure_time, arrival_time, description, reference_code) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(trip_id, type || 'Outbound', raw_text, airline, flight_number, route, departure_date, departure_time, arrival_time, description, reference_code);
    
    db.prepare("UPDATE trips SET flight_added = 1 WHERE id = ?").run(trip_id);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/flights/:id", (req, res) => {
    const { type, raw_text, airline, flight_number, route, departure_date, departure_time, arrival_time, description, reference_code } = req.body;
    db.prepare(`
      UPDATE flights 
      SET type = ?, raw_text = ?, airline = ?, flight_number = ?, route = ?, departure_date = ?, departure_time = ?, arrival_time = ?, description = ?, reference_code = ?
      WHERE id = ?
    `).run(type, raw_text, airline, flight_number, route, departure_date, departure_time, arrival_time, description, reference_code, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/flights/:id", (req, res) => {
    db.prepare("DELETE FROM flights WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Settings
  app.get("/api/settings", (req, res) => {
    const rows = db.prepare("SELECT * FROM settings").all();
    const settings: any = {};
    rows.forEach((row: any) => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  });

  app.post("/api/settings", (req, res) => {
    const { key, value } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
    res.json({ success: true });
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

  app.get("/api/settings/backup", (req, res) => {
    const dbPath = path.resolve(process.cwd(), "database.db");
    res.download(dbPath, `umrah_backup_${new Date().toISOString().split('T')[0]}.db`);
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  }).on('error', (err) => {
    console.error('Server failed to start:', err);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
