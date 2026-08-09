import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::category.category', () => ({
  async find(ctx) {
    const { query } = ctx;
    const sanitizedQuery: any = { ...query };

    // If populate is '*' or empty, deeply populate subcategories, parent, coverImage, and products
    if (!sanitizedQuery.populate || sanitizedQuery.populate === '*') {
      sanitizedQuery.populate = {
        subcategories: {
          populate: '*',
        },
        parent: {
          populate: '*',
        },
        coverImage: true,
        products: true,
      };
    }

    ctx.query = sanitizedQuery;
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const { query } = ctx;
    const sanitizedQuery: any = { ...query };

    if (!sanitizedQuery.populate || sanitizedQuery.populate === '*') {
      sanitizedQuery.populate = {
        subcategories: {
          populate: '*',
        },
        parent: {
          populate: '*',
        },
        coverImage: true,
        products: true,
      };
    }

    ctx.query = sanitizedQuery;
    return await super.findOne(ctx);
  },
}));
