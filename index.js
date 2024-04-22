const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 80; // Set the port to 80

// Define admin credentials (replace these with your actual credentials)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password';

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');

  // Create jokes table if it doesn't exist
  db.query(`CREATE TABLE IF NOT EXISTS jokes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    approved BOOLEAN DEFAULT false
  )`, (err) => {
    if (err) {
      console.error('Error creating jokes table:', err);
      return;
    }
    console.log('Jokes table created successfully');
  });
});

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '')); // Set views directory to the root directory

// Middleware
app.use(express.static(path.join(__dirname, ''))); // Serve static files from the root directory
app.use(bodyParser.urlencoded({ extended: false }));

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    next(); // Proceed to the next middleware/route handler
  } else {
    res.status(401).send('Unauthorized'); // Unauthorized status code
  }
};

// Routes
app.get('/', (req, res) => {
  db.query('SELECT * FROM jokes WHERE approved = true', (err, results) => {
    if (err) {
      console.error('Error fetching jokes:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.render('index', { jokes: results });
  });
});

app.post('/submit', (req, res) => {
  const joke = req.body.joke;
  if (!joke) {
    res.redirect('/');
    return;
  }
  db.query('INSERT INTO jokes (text) VALUES (?)', [joke], (err, result) => {
    if (err) {
      console.error('Error submitting joke:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.redirect('/');
  });
});

app.get('/admin', (req, res) => {
  db.query('SELECT * FROM jokes WHERE approved = false', (err, results) => {
    if (err) {
      console.error('Error fetching pending jokes:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.render('admin', { jokes: results });
  });
});

app.post('/approve', authenticateAdmin, (req, res) => {
  const jokeId = req.body.id;
  db.query('UPDATE jokes SET approved = true WHERE id = ?', [jokeId], (err, result) => {
    if (err) {
      console.error('Error approving joke:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.redirect('/admin');
  });
});

app.post('/deny', authenticateAdmin, (req, res) => {
  const jokeId = req.body.id;
  db.query('DELETE FROM jokes WHERE id = ?', [jokeId], (err, result) => {
    if (err) {
      console.error('Error denying joke:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.redirect('/admin');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
