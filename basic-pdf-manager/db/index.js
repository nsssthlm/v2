const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./schema');
const dotenv = require('dotenv');

// Ladda miljövariabler från .env-filen
dotenv.config();

// Se till att databasens URL finns
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL saknas i miljövariablerna');
}

// Skapa en pool av databasanslutningar
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
});

// Skapa en Drizzle-instans kopplad till databasen
const db = drizzle(pool, { schema });

module.exports = {
  db,
  schema,
  pool
};