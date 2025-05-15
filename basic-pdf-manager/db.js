/**
 * Databashantering för PDF Manager
 * -----------------------------
 * Detta modul hanterar databasanslutning och modeller med PostgreSQL och pg
 */

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const util = require('util');

// Skapa en anslutningspool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Testa anslutningen
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Databasanslutning misslyckades:', err);
  } else {
    console.log('✅ Databasanslutning etablerad:', res.rows[0].now);
    // Initiera databasen när anslutningen är klar
    initDatabase();
  }
});

/**
 * Initierar databasen med nödvändiga tabeller
 */
async function initDatabase() {
  try {
    // Skapa mappar tabell
    await pool.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        parent_id INTEGER REFERENCES folders(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabellen folders skapad');

    // Skapa PDF-dokument tabell
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pdf_documents (
        id SERIAL PRIMARY KEY,
        unique_id VARCHAR(50) UNIQUE NOT NULL,
        filename VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        file_path VARCHAR(255) NOT NULL,
        description TEXT,
        folder_id INTEGER REFERENCES folders(id),
        version INTEGER DEFAULT 1,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        uploaded_by VARCHAR(100) DEFAULT 'system'
      );
    `);
    console.log('✅ Tabellen pdf_documents skapad');

    // Skapa en rotmapp om den inte redan finns
    const rootFolder = await pool.query(
      'SELECT id FROM folders WHERE name = $1 AND parent_id IS NULL',
      ['root']
    );

    if (rootFolder.rows.length === 0) {
      await pool.query(
        'INSERT INTO folders (name, description) VALUES ($1, $2)',
        ['root', 'Rotmappen för alla PDF-dokument']
      );
      console.log('✅ Rotmapp skapad');
    }
  } catch (error) {
    console.error('❌ Fel vid initiering av databas:', error);
  }
}

/**
 * Hämtar alla mappar
 */
async function getFolders() {
  try {
    const result = await pool.query('SELECT * FROM folders ORDER BY name');
    return result.rows;
  } catch (error) {
    console.error('Fel vid hämtning av mappar:', error);
    throw error;
  }
}

/**
 * Skapar en ny mapp
 */
async function createFolder(name, description, parentId = null) {
  try {
    const result = await pool.query(
      'INSERT INTO folders (name, description, parent_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, parentId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Fel vid skapande av mapp:', error);
    throw error;
  }
}

/**
 * Sparar en PDF-fil i databasen
 */
async function savePdf(pdfData) {
  try {
    const { uniqueId, filename, displayName, filePath, description, folderId, version, uploadedBy } = pdfData;
    
    const result = await pool.query(
      `INSERT INTO pdf_documents 
       (unique_id, filename, display_name, file_path, description, folder_id, version, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [uniqueId, filename, displayName || filename, filePath, description, folderId, version || 1, uploadedBy || 'system']
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Fel vid sparande av PDF:', error);
    throw error;
  }
}

/**
 * Hämtar alla PDF-filer
 * @param {Number} folderId - Om angiven, hämtas endast filer i den angivna mappen
 */
async function getPdfs(folderId = null) {
  try {
    let query, params;
    
    if (folderId === null) {
      query = 'SELECT * FROM pdf_documents ORDER BY uploaded_at DESC';
      params = [];
    } else {
      query = 'SELECT * FROM pdf_documents WHERE folder_id = $1 ORDER BY uploaded_at DESC';
      params = [folderId];
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Fel vid hämtning av PDFs:', error);
    throw error;
  }
}

/**
 * Hämtar en PDF-fil med angivet ID
 */
async function getPdfById(uniqueId) {
  try {
    const result = await pool.query('SELECT * FROM pdf_documents WHERE unique_id = $1', [uniqueId]);
    return result.rows[0];
  } catch (error) {
    console.error('Fel vid hämtning av PDF med ID:', error);
    throw error;
  }
}

/**
 * Tar bort en PDF-fil
 */
async function deletePdf(uniqueId) {
  try {
    // Hämta filvägen först för att kunna ta bort filen från filsystemet
    const fileResult = await pool.query('SELECT file_path FROM pdf_documents WHERE unique_id = $1', [uniqueId]);
    
    if (fileResult.rows.length > 0) {
      const filePath = fileResult.rows[0].file_path;
      const fullPath = path.join(__dirname, filePath);
      
      // Ta bort från databasen
      const result = await pool.query('DELETE FROM pdf_documents WHERE unique_id = $1 RETURNING *', [uniqueId]);
      
      // Försök ta bort filen från filsystemet om den existerar
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`Filen ${fullPath} borttagen från filsystemet`);
        }
      } catch (fileErr) {
        console.error('Fel vid borttagning av fil från filsystemet:', fileErr);
        // Fortsätt ändå, eftersom posten i databasen har tagits bort
      }
      
      return result.rows[0];
    }
    
    return null;
  } catch (error) {
    console.error('Fel vid borttagning av PDF:', error);
    throw error;
  }
}

/**
 * Genererar ett unikt ID för en PDF-fil
 */
function generateUniqueId() {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `pdf_${timestamp}_${randomStr}`;
}

module.exports = {
  pool,
  getFolders,
  createFolder,
  savePdf,
  getPdfs,
  getPdfById,
  deletePdf,
  generateUniqueId
};