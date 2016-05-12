import app from './config/express';

app.listen(3000, () => {
  console.log('server started on port 3000');
});

// http.createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('Hello World\n');
// }).listen(1337, '127.0.0.1');

export default app;
