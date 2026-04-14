require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ══════════════════════════════════════════════════════════════════════════════
//  AUTO
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/auto — список всіх авто з деталями
app.get("/api/auto", async (req, res) => {
  try {
    const autos = await prisma.auto.findMany({
      include: {
        color: true,
        sto: true,
        user: true,
        remont: {
          orderBy: { timestart: "desc" },
          take: 1,
        },
      },
      orderBy: { number_avto: "desc" },
    });
    res.json(autos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка отримання списку авто" });
  }
});

// GET /api/auto/:id — одне авто
app.get("/api/auto/:id", async (req, res) => {
  try {
    const auto = await prisma.auto.findUnique({
      where: { number_avto: parseInt(req.params.id) },
      include: { color: true, sto: true, user: true, remont: true },
    });
    if (!auto) return res.status(404).json({ error: "Авто не знайдено" });
    res.json(auto);
  } catch (err) {
    res.status(500).json({ error: "Помилка отримання авто" });
  }
});

// POST /api/auto — додати нове авто
app.post("/api/auto", async (req, res) => {
  try {
    const { color_id, id_STO, mark, VIN_code, photo, id_vod } = req.body;

    if (!mark || !VIN_code || !color_id || !id_STO || !id_vod) {
      return res.status(400).json({ error: "Заповніть всі обов'язкові поля" });
    }

    const newAuto = await prisma.auto.create({
      data: {
        color_id: parseInt(color_id),
        id_STO: parseInt(id_STO),
        mark,
        VIN_code,
        photo: photo || null,
        id_vod: parseInt(id_vod),
      },
    });
    res.status(201).json(newAuto);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Авто з таким VIN-кодом вже існує" });
    }
    console.error(err);
    res.status(500).json({ error: "Помилка створення авто" });
  }
});

// PUT /api/auto/:id — оновити авто
app.put("/api/auto/:id", async (req, res) => {
  try {
    const updated = await prisma.auto.update({
      where: { number_avto: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Помилка оновлення авто" });
  }
});

// DELETE /api/auto/:id
app.delete("/api/auto/:id", async (req, res) => {
  try {
    await prisma.auto.delete({ where: { number_avto: parseInt(req.params.id) } });
    res.json({ message: "Авто видалено" });
  } catch (err) {
    res.status(500).json({ error: "Помилка видалення авто" });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  REMONT
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/remont — всі ремонти (активні + архів)
app.get("/api/remont", async (req, res) => {
  try {
    const { active } = req.query; // ?active=true — тільки активні
    const where = active === "true" ? { dataend: null } : {};

    const remont = await prisma.remont.findMany({
      where,
      include: {
        auto: { include: { user: true, sto: true } },
        machenist: true,
        zap_part: true,
      },
      orderBy: { timestart: "desc" },
    });
    res.json(remont);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка отримання ремонтів" });
  }
});

// GET /api/remont/:id
app.get("/api/remont/:id", async (req, res) => {
  try {
    const rem = await prisma.remont.findUnique({
      where: { id_rem: parseInt(req.params.id) },
      include: { auto: true, machenist: true, zap_part: true, user: true },
    });
    if (!rem) return res.status(404).json({ error: "Ремонт не знайдено" });
    res.json(rem);
  } catch (err) {
    res.status(500).json({ error: "Помилка отримання ремонту" });
  }
});

// POST /api/remont — створити запис про ремонт
app.post("/api/remont", async (req, res) => {
  try {
    const {
      id_Avto, desciption, price, timestart, dataend,
      Id_mech, id_zapch, zap, id_vod,
    } = req.body;

    if (!id_Avto || !Id_mech || !id_vod) {
      return res.status(400).json({ error: "id_Avto, Id_mech та id_vod є обов'язковими" });
    }

    const newRemont = await prisma.remont.create({
      data: {
        id_Avto: parseInt(id_Avto),
        desciption: desciption || null,
        price: parseFloat(price) || 0,
        timestart: timestart ? new Date(timestart) : new Date(),
        dataend: dataend ? new Date(dataend) : null,
        Id_mech: parseInt(Id_mech),
        id_zapch: id_zapch ? parseInt(id_zapch) : null,
        zap: zap ? parseInt(zap) : null,
        id_vod: parseInt(id_vod),
      },
      include: { auto: true, machenist: true },
    });
    res.status(201).json(newRemont);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка створення ремонту" });
  }
});

// PUT /api/remont/:id — завершити / оновити ремонт
app.put("/api/remont/:id", async (req, res) => {
  try {
    const updated = await prisma.remont.update({
      where: { id_rem: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Помилка оновлення ремонту" });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ДОВІДНИКИ (для форм)
// ══════════════════════════════════════════════════════════════════════════════

app.get("/api/sto",       async (_, res) => res.json(await prisma.sTO.findMany()));
app.get("/api/machenist", async (_, res) => res.json(await prisma.machenist.findMany()));
app.get("/api/colors",    async (_, res) => res.json(await prisma.color_auto.findMany()));
app.get("/api/users",     async (_, res) => res.json(await prisma.user.findMany()));
app.get("/api/zap",       async (_, res) => res.json(await prisma.zap.findMany({ include: { country: true, company: true } })));

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
