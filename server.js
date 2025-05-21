const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./certificados/crmtsu-key.txt'),
  cert: fs.readFileSync('./certificados/crmtsu.txt')
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on https://www.crmtsu.com:3000');
  });
});


/*const next = require('next') 
const http = require('https') 
const fs   = require('fs');
const { serialize } = require('cookie');
const { hostname } = require('os');
const arrayCookies = [];

const app = next({hostname:'www.crmtsu.com',dev: process.env.NODE_ENV !== 'production'}) 
  
var options = {
  key: fs.readFileSync('certificados/crmtsu-key.txt'),
  cert: fs.readFileSync('certificados/crmtsu.txt')
};

app.prepare().then(() => { 
 const server = http.createServer(options,async(req, res) => { 
   // Handle API routes 
   if (req.url.startsWith('/api')) { 
      let data = '';
      req.on('data', chunk => {
        data += chunk; // Convert buffer to string
      });

      req.on('end', async() => {
        if (req.url === '/api/login') {
          data = JSON.parse(data);
          console.log("entro a qui")
          try {
            // Manejar la respuesta exitosa aquí
            const serialized = serialize('tokenLogin',data.token, {
              httpOnly: true,
              secure: process.env.NODE_ENV == 'production',
              sameSite: 'none',
              maxAge: 1000 * 60 * 60 * 24 * 30,
              path: '/'
            })

            arrayCookies.push(serialized);
            res.setHeader('Set-Cookie', serialized);
            // Parsea las cookies de la solicitud actual
            /*const cookies = parse(req.headers.cookie || '');

            // Agrega la cookie al objeto de cookies
            cookies.tokenLogin = serialized;

            // Escribe las cookies en el encabezado de la respuesta
            res.setHeader('Set-Cookie', Object.entries(cookies).map(([key, value]) => serialize(key, value)).join(';'));
            
            cookies().set('tokenLogin', serialized);

            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Bad request' }));
          } catch (error) {
            console.error('Error processing login data:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Bad request' }));
          }
        }
      })
   } else { 
      // Handle Next.js routes 
      return app.getRequestHandler()(req, res) .then(() => {
        const serialized = serialize('tokenLogin','esfdfdf', {
          httpOnly: true,
          secure: process.env.NODE_ENV == 'production',
          sameSite: 'none',
          maxAge: 1000 * 60 * 60 * 24 * 30,
          path: '/'
        })

        res.setHeader('Set-Cookie', serialized);
        res.end();
        console.log("hola entro a qestos");
      }) 
   } 
 }) 
 server.listen(3000, (err) => { 
   if (err) throw err 
   console.log('> Ready on http://localhost:3000') 
 }) 
})*/