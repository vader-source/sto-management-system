require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // Для роботи зі шляхами
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8359;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Роздача фронтенду ────────────────────────────────────────────────────────
// Вказуємо серверу, що зібраний фронтенд лежить у папці "dist"
app.use(express.static(path.join(__dirname, "dist")));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ══════════════════════════════════════════════════════════════════════════════
//  API ROUTES (Твоя логіка залишається без змін)
// ══════════════════════════════════════════════════════════════════════════════

app.get("/api/auto", async (req, res) => {
  try {
    const autos = await prisma.auto.findMany({
      include: { color: true, sto: true, user: true, remont: { orderBy: { timestart: "desc" }, take: 1 } },
      orderBy: { number_avto: "desc" },
    });
    res.json(autos);
  } catch (err) { res.status(500).json({ error: "Помилка сервера" }); }
});

app.post("/api/auto", async (req, res) => {
  try {
    const { color_id, id_STO, mark, VIN_code, photo, id_vod } = req.body;
    const newAuto = await prisma.auto.create({
      data: { color_id: parseInt(color_id), id_STO: parseInt(id_STO), mark, VIN_code, photo, id_vod: parseInt(id_vod) },
    });
    res.status(201).json(newAuto);
  } catch (err) { res.status(500).json({ error: "Помилка створення" }); }
});

app.get("/api/remont", async (req, res) => {
  try {
    const { active } = req.query;
    const where = active === "true" ? { dataend: null } : {};
    const remont = await prisma.remont.findMany({
      where,
      include: { auto: { include: { user: true, sto: true } }, machenist: true, zap_part: true },
      orderBy: { timestart: "desc" },
    });
    res.json(remont);
  } catch (err) { res.status(500).json({ error: "Помилка сервера" }); }
});

// Довідники
app.get("/api/sto",       async (_, res) => res.json(await prisma.sTO.findMany()));
app.get("/api/machenist", async (_, res) => res.json(await prisma.machenist.findMany()));
app.get("/api/colors",    async (_, res) => res.json(await prisma.color_auto.findMany()));
app.get("/api/users",     async (_, res) => res.json(await prisma.user.findMany()));

// ─── Catch-all для React Router ──────────────────────────────────────────────
// Якщо запит не до API і не до файлу — віддаємо головну сторінку
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));