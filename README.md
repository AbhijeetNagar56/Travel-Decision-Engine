# 🚀 Travel Decision Engine

**Travel Decision Engine** is a **multi-factor decision intelligence system** designed to assist travelers and applications by evaluating countries based on diverse risk and suitability criteria. It combines environmental indicators, health infrastructure, advisories, and user-specified tolerance to give ranked output for informed travel planning.

---

## 📌 Features

✔ Multi-factor scoring for travel decision insights  
✔ Country-level ranking based on risk, health, and environment  
✔ Modular scoring engine with normalization and weighting  
✔ REST API interface for easy integration  
✔ Cache support (Redis) for performance optimization  

---

## 🧠 How It Works

The engine analyzes different factors that influence travel decisions:

### 📊 Scoring Modules
Each country is scored using a multi-factor approach that includes:

- **Risk Score** – Advisory and security risk analysis  
- **Health Score** – Healthcare infrastructure and disease risk  
- **Environmental Score** – Air quality and climate stability  
- **Overall Score** – Weighted aggregate of all factors :contentReference[oaicite:3]{index=3}

These scores are normalized and computed using configurable logic in the scoring engine. :contentReference[oaicite:4]{index=4}

### 🔄 Caching
Responses can be cached using Redis to reduce repeated computation and speed up scoring. :contentReference[oaicite:5]{index=5}



---

## 📦 Requirements

The backend is built using **JavaScript/TypeScript (Node.js)** and depends on:

- Node.js (v14+)
- Express.js
- Redis (optional but recommended)
- External country, advisory, weather, and AQI APIs

See `package.json` for full dependencies. :contentReference[oaicite:7]{index=7}

---

## 🚀 Getting Started

### Clone the repo

```bash
git clone https://github.com/AbhijeetNagar56/Travel-Decision-Engine.git
cd Travel-Decision-Engine
npm install
# or
yarn install
```
```
npm start
```
