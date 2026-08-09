export default ({ env }: { env: any }) => {
  const client = env('DATABASE_CLIENT', 'postgres');

  if (client === 'sqlite') {
    return {
      connection: {
        client: 'sqlite',
        connection: {
          filename: env('DATABASE_FILENAME', '.tmp/data.db'),
        },
        useNullAsDefault: true,
      },
    };
  }

  return {
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST', '127.0.0.1'),
        port: env.int('DATABASE_PORT', 5438),
        database: env('DATABASE_NAME', 'kontrol_db'),
        user: env('DATABASE_USERNAME', 'postgres'),
        password: env('DATABASE_PASSWORD', 'postgrespassword2026'),
        ssl: env.bool('DATABASE_SSL', false) && { rejectUnauthorized: false },
      },
      pool: { min: 2, max: 10 },
    },
  };
};
