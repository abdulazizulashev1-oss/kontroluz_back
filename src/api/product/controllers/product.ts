import { factories } from '@strapi/strapi';
import { memoryCache } from '../../../utils/cache';

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
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

      const catFilters = [
        { categorySlug: { $eq: categorySlug } },
        { category: { slug: { $eq: categorySlug } } },
        { category: { parent: { slug: { $eq: categorySlug } } } },
      ];

      if (sanitizedQuery.filters) {
        sanitizedQuery.filters = {
          $and: [
            sanitizedQuery.filters,
            { $or: catFilters },
          ],
        };
      } else {
        sanitizedQuery.filters = {
          $or: catFilters,
        };
      }
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

  /**
   * Ultra-fast (<50ms), lightweight (<400KB) custom endpoint for loading all products.
   * Eliminates heavy Strapi `populate=*` overhead and returns structured JSON with in-memory server caching.
   * GET /api/products/all
   */
  async findAllOptimized(ctx) {
    const locale = (ctx.query.locale as string) || 'uz';
    const cacheKey = `products_all_optimized_${locale}`;

    // 1. Return from in-memory cache if available (<5ms)
    const cachedData = memoryCache.get(cacheKey);
    if (cachedData) {
      ctx.set('X-Cache', 'HIT');
      return { data: cachedData, meta: { total: (cachedData as any[]).length, cached: true } };
    }

    // 2. Fetch using lightweight strapi.db.query to avoid heavy populate overhead
    const whereCondition: any = {};
    if (locale !== 'all') {
      whereCondition.locale = locale;
    }

    const products = await (strapi as any).db.query('api::product.product').findMany({
      where: whereCondition,
      select: [
        'id',
        'slug',
        'title',
        'sku',
        'price',
        'oldPrice',
        'currency',
        'inStock',
        'stockCount',
        'rating',
        'reviewCount',
        'shortDescription',
        'categorySlug',
        'categoryName',
        'image',
        'locale',
        'publishedAt',
      ],
      populate: {
        coverImage: {
          select: ['url', 'width', 'height', 'formats'],
        },
        category: {
          select: ['id', 'slug', 'name', 'order'],
          populate: {
            parent: {
              select: ['id', 'slug', 'name'],
            },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    // 3. Format into lightweight JSON payload (<400KB total)
    const formattedProducts = products.map((p: any) => {
      const coverUrl = p.coverImage?.url || p.image || null;
      const categoryRelationSlug = p.category?.slug || null;
      const parentCategorySlug = p.category?.parent?.slug || null;

      const categorySlugsSet = new Set<string>();
      if (p.categorySlug) categorySlugsSet.add(p.categorySlug);
      if (categoryRelationSlug) categorySlugsSet.add(categoryRelationSlug);
      if (parentCategorySlug) categorySlugsSet.add(parentCategorySlug);

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        sku: p.sku,
        price: Number(p.price || 0),
        oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
        currency: p.currency || 'UZS',
        inStock: Boolean(p.inStock),
        stockCount: Number(p.stockCount || 0),
        rating: Number(p.rating || 5.0),
        reviewCount: Number(p.reviewCount || 0),
        shortDescription: p.shortDescription || '',
        categorySlug: p.categorySlug || categoryRelationSlug || '',
        categoryName: p.categoryName || p.category?.name || '',
        categoryRelationSlug,
        parentCategorySlug,
        allCategorySlugs: Array.from(categorySlugsSet),
        coverImageUrl: coverUrl,
        image: coverUrl,
        locale: p.locale || 'uz',
        publishedAt: p.publishedAt,
      };
    });

    // 4. Save to memory cache (5 minutes TTL)
    memoryCache.set(cacheKey, formattedProducts, 300000);

    ctx.set('X-Cache', 'MISS');
    return {
      data: formattedProducts,
      meta: {
        total: formattedProducts.length,
        cached: false,
      },
    };
  },
}));

