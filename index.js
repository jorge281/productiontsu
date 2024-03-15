const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const options = {
  key: fs.readFileSync('path/to/server-key.pem'),
  cert: fs.readFileSync('path/to/server-cert.pem'),
};

app.prepare().then(() => {
  const server = express();

  // Configura tus rutas y middleware aquí

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Redirige las solicitudes HTTP a HTTPS
  server.use((req, res, next) => {
    if (!req.secure && process.env.NODE_ENV === 'production') {
      return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
  });

  // Crea servidores HTTP y HTTPS separados
  http.createServer((req, res) => {
    res.writeHead(301, { 'Location': 'https://' + req.headers['host'] + req.url });
    res.end();
  }).listen(80);

  https.createServer(options, server).listen(443, () => {
    console.log('Servidor Next.js con HTTPS iniciado en https://localhost:443');
  });
});