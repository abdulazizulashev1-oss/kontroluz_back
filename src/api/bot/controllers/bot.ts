import { memoryCache } from '../../../utils/cache';

export default {
  /**
   * 1. GET /api/bot/categories
   * Fetch root categories or subcategories optimized for Telegram Bot inline keyboards.
   */
  async getCategories(ctx: any) {
    try {
      const locale = (ctx.query.locale as string) || 'uz';
      const parentSlug = ctx.query.parentSlug as string | undefined;
      const cacheKey = `bot_categories_${locale}_${parentSlug || 'root'}`;

      const cached = memoryCache.get(cacheKey);
      if (cached) {
        ctx.set('X-Cache', 'HIT');
        return { data: cached };
      }

      const whereCondition: any = {};
      if (locale !== 'all') {
        whereCondition.locale = locale;
      }

      if (parentSlug) {
        whereCondition.parent = { slug: parentSlug };
      } else {
        whereCondition.parent = { id: { $null: true } };
      }

      const categories = await (strapi as any).db.query('api::category.category').findMany({
        where: whereCondition,
        select: ['id', 'slug', 'name', 'iconName', 'productCount', 'order', 'locale'],
        populate: {
          subcategories: {
            select: ['id', 'slug', 'name', 'iconName', 'productCount', 'order'],
          },
          coverImage: {
            select: ['url'],
          },
        },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
      });

      const formatted = categories.map((cat: any) => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        iconName: cat.iconName || 'Folder',
        productCount: cat.productCount || 0,
        order: cat.order || 1,
        coverImageUrl: cat.coverImage?.url || null,
        hasSubcategories: Array.isArray(cat.subcategories) && cat.subcategories.length > 0,
        subcategories: (cat.subcategories || []).map((sub: any) => ({
          id: sub.id,
          slug: sub.slug,
          name: sub.name,
          iconName: sub.iconName || 'Tag',
          productCount: sub.productCount || 0,
        })),
      }));

      memoryCache.set(cacheKey, formatted, 300000); // 5 min cache
      ctx.set('X-Cache', 'MISS');
      return { data: formatted };
    } catch (err: any) {
      return ctx.badRequest('Failed to fetch bot categories', { error: err.message });
    }
  },

  /**
   * 2. GET /api/bot/products
   * Paginated products list for Telegram catalog browsing.
   */
  async getProducts(ctx: any) {
    try {
      const locale = (ctx.query.locale as string) || 'uz';
      const categorySlug = (ctx.query.categorySlug || ctx.query.category) as string | undefined;
      const page = Math.max(1, parseInt((ctx.query.page as string) || '1', 10));
      const limit = Math.min(50, Math.max(1, parseInt((ctx.query.limit as string) || '10', 10)));
      const offset = (page - 1) * limit;

      const whereCondition: any = {};
      if (locale !== 'all') {
        whereCondition.locale = locale;
      }

      if (categorySlug) {
        whereCondition.$or = [
          { categorySlug: { $eq: categorySlug } },
          { category: { slug: { $eq: categorySlug } } },
          { category: { parent: { slug: { $eq: categorySlug } } } },
        ];
      }

      const [products, count] = await Promise.all([
        (strapi as any).db.query('api::product.product').findMany({
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
            'shortDescription',
            'categorySlug',
            'categoryName',
            'image',
            'publishedAt',
          ],
          populate: {
            coverImage: { select: ['url'] },
            category: { select: ['id', 'slug', 'name'] },
          },
          orderBy: { id: 'desc' },
          limit,
          offset,
        }),
        (strapi as any).db.query('api::product.product').count({ where: whereCondition }),
      ]);

      const formatted = products.map((p: any) => {
        const coverUrl = p.coverImage?.url || p.image || null;
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
          shortDescription: p.shortDescription || '',
          categorySlug: p.categorySlug || p.category?.slug || '',
          categoryName: p.categoryName || p.category?.name || '',
          coverImageUrl: coverUrl,
        };
      });

      return {
        data: formatted,
        meta: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (err: any) {
      return ctx.badRequest('Failed to fetch bot products', { error: err.message });
    }
  },

  /**
   * 3. GET /api/bot/products/search
   * Search products by query string for Telegram Bot search inline mode / search command.
   */
  async searchProducts(ctx: any) {
    try {
      const locale = (ctx.query.locale as string) || 'uz';
      const searchTerm = (ctx.query.q || ctx.query.search || ctx.query.query) as string | undefined;
      const limit = Math.min(30, Math.max(1, parseInt((ctx.query.limit as string) || '10', 10)));

      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
        return { data: [], meta: { total: 0 } };
      }

      const cleanTerm = searchTerm.trim();
      const whereCondition: any = {
        $or: [
          { title: { $containsi: cleanTerm } },
          { sku: { $containsi: cleanTerm } },
          { shortDescription: { $containsi: cleanTerm } },
          { categoryName: { $containsi: cleanTerm } },
        ],
      };

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
          'shortDescription',
          'categorySlug',
          'categoryName',
          'image',
        ],
        populate: {
          coverImage: { select: ['url'] },
        },
        limit,
        orderBy: { id: 'desc' },
      });

      const formatted = products.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        sku: p.sku,
        price: Number(p.price || 0),
        oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
        currency: p.currency || 'UZS',
        inStock: Boolean(p.inStock),
        shortDescription: p.shortDescription || '',
        categoryName: p.categoryName || '',
        coverImageUrl: p.coverImage?.url || p.image || null,
      }));

      return {
        data: formatted,
        meta: { total: formatted.length },
      };
    } catch (err: any) {
      return ctx.badRequest('Failed to search bot products', { error: err.message });
    }
  },

  /**
   * 4. GET /api/bot/products/:id
   * Single product detailed information + pre-formatted Telegram markdown message.
   */
  async getProductDetail(ctx: any) {
    try {
      const { id } = ctx.params;
      const locale = (ctx.query.locale as string) || 'uz';

      if (!id) {
        return ctx.badRequest('Product ID or Slug is required');
      }

      const isNumeric = !isNaN(Number(id));
      const whereCondition: any = isNumeric ? { id: Number(id) } : { slug: id };
      if (locale !== 'all') {
        whereCondition.locale = locale;
      }

      let product = await (strapi as any).db.query('api::product.product').findOne({
        where: whereCondition,
        populate: {
          coverImage: { select: ['url', 'width', 'height'] },
          images: { select: ['url'] },
          category: { select: ['id', 'slug', 'name'] },
        },
      });

      // Fallback if locale filter yielded no match
      if (!product && locale !== 'all') {
        const fallbackWhere: any = isNumeric ? { id: Number(id) } : { slug: id };
        product = await (strapi as any).db.query('api::product.product').findOne({
          where: fallbackWhere,
          populate: {
            coverImage: { select: ['url', 'width', 'height'] },
            images: { select: ['url'] },
            category: { select: ['id', 'slug', 'name'] },
          },
        });
      }

      if (!product) {
        return ctx.notFound('Product not found');
      }

      const coverUrl = product.coverImage?.url || product.image || null;
      const galleryUrls = (product.images || []).map((img: any) => img.url).filter(Boolean);

      // Build specs formatted string for Telegram
      let specsText = '';
      if (product.specifications && typeof product.specifications === 'object') {
        specsText = Object.entries(product.specifications)
          .map(([k, v]) => `• *${k}:* ${v}`)
          .join('\n');
      }

      const formattedPrice = new Intl.NumberFormat('uz-UZ').format(Number(product.price || 0));
      const oldPriceFormatted = product.oldPrice
        ? `~${new Intl.NumberFormat('uz-UZ').format(Number(product.oldPrice))} UZS~`
        : '';
      const stockStatus = product.inStock ? '🟢 Omborda mavjud' : '🔴 Buyurtma asosida';

      // Pre-built Telegram HTML/Markdown Message text
      const telegramText = [
        `📦 *${product.title}*`,
        `🔢 *Artikul:* \`${product.sku}\``,
        `📁 *Kategoriya:* ${product.categoryName || product.category?.name || 'Sanoat uskunasi'}`,
        `💰 *Narxi:* *${formattedPrice} UZS* ${oldPriceFormatted}`,
        `📦 *Holati:* ${stockStatus}`,
        '',
        `📝 *Qisqa ma'lumot:*`,
        product.shortDescription || 'Tavsif mavjud emas',
        specsText ? `\n⚙️ *Texnik xarakteristikasi:*\n${specsText}` : '',
      ].filter(Boolean).join('\n');

      return {
        data: {
          id: product.id,
          slug: product.slug,
          title: product.title,
          sku: product.sku,
          price: Number(product.price || 0),
          oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
          currency: product.currency || 'UZS',
          inStock: Boolean(product.inStock),
          stockCount: Number(product.stockCount || 0),
          rating: Number(product.rating || 5.0),
          reviewCount: Number(product.reviewCount || 0),
          shortDescription: product.shortDescription || '',
          fullDescription: product.fullDescription || '',
          specifications: product.specifications || {},
          categorySlug: product.categorySlug || product.category?.slug || '',
          categoryName: product.categoryName || product.category?.name || '',
          coverImageUrl: coverUrl,
          galleryImageUrls: galleryUrls,
          telegramMessageText: telegramText,
        },
      };
    } catch (err: any) {
      return ctx.badRequest('Failed to fetch product details for bot', { error: err.message });
    }
  },

  /**
   * 5. POST /api/bot/leads
   * Submit B2B lead / request directly from Telegram Bot.
   */
  async createLead(ctx: any) {
    try {
      const body = ctx.request.body || {};
      const payload = body.data || body;

      const {
        clientName,
        phone,
        telegramUsername,
        telegramChatId,
        company,
        category,
        message,
        objectType,
        areaSqM,
      } = payload;

      if (!clientName || !phone) {
        return ctx.badRequest('Client name and phone number are required');
      }

      const telegramInfo = [
        telegramUsername ? `Telegram: @${telegramUsername.replace('@', '')}` : '',
        telegramChatId ? `Chat ID: ${telegramChatId}` : '',
        message ? `Xabar: ${message}` : '',
      ].filter(Boolean).join(' | ');

      const leadData: any = {
        clientName,
        phone,
        company: company || (telegramUsername ? `@${telegramUsername.replace('@', '')}` : 'Telegram Bot'),
        category: category || 'General Telegram Lead',
        message: telegramInfo || 'Submitted via Telegram Bot',
        objectType: objectType || 'telegram_bot',
        areaSqM: areaSqM ? Number(areaSqM) : undefined,
        status: 'NEW',
        publishedAt: new Date(),
      };

      const createdLead = await (strapi as any).entityService.create('api::lead.lead', {
        data: leadData,
      });

      return {
        success: true,
        data: {
          id: createdLead.id,
          clientName: createdLead.clientName,
          phone: createdLead.phone,
          status: createdLead.status,
          message: 'Lead submitted successfully from Telegram Bot',
        },
      };
    } catch (err: any) {
      return ctx.badRequest('Failed to save lead from Telegram Bot', { error: err.message });
    }
  },

  /**
   * 6. POST /api/bot/orders
   * Submit cart order directly from Telegram Bot.
   */
  async createOrder(ctx: any) {
    try {
      const body = ctx.request.body || {};
      const payload = body.data || body;

      const {
        customerName,
        customerPhone,
        telegramUsername,
        telegramChatId,
        shippingAddress,
        paymentMethod,
        notes,
        items,
      } = payload;

      if (!customerName || !customerPhone) {
        return ctx.badRequest('Customer name and phone number are required');
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return ctx.badRequest('Order items list cannot be empty');
      }

      // Generate unique order number (ORD-YYYYMMDD-XXXX)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-${dateStr}-${randomId}`;

      let subtotal = 0;
      const formattedItems = items.map((item: any) => {
        const itemPrice = Number(item.price || 0);
        const qty = Math.max(1, Number(item.quantity || 1));
        subtotal += itemPrice * qty;
        return {
          productId: item.productId || item.id,
          slug: item.slug || '',
          title: item.title || 'Mahsulot',
          price: itemPrice,
          quantity: qty,
          image: item.image || item.coverImageUrl || '',
        };
      });

      const tax = Math.round(subtotal * 0.12); // 12% QQS
      const shippingFee = 0;
      const totalAmount = subtotal + tax + shippingFee;

      const fullNotes = [
        telegramUsername ? `Telegram: @${telegramUsername.replace('@', '')}` : '',
        telegramChatId ? `Chat ID: ${telegramChatId}` : '',
        notes ? `Izoh: ${notes}` : '',
      ].filter(Boolean).join(' | ');

      const orderData: any = {
        orderNumber,
        customerName,
        customerPhone,
        customerEmail: `${customerPhone.replace(/[^0-9]/g, '')}@telegram.bot`,
        company: telegramUsername ? `@${telegramUsername.replace('@', '')}` : 'Telegram User',
        shippingAddress: shippingAddress || 'Telegram Order (Yetkazib berish)',
        paymentMethod: paymentMethod || 'click',
        notes: fullNotes,
        items: formattedItems,
        subtotal: String(subtotal),
        tax: String(tax),
        shippingFee: String(shippingFee),
        totalAmount: String(totalAmount),
        status: 'NEW',
        publishedAt: new Date(),
      };

      const createdOrder = await (strapi as any).entityService.create('api::order.order', {
        data: orderData,
      });

      const formattedTotal = new Intl.NumberFormat('uz-UZ').format(totalAmount);

      // Pre-formatted Telegram Receipt message
      const receiptText = [
        `🎉 *BUYURTMA QABUL QILINDI!*`,
        `🔢 *Buyurtma Nomeri:* \`${orderNumber}\``,
        `👤 *Xaridor:* ${customerName}`,
        `📞 *Tel:* ${customerPhone}`,
        `📍 *Manzil:* ${shippingAddress || 'Kelishiladi'}`,
        `💳 *To'lov Turi:* ${(paymentMethod || 'click').toUpperCase()}`,
        '',
        `🛍 *Buyurtma tarkibi:*`,
        ...formattedItems.map(
          (it: any, i: number) =>
            `${i + 1}. *${it.title}* — ${it.quantity} dona x ${new Intl.NumberFormat('uz-UZ').format(it.price)} UZS`
        ),
        '',
        `💵 *Jami Summa:* *${formattedTotal} UZS* (QQS 12% kiritilgan)`,
        `⌛ *Holati:* 🟢 Qabul qilindi (Tez orada operator bog'lanadi)`,
      ].join('\n');

      return {
        success: true,
        data: {
          id: createdOrder.id,
          orderNumber,
          totalAmount,
          status: 'NEW',
          receiptText,
        },
      };
    } catch (err: any) {
      return ctx.badRequest('Failed to create order from Telegram Bot', { error: err.message });
    }
  },

  /**
   * 7. GET /api/bot/orders/check
   * Check order status by orderNumber or phone number.
   */
  async checkOrderStatus(ctx: any) {
    try {
      const orderNumber = ctx.query.orderNumber as string | undefined;
      const phone = ctx.query.phone as string | undefined;

      if (!orderNumber && !phone) {
        return ctx.badRequest('Please provide orderNumber or phone to check status');
      }

      const whereCondition: any = {};
      if (orderNumber) {
        whereCondition.orderNumber = orderNumber.trim();
      } else if (phone) {
        whereCondition.customerPhone = { $containsi: phone.trim() };
      }

      const orders = await (strapi as any).db.query('api::order.order').findMany({
        where: whereCondition,
        orderBy: { id: 'desc' },
        limit: 5,
      });

      if (!orders || orders.length === 0) {
        return ctx.notFound('No orders found matching criteria');
      }

      const formatted = orders.map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        totalAmount: Number(o.totalAmount || 0),
        status: o.status || 'NEW',
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      }));

      return { data: formatted };
    } catch (err: any) {
      return ctx.badRequest('Failed to check order status', { error: err.message });
    }
  },
};
