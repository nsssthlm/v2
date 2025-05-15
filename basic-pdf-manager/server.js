const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');
const bodyParser = require('body-parser');
const { db, schema } = require('./db');
const { eq } = require('drizzle-orm');

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
  { id: 1, username: 'user@example.com', password: 'password', name: 'Project Leader' }
];

// Simulera mapp-struktur (ersätts senare med databas)
let folders = [
  {
    id: 1,
    name: "Huvudmapp",
    description: "Standardmapp för PDF-dokument",
    parentId: null,
    createdAt: '2025-05-15T10:00:00Z',
    updatedAt: '2025-05-15T10:00:00Z',
  },
  {
    id: 2,
    name: "Projekt A",
    description: "PDF:er för Projekt A",
    parentId: 1,
    createdAt: '2025-05-15T10:05:00Z',
    updatedAt: '2025-05-15T10:05:00Z',
  },
  {
    id: 3,
    name: "Projekt B",
    description: "PDF:er för Projekt B",
    parentId: 1,
    createdAt: '2025-05-15T10:10:00Z',
    updatedAt: '2025-05-15T10:10:00Z',
  }
];

// In-memory PDF storage (ersätts senare med databas)
let pdfFiles = [
  {
    id: 'pdf_example_1',           // Unikt ID för PDF:en
    filename: 'AAAAExempel på ritningar.pdf',
    originalFilename: 'example1.pdf',
    storedFilename: 'example1.pdf',
    fileUrl: '/uploads/example1.pdf',
    size: 1500000,
    uploadedAt: '2025-05-13T12:17:00Z',
    uploadedBy: 'projectleader',
    folderId: 2,                   // Koppling till specifik mapp (Projekt A)
    description: 'Ingen beskrivning',
    versionNumber: 1               // Versionsnummer för dokumentet
  },
  {
    id: 'pdf_example_2',
    filename: 'AAAAExempel på ritningar.pdf',
    originalFilename: 'example2.pdf',
    storedFilename: 'example2.pdf',
    fileUrl: '/uploads/example2.pdf',
    size: 1200000,
    uploadedAt: '2025-05-13T11:50:00Z',
    uploadedBy: 'projectleader',
    folderId: 2,                   // Koppling till specifik mapp (Projekt A)
    description: 'Ingen beskrivning',
    versionNumber: 1
  },
  {
    id: 'pdf_example_3',
    filename: 'BEAst-PDF-Guidelines-2.0 (1).pdf',
    originalFilename: 'example3.pdf',
    storedFilename: 'example3.pdf',
    fileUrl: '/uploads/example3.pdf',
    size: 950000,
    uploadedAt: '2025-05-13T11:50:00Z',
    uploadedBy: 'projectleader',
    folderId: 3,                   // Koppling till specifik mapp (Projekt B)
    description: 'Ingen beskrivning',
    versionNumber: 1
  },
  {
    id: 'pdf_example_4',
    filename: 'BEAst-PDF-Guidelines-2.0 (1).pdf',
    originalFilename: 'example4.pdf',
    storedFilename: 'example4.pdf',
    fileUrl: '/uploads/example4.pdf',
    size: 890000,
    uploadedAt: '2025-05-13T11:42:00Z',
    uploadedBy: 'projectleader',
    folderId: 3,                   // Koppling till specifik mapp (Projekt B)
    description: 'Ingen beskrivning',
    versionNumber: 1
  },
  {
    id: 'pdf_example_5',
    filename: 'AAAAExempel på ritningar.pdf',
    originalFilename: 'example5.pdf',
    storedFilename: 'example5.pdf',
    fileUrl: '/uploads/example5.pdf',
    size: 1050000,
    uploadedAt: '2025-05-13T11:40:00Z',
    uploadedBy: 'projectleader',
    folderId: 1,                   // Koppling till huvudmappen
    description: 'Ingen beskrivning',
    versionNumber: 1
  }
];

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

// Check auth status endpoint
app.get('/api/check-auth', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ success: true, user: req.session.user });
  } else {
    res.status(200).json({ success: false, message: 'Inte inloggad' });
  }
});

// Upload PDF file endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Inte inloggad' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Ingen fil uppladdad' });
    }

    // Hämta folder ID från request
    const folderId = req.body.folderId ? parseInt(req.body.folderId) : 1;  // Default till huvudmappen
    
    // Verifiera att mappen existerar
    const folder = folders.find(f => f.id === folderId);
    if (!folder) {
      return res.status(400).json({ success: false, message: 'Angiven mapp existerar inte' });
    }

    // Generera unikt ID för PDF-dokumentet
    const uniqueId = 'pdf_' + Date.now() + '_' + Math.floor(Math.random() * 10000);

    // Skapa PDF-objekt med koppling till mapp via folderId
    const pdfFile = {
      id: uniqueId,
      filename: req.body.title || req.file.originalname.replace('.pdf', ''),
      description: req.body.description || 'Ingen beskrivning',
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      fileUrl: '/uploads/' + req.file.filename,
      size: req.file.size,
      uploadedBy: req.session.user.username,
      uploadedAt: new Date().toISOString(),
      folderId: folderId,               // Koppla till specifik mapp
      versionNumber: 1                  // Första versionen av dokumentet
    };

    // Spara PDF-objektet
    pdfFiles.push(pdfFile);

    res.status(200).json({ success: true, file: pdfFile });
  } catch (error) {
    console.error('Fel vid uppladdning:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Hämta mappstruktur
app.get('/api/folders', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Inte inloggad' });
  }
  
  res.status(200).json({ success: true, folders: folders });
});

// Get PDF list endpoint
app.get('/api/pdfs', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Inte inloggad' });
  }

  const folderId = req.query.folderId ? parseInt(req.query.folderId) : null;
  
  // Filtrera på mapp om angett
  let filteredPdfs;
  if (folderId) {
    // Hämta PDFer i angiven mapp
    filteredPdfs = pdfFiles.filter(pdf => pdf.folderId === folderId);
  } else {
    // Hämta alla PDFer om ingen mapp anges
    filteredPdfs = pdfFiles;
  }

  res.status(200).json({ success: true, pdfs: filteredPdfs });
});

// Get specific PDF endpoint
app.get('/api/pdfs/:id', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Inte inloggad' });
  }

  const pdf = pdfFiles.find(p => p.id === req.params.id);
  
  if (!pdf) {
    return res.status(404).json({ success: false, message: 'PDF hittades inte' });
  }

  res.status(200).json(pdf);
});

// Delete PDF endpoint
app.delete('/api/pdfs/:id', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Inte inloggad' });
  }

  const pdfIndex = pdfFiles.findIndex(p => p.id === req.params.id);
  
  if (pdfIndex === -1) {
    return res.status(404).json({ success: false, message: 'PDF hittades inte' });
  }

  const pdf = pdfFiles[pdfIndex];

  // Ta bort filen från filsystemet
  try {
    const filePath = path.join(uploadsDir, pdf.storedFilename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Fel vid borttagning av fil:', error);
  }

  // Ta bort från arrayen
  pdfFiles.splice(pdfIndex, 1);

  res.status(200).json({ success: true });
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