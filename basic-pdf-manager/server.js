const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');
const bodyParser = require('body-parser');
const { 
  getFolders, 
  createFolder, 
  savePdf, 
  getPdfs, 
  getPdfById, 
  deletePdf, 
  generateUniqueId 
} = require('./db');

const app = express();
const port = 5001;

// Skapa uploads-mapp om den inte finns
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Konfigurera multer för filuppladdningar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generera unikt filnamn
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    const filename = 'pdf-' + uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Endast PDF-filer tillåts'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'pdf-manager-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 timmar
}));

// Serve static files
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Testanvändare
const users = [
  { id: 1, username: 'user@example.com', password: 'password', name: 'Test User' }
];

// PDF-filer hanteras nu i databasen via db.js

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Spara användarinformation i session
    req.session.user = { id: user.id, username: user.username, name: user.name };
    res.status(200).json({ success: true, user: { username: user.username, name: user.name } });
  } else {
    res.status(401).json({ success: false, message: 'Felaktigt användarnamn eller lösenord' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ success: true });
});

// Get current user endpoint
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).json({ message: 'Inte inloggad' });
  }
});

// Upload PDF file endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Inte inloggad' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Ingen fil uppladdad' });
    }

    // Generera unikt ID för PDF:en
    const uniqueId = generateUniqueId();
    
    // Hämta tillhörande mapp om sådan angivits
    const folderId = req.body.folder && req.body.folder !== 'root' ? req.body.folder : null;
    
    // Skapa PDF-objekt för databasen
    const pdfData = {
      uniqueId,
      filename: req.file.originalname,
      displayName: req.body.title || req.file.originalname.replace('.pdf', ''),
      filePath: '/uploads/' + req.file.filename,
      description: req.body.description || '',
      folderId,
      version: 1,
      uploadedBy: req.session.user.username
    };

    // Spara i databasen
    const savedPdf = await savePdf(pdfData);
    
    // Formattera svar
    const pdfFile = {
      id: savedPdf.unique_id,
      filename: savedPdf.display_name,
      description: savedPdf.description,
      originalFilename: savedPdf.filename,
      fileUrl: savedPdf.file_path,
      uploadedBy: savedPdf.uploaded_by,
      uploadedAt: savedPdf.uploaded_at,
      folder: savedPdf.folder_id || 'root'
    };

    res.status(200).json({ success: true, file: pdfFile });
  } catch (error) {
    console.error('Fel vid uppladdning:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get PDF list endpoint
app.get('/api/pdfs', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Inte inloggad' });
    }

    const folder = req.query.folder || 'root';
    
    // Hämta PDFs från databasen baserat på mappfilter
    let folderId = null;
    if (folder !== 'all' && folder !== 'root') {
      folderId = parseInt(folder);
    }
    
    const pdfs = await getPdfs(folderId);
    
    // Formattera svaret för att matcha tidigare API
    const formattedPdfs = pdfs.map(pdf => ({
      id: pdf.unique_id,
      filename: pdf.display_name,
      description: pdf.description,
      originalFilename: pdf.filename,
      fileUrl: pdf.file_path,
      uploadedBy: pdf.uploaded_by,
      uploadedAt: pdf.uploaded_at,
      folder: pdf.folder_id || 'root'
    }));

    res.status(200).json(formattedPdfs);
  } catch (error) {
    console.error('Fel vid hämtning av PDF-filer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get specific PDF endpoint
app.get('/api/pdfs/:id', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Inte inloggad' });
    }

    const pdfId = req.params.id;
    const pdf = await getPdfById(pdfId);
    
    if (!pdf) {
      return res.status(404).json({ success: false, message: 'PDF hittades inte' });
    }

    // Formattera svaret för att matcha tidigare API
    const formattedPdf = {
      id: pdf.unique_id,
      filename: pdf.display_name,
      description: pdf.description,
      originalFilename: pdf.filename,
      fileUrl: pdf.file_path,
      uploadedBy: pdf.uploaded_by,
      uploadedAt: pdf.uploaded_at,
      folder: pdf.folder_id || 'root'
    };

    res.status(200).json(formattedPdf);
  } catch (error) {
    console.error('Fel vid hämtning av specifik PDF:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete PDF endpoint
app.delete('/api/pdfs/:id', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Inte inloggad' });
    }

    const pdfId = req.params.id;
    const deletedPdf = await deletePdf(pdfId);
    
    if (!deletedPdf) {
      return res.status(404).json({ success: false, message: 'PDF hittades inte' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Fel vid borttagning av PDF:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// === MAPPAR API ===

// Hämta alla mappar
app.get('/api/folders', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Inte inloggad' });
    }
    
    const folders = await getFolders();
    res.status(200).json(folders);
  } catch (error) {
    console.error('Fel vid hämtning av mappar:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Skapa en ny mapp
app.post('/api/folders', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Inte inloggad' });
    }
    
    const { name, description, parentId } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Mappnamn måste anges' });
    }
    
    const folder = await createFolder(name, description, parentId || null);
    res.status(201).json({ success: true, folder });
  } catch (error) {
    console.error('Fel vid skapande av mapp:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Main HTML endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`PDF Manager running at http://0.0.0.0:${port}`);
  console.log(`Öppna PDF-hanteraren i din webbläsare: http://0.0.0.0:${port}/`);
});