import http from 'http';
import app from './server.mjs';

const server = http.createServer(app);
server.listen(3000);