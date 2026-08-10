import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::product.product', () => ({
  async find(ctx) {
    const { query } = ctx;

    // Clone query to avoid mutation issues
    const sanitizedQuery: any = { ...query };

    // Default locale to 'uz' if not provided (supports uz, ru, en, all)
    if (!sanitizedQuery.locale) {
      sanitizedQuery.locale = 'uz';
    }

    // 1. Handle Simplified Search ('search' or 'q')
    const searchTerm = (sanitizedQuery.search || sanitizedQuery.q) as string | undefined;
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '') {
      delete sanitizedQuery.search;
      delete sanitizedQuery.q;

      const orFilters = [
        { title: { $containsi: searchTerm.trim() } },
        { shortDescription: { $containsi: searchTerm.trim() } },
        { sku: { $containsi: searchTerm.trim() } },
        { categoryName: { $containsi: searchTerm.trim() } },
      ];

      if (sanitizedQuery.filters && typeof sanitizedQuery.filters === 'object') {
        sanitizedQuery.filters = {
          $and: [
            sanitizedQuery.filters,
            { $or: orFilters },
          ],
        };
      } else {
        sanitizedQuery.filters = {
          $or: orFilters,
        };
      }
    }

    // 2. Handle Price Range ('minPrice' and 'maxPrice')
    const minPrice = sanitizedQuery.minPrice;
    const maxPrice = sanitizedQuery.maxPrice;
    if (minPrice !== undefined || maxPrice !== undefined) {
      delete sanitizedQuery.minPrice;
      delete sanitizedQuery.maxPrice;

      const priceFilter: any = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        priceFilter.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        priceFilter.$lte = Number(maxPrice);
      }

      if (Object.keys(priceFilter).length > 0) {
        if (!sanitizedQuery.filters) sanitizedQuery.filters = {};
        sanitizedQuery.filters.price = priceFilter;
      }
    }

    // 3. Handle Category Slug Filter ('category' or 'categorySlug')
    const categorySlug = (sanitizedQuery.categorySlug || sanitizedQuery.category) as string | undefined;
    if (categorySlug && typeof categorySlug === 'string') {
      delete sanitizedQuery.categorySlug;
      delete sanitizedQuery.category;

      if (!sanitizedQuery.filters) sanitizedQuery.filters = {};
      sanitizedQuery.filters.categorySlug = { $eq: categorySlug };
    }

    // 4. Handle InStock Filter
    if (sanitizedQuery.inStock !== undefined) {
      const inStockVal = String(sanitizedQuery.inStock).toLowerCase() === 'true';
      delete sanitizedQuery.inStock;

      if (!sanitizedQuery.filters) sanitizedQuery.filters = {};
      sanitizedQuery.filters.inStock = { $eq: inStockVal };
    }

    // 5. Handle Simplified Sort aliases
    const sortParam = sanitizedQuery.sort as string | undefined;
    if (sortParam) {
      if (sortParam === 'popular' || sortParam === 'rating') {
        sanitizedQuery.sort = 'rating:desc';
      } else if (sortParam === 'price-asc') {
        sanitizedQuery.sort = 'price:asc';
      } else if (sortParam === 'price-desc') {
        sanitizedQuery.sort = 'price:desc';
      } else if (sortParam === 'newest') {
        sanitizedQuery.sort = 'publishedAt:desc';
      }
    }

    // 6. Ensure populate defaults to '*' if not specified
    if (!sanitizedQuery.populate || sanitizedQuery.populate === '*') {
      sanitizedQuery.populate = {
        coverImage: true,
        images: true,
        category: true,
        seo: true,
        reviews: true,
      };
    }

    // Replace context query with sanitized & enhanced query
    ctx.query = sanitizedQuery;

    // Call default Strapi find implementation with sanitized parameters
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
        coverImage: true,
        images: true,
        category: true,
        seo: true,
        reviews: true,
      };
    }

    ctx.query = sanitizedQuery;
    return await super.findOne(ctx);
  },
}));
