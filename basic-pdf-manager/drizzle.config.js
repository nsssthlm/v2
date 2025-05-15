require('dotenv').config();

module.exports = {
  schema: './db/schema.js',
  out: './db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
};