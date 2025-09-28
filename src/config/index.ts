export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    environment: process.env.NODE_ENV || 'development',
    bodyLimit: process.env.BODY_LIMIT || '10mb',
    host: process.env.HOST || 'localhost'
  },
  cors: {
    origin: [
      'http://localhost:3000', // Frontend
      'http://localhost:3001', // Backend itself
      process.env.FRONTEND_URL || 'http://localhost:3000'
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  morgan: {
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
  },
  api: {
    version: '1.0.0',
    name: 'Seedify Backend API'
  }
};
