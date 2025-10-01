import 'dotenv/config';

export function loadConfig() {
  return {
    port: Number(process.env.PORT || 8000),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    db: {
      dialect: process.env.DB_DIALECT || 'sqlite',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      // cast en string pour éviter l’erreur “password must be a string”
      password: process.env.DB_PASSWORD ?? '',
      storage: process.env.DB_STORAGE || 'dev.sqlite',
      ssl: process.env.DB_SSL === 'true',
      logging: false,
    },
  };
}
