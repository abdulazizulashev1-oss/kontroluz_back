export default ({ env }: { env: any }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', ''),
  app: {
    keys: env.array('APP_KEYS', ['key1', 'key2']),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOK_POPULATE_RELATIONS', true),
  },
});
