// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configura el middleware de CORS para permitir solicitudes desde http://localhost:3000
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Envía un mensaje de conexión exitosa al cliente
  socket.emit('connectionSuccess', 'Conexión exitosa al servidor');

  // Enviar datos fijos cada 5 segundos
  const sendFixedData = () => {
    const fixedData = {
      temperaturaAgua: 25,
      calidadAgua: 85,
      nivelOxigeno: 10,
      cantidadComida: 300,
      nivelPH: 7,
    };

    console.log('Enviando datos fijos al cliente:', fixedData);
    io.emit('sensorData', fixedData);
  };

  setInterval(sendFixedData, 10000); // Enviar cada 5 segundos

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});
