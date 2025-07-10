const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket relay running on ws://localhost:8080');

wss.on('connection', function connection(ws) {
  console.log('Client connected');
  
  ws.on('message', function incoming(data) {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message:', message);
      
      if (message.circleId) {
        // Set the circle ID for this client
        ws.circleId = message.circleId;
        console.log(`Client joined circle: ${message.circleId}`);
      }
      
      if (message.message) {
        // Broadcast the message to all clients in the same circle
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN && client.circleId === message.circleId) {
            console.log(`Broadcasting message to circle ${message.circleId}`);
            client.send(JSON.stringify(message.message));
          }
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('close', function close() {
    console.log('Client disconnected');
  });
  
  ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
  });
}); 