const WebSocket = require('ws');
const http = require('http');

// Use Railway's PORT environment variable or default to 8080
const port = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Handle health check requests
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      connections: wss.clients.size,
      circles: circleConnections.size,
      timestamp: new Date().toISOString()
    }));
  } else if (req.url === '/') {
    // Root endpoint for Railway health checks
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket Relay Server is running');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Create WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

console.log(`🚀 WebSocket relay server starting on port ${port}`);
console.log(`📡 Ready to handle circle chat connections`);

// Store active connections by circle
const circleConnections = new Map();

wss.on('connection', function connection(ws, req) {
  const clientId = Math.random().toString(36).substr(2, 9);
  console.log(`🔌 Client ${clientId} connected from ${req.socket.remoteAddress}`);
  
  ws.on('message', function incoming(data) {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 Received message from ${clientId}:`, message);
      
      if (message.circleId) {
        // Client is joining a circle
        ws.circleId = message.circleId;
        ws.clientId = clientId;
        
        // Add to circle connections
        if (!circleConnections.has(message.circleId)) {
          circleConnections.set(message.circleId, new Set());
        }
        circleConnections.get(message.circleId).add(ws);
        
        console.log(`👥 Client ${clientId} joined circle: ${message.circleId}`);
        console.log(`📊 Active connections in circle ${message.circleId}: ${circleConnections.get(message.circleId).size}`);
      }
      
      if (message.message) {
        // Broadcast message to all clients in the same circle
        const circleId = message.circleId;
        const connections = circleConnections.get(circleId);
        
        if (connections) {
          let broadcastCount = 0;
          connections.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
              client.send(JSON.stringify(message.message));
              broadcastCount++;
            }
          });
          console.log(`📢 Broadcasted message to ${broadcastCount} clients in circle ${circleId}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing message from ${clientId}:`, error);
    }
  });
  
  ws.on('close', function close() {
    console.log(`🔌 Client ${clientId} disconnected`);
    
    // Remove from circle connections
    if (ws.circleId) {
      const connections = circleConnections.get(ws.circleId);
      if (connections) {
        connections.delete(ws);
        console.log(`👥 Client ${clientId} left circle: ${ws.circleId}`);
        console.log(`📊 Remaining connections in circle ${ws.circleId}: ${connections.size}`);
        
        // Clean up empty circles
        if (connections.size === 0) {
          circleConnections.delete(ws.circleId);
          console.log(`🗑️ Removed empty circle: ${ws.circleId}`);
        }
      }
    }
  });
  
  ws.on('error', function error(err) {
    console.error(`❌ WebSocket error for client ${clientId}:`, err);
  });
});

// Start the combined server
server.listen(port, () => {
  console.log(`🎉 WebSocket relay server is ready!`);
  console.log(`📡 WebSocket: ws://localhost:${port}`);
  console.log(`🏥 Health: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
      process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
      process.exit(0);
    });
  });