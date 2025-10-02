import 'dotenv/config';

export function loadConfig() {
  const env = process.env.NODE_ENV || 'development';

  return {
    port: Number(process.env.PORT || 8000),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    env,

    db: {
      url: process.env.DATABASE_URL,
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

    coingecko: {
      baseUrl: process.env.COINGECKO_BASE || 'https://api.coingecko.com/api/v3',
      apiKey: process.env.COINGECKO_API_KEY || '',
      timeoutMs: Number(process.env.CG_TIMEOUT_MS || 10000),
      cacheTtlMs: Number(process.env.CG_CACHE_TTL_MS || 30000),
      headers() {
        const h = { accept: 'application/json' };
        if (this.apiKey) {
          // 🔒 Demo uniquement
          h['x-cg-demo-api-key'] = this.apiKey;
        }
        return h;
      },
    },

    forex: {
      baseUrl: process.env.FOREX_BASE || 'https://api.frankfurter.app',
      timeoutMs: Number(process.env.FX_TIMEOUT_MS || 10000),
      cacheTtlMs: Number(process.env.FX_CACHE_TTL_MS || 60000),
    },

    http: {
      defaultAttempts: Number(process.env.HTTP_ATTEMPTS || 3),
      defaultTimeoutMs: Number(process.env.HTTP_TIMEOUT_MS || 10000),
    },
  };
}
