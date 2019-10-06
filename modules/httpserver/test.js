/**
 * ---------------------------------------------------------------------------------------------------
 * This software is licensed under the GNU LESSER GENERAL PUBLIC LICENSE Version 3. It is furnished
 * "as is", without any support, and with no warranty, express or implied, as to its usefulness for
 * any purpose.
 *
 * File:        test.js
 * Purpouse:    test file for shutdown
 *
 * Author:      Volker Böhm
 * Copyright:   Volker Böhm
 * Version:     1.0
 * ---------------------------------------------------------------------------------------------------
 */

const HttpServer = require('./httpserver');
const shutdown = require('@mangar2/shutdown');

server = new HttpServer(9001);

server.on('put', (payload, headers, path, res) => {
    console.log('put received');
    console.log(payload);
    console.log(headers);
    console.log(path);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("put");
});

server.on('get', (payload, headers, path, res) => {
    console.log('get received');
    console.log(payload);
    console.log(headers);
    console.log(path);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("get");
});

server.on('post', (payload, headers, path, res) => {
    console.log('post received');
    console.log(payload);
    console.log(headers);
    console.log(path);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("post");
});

server.on('delete', (payload, headers, path, res) => {
    console.log('put received');
    console.log(payload);
    console.log(headers);
    console.log(path);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("delete");
});

server.on('patch', (payload, headers, path, res) => {
    console.log('patch received');
    console.log(payload);
    console.log(headers);
    console.log(path);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("put");
});

server.createServer();

shutdown(async () => {
    await server.close();
    process.exit(0);
});





