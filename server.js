const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const Semaphore = require('semaphore');

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

const dataSemaphore = Semaphore(1); // Inicia el semáforo con un contador de 1

// Wait function
const wait = async () => {
  return new Promise((resolve) => {
    dataSemaphore.take(() => {
      resolve();
    });
  });
};

// Signal function
const signal = () => {
  dataSemaphore.leave();
};

// Función para manejar excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('Excepción capturada:', err);
  process.exit(1); // Salir del proceso con un código de error
});

// Agregando monitor para monitorear el servidor
console.log('Iniciando monitor...');
setInterval(() => {
  console.log('[Monitor Log]: El servidor está funcionando correctamente');
}, 60000); // Registro cada 1 minuto

io.on('connection', async (socket) => {
  console.log('Cliente conectado');

  try {
    // Envía un mensaje de conexión exitosa al cliente
    socket.emit('connectionSuccess', 'Conexión exitosa al servidor');

    // Enviar datos fijos cada 5 segundos
    const sendFixedData = async () => {
      await wait(); // Esperar a que el semáforo esté disponible
      const fixedData = {
        temperaturaAgua: 25,
        calidadAgua: 85,
        nivelOxigeno: 10,
        cantidadComida: 50,
        nivelPH: 7,
      };

      console.log('Enviando datos fijos al cliente:', fixedData);
      io.emit('sensorData', fixedData);

      signal(); // Liberar el semáforo después de enviar los datos
      
      // Establecer el siguiente envío después de 10 segundos
      setTimeout(sendFixedData, 10000);
    };

    // Inicializar el primer envío después de 10 segundos
    setTimeout(sendFixedData, 10000);

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  } catch (err) {
    console.error('Error en la conexión:', err);
    socket.emit('connectionError', 'Ocurrió un error en la conexión');
    socket.disconnect(true); // Desconectar al cliente en caso de error
  }
});
