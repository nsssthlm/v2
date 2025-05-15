const { drizzle } = require('drizzle-orm/neon-serverless');
const { neon } = require('@neondatabase/serverless');
const schema = require('./schema');
const dotenv = require('dotenv');

// Ladda miljövariabler från .env-filen
dotenv.config();

// Se till att databasens URL finns
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL saknas i miljövariablerna');
}

// Skapa sql-klienten för Neon-databas
const sql = neon(databaseUrl);

// Skapa en Drizzle-instans kopplad till databasen
const db = drizzle(sql, { schema });

// Exportera databas-komponenter för användning i applikationen
module.exports = {
  db,
  schema,
  sql
};