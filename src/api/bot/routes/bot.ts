export default {
  routes: [
    {
      method: 'GET',
      path: '/bot/categories',
      handler: 'bot.getCategories',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/bot/products',
      handler: 'bot.getProducts',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/bot/products/search',
      handler: 'bot.searchProducts',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/bot/products/:id',
      handler: 'bot.getProductDetail',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/bot/leads',
      handler: 'bot.createLead',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/bot/orders',
      handler: 'bot.createOrder',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/bot/orders/check',
      handler: 'bot.checkOrderStatus',
      config: { auth: false },
    },
  ],
};
