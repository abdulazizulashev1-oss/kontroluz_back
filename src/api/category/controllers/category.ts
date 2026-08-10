import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::category.category', () => ({
  async find(ctx) {
    const { query } = ctx;
    const sanitizedQuery: any = { ...query };

    // Default locale to 'uz' if not provided (supports uz, ru, en, all)
    if (!sanitizedQuery.locale) {
      sanitizedQuery.locale = 'uz';
    }

    // Default sort by admin defined order ascending, then id ascending
    if (!sanitizedQuery.sort) {
      sanitizedQuery.sort = ['order:asc', 'id:asc'];
    }

    // If populate is '*' or empty, deeply populate subcategories, parent, coverImage, and products
    if (!sanitizedQuery.populate || sanitizedQuery.populate === '*') {
      sanitizedQuery.populate = {
        subcategories: {
          populate: '*',
          sort: ['order:asc', 'id:asc'],
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

    if (!sanitizedQuery.locale) {
      sanitizedQuery.locale = 'uz';
    }

    if (!sanitizedQuery.populate || sanitizedQuery.populate === '*') {
      sanitizedQuery.populate = {
        subcategories: {
          populate: '*',
          sort: ['order:asc', 'id:asc'],
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
