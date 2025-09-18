export function loadconfig () {
  return {
    port: Number(process.env.port || 8000),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    // databaseUrl: process.env.DATABASE_URL,(quand on branches Postgres)
  }
}
