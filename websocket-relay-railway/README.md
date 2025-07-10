# WebSocket Relay Server for Circle Chat

A WebSocket relay server that handles real-time messaging for circle-based chat functionality. This server is designed to be deployed on Railway.

## Features

- 🔌 WebSocket connections for real-time messaging
- 👥 Circle-based message routing
- 📊 Connection monitoring and health checks
- 🛡️ Graceful shutdown handling
- 📡 Railway deployment ready
- 🌐 Combined HTTP/WebSocket server for better deployment compatibility

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will start on port 8080 (or the PORT environment variable).

## Railway Deployment

### Option 1: Deploy via Railway CLI

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize and deploy:
```bash
cd websocket-relay-railway
railway init
railway up
```

### Option 2: Deploy via GitHub

1. Push this folder to a GitHub repository
2. Connect your GitHub repo to Railway
3. Railway will automatically detect the Node.js app and deploy it

### Environment Variables

Railway will automatically set:
- `PORT` - The port Railway assigns to your service

## Usage

### WebSocket Connection

Connect to the WebSocket server:
```javascript
const ws = new WebSocket('wss://your-railway-app.railway.app');
```

### Join a Circle

Send a message to join a circle:
```javascript
ws.send(JSON.stringify({
  circleId: 'your-circle-id'
}));
```

### Send a Message

Send a message to all users in the same circle:
```javascript
ws.send(JSON.stringify({
  circleId: 'your-circle-id',
  message: {
    id: 'message-id',
    text: 'Hello world!',
    sender: 'user-id',
    timestamp: Date.now()
  }
}));
```

### Receive Messages

Listen for incoming messages:
```javascript
ws.onmessage = function(event) {
  const message = JSON.parse(event.data);
  console.log('Received message:', message);
};
```

## Health Check

The server provides health check endpoints:

- **Root endpoint**: `GET /` - Returns "WebSocket Relay Server is running"
- **Health endpoint**: `GET /health` - Returns detailed health status:

```json
{
  "status": "healthy",
  "connections": 5,
  "circles": 2,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Integration with Next.js App

Update your Next.js app's environment variables:

```env
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-railway-app.railway.app
```

Then update your chat component to use the Railway WebSocket URL instead of localhost.

## Monitoring

Railway provides built-in monitoring for:
- Logs
- Metrics
- Performance
- Error tracking

Check your Railway dashboard for real-time insights into your WebSocket server's performance.

## Architecture

This server uses a combined HTTP/WebSocket architecture:
- **HTTP Server**: Handles health checks and Railway deployment requirements
- **WebSocket Server**: Attached to the HTTP server for real-time messaging
- **Single Port**: Both HTTP and WebSocket run on the same port for better deployment compatibility 