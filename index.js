const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }

      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('404 Not Found');
  }
});

const PORT = 80;

server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
