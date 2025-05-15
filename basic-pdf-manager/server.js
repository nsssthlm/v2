const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

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

// In-memory PDF storage (ersätts senare med databas)
let pdfFiles = [];

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
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Inte inloggad' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Ingen fil uppladdad' });
    }

    // Skapa PDF-objekt
    const pdfFile = {
      id: Date.now().toString(),
      filename: req.body.title || req.file.originalname.replace('.pdf', ''),
      description: req.body.description || '',
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      fileUrl: '/uploads/' + req.file.filename,
      size: req.file.size,
      uploadedBy: req.session.user.username,
      uploadedAt: new Date().toISOString(),
      folder: req.body.folder || 'root'
    };

    // Spara PDF-objektet
    pdfFiles.push(pdfFile);

    res.status(200).json({ success: true, file: pdfFile });
  } catch (error) {
    console.error('Fel vid uppladdning:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get PDF list endpoint
app.get('/api/pdfs', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Inte inloggad' });
  }

  const folder = req.query.folder || 'root';
  
  // Filtrera på mapp om angett
  const filteredPdfs = folder === 'all' 
    ? pdfFiles 
    : pdfFiles.filter(pdf => pdf.folder === folder);

  res.status(200).json(filteredPdfs);
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
});