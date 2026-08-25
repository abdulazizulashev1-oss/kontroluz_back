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

    // Support rootOnly flag to easily return only top-level (parent) categories
    if (sanitizedQuery.rootOnly === 'true' || sanitizedQuery.rootOnly === true) {
      delete sanitizedQuery.rootOnly;
      if (!sanitizedQuery.filters) sanitizedQuery.filters = {};
      sanitizedQuery.filters.parent = { $null: true };
    }

    // Optimized populate: exclude heavy `products` array by default to avoid memory & database slowdown
    if (!sanitizedQuery.populate || sanitizedQuery.populate === '*') {
      sanitizedQuery.populate = {
        subcategories: {
          populate: {
            coverImage: true,
          },
          sort: ['order:asc', 'id:asc'],
        },
        parent: {
          populate: {
            coverImage: true,
          },
        },
        coverImage: true,
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
          populate: {
            coverImage: true,
          },
          sort: ['order:asc', 'id:asc'],
        },
        parent: {
          populate: {
            coverImage: true,
          },
        },
        coverImage: true,
      };
    }

    ctx.query = sanitizedQuery;
    return await super.findOne(ctx);
  },
}));
