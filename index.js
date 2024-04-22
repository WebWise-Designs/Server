require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

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
    text VARCHAR(255) NOT NULL
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
app.set('views', __dirname + '/views');

// Middleware
app.use(express.static(__dirname)); // Serve static files from the root directory
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
  db.query('SELECT * FROM jokes', (err, results) => {
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
