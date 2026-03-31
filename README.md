# Easy Billing (MERN Stack)

Simple invoice generator with **MongoDB**, **Express**, **React**, and **Node.js**.

## Prerequisites

- **Node.js** 18+
- **MongoDB** running locally (e.g. [MongoDB Community](https://www.mongodb.com/try/download/community)) or a cloud URI

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file (optional; defaults work for local MongoDB):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/easybilling
```

Start the API:

```bash
npm run dev
```

Server runs at **http://localhost:5000**. API: `GET/POST /api/invoices`, `GET /api/invoices/:id`.

### 2. Frontend (React)

```bash
cd client
npm install
npm run dev
```

App runs at **http://localhost:3000**. It proxies `/api` to the backend.

## Features

- **Create Invoice** – Customer name, date, invoice number, line items, tax, totals. Saves to MongoDB.
- **Invoice History** – Lists all invoices from the database (admin “My Invoices” view).
- **Dashboard** – Links to Create Invoice and View Past Bills.

## Project structure

```
easybilling/
├── backend/          # Node + Express + MongoDB
│   ├── server.js
│   ├── models/Invoice.js
│   └── routes/invoices.js
├── client/           # React (Vite)
│   ├── src/
│   │   ├── api/invoices.js
│   │   ├── components/Layout.jsx
│   │   └── pages/
│   │       ├── CreateInvoice.jsx
│   │       ├── InvoiceHistory.jsx
│   │       └── Dashboard.jsx
│   └── index.html
├── styles/           # Shared CSS (used by React app)
└── html/             # Original static HTML (legacy)
```

## Troubleshooting

- **“Failed to fetch invoices”** – Ensure the backend is running on port 5000 and MongoDB is running.
- **“MongoDB connection error”** – Start MongoDB or set `MONGODB_URI` in `backend/.env` to a valid URI.
