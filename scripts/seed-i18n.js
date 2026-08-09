const strapiFactory = require('@strapi/strapi');

async function seed() {
  const strapi = await strapiFactory().load();
  try {
    console.log('Seeding i18n categories and products...');

    // 1. Check/create default categories for uz
    const categoriesData = [
      {
        slug: 'videokuzatuv',
        iconName: 'Camera',
        imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9',
        productCount: 42,
        uz: {
          name: 'Videokuzatuv Tizimlari',
          description: 'IP kameralar, NVR registratorlar va videokuzatuv aksessuarlari',
        },
        ru: {
          name: 'Системы Видеонаблюдения',
          description: 'IP-камеры, NVR-регистраторы и аксессуары для видеонаблюдения',
        },
        en: {
          name: 'Video Surveillance Systems',
          description: 'IP cameras, NVR recorders and video surveillance accessories',
        },
      },
      {
        slug: 'kirishni-boshqarish',
        iconName: 'ShieldCheck',
        imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827',
        productCount: 28,
        uz: {
          name: 'Kirishni Boshqarish Tizimlari (SKUD)',
          description: 'Turniketlar, biometrik skanerlar va kontrollerlar',
        },
        ru: {
          name: 'Системы Контроля Доступа (СКУД)',
          description: 'Турникеты, биометрические сканеры и контроллеры',
        },
        en: {
          name: 'Access Control Systems (ACS)',
          description: 'Turnstiles, biometric scanners and controllers',
        },
      },
      {
        slug: 'yongin-xavfsizligi',
        iconName: 'Flame',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
        productCount: 19,
        uz: {
          name: "Yong'in Xavfsizligi",
          description: 'Datchiklar, xabar beruvchilar va avtomatik oʻchirish tizimlari',
        },
        ru: {
          name: 'Пожарная Безопасность',
          description: 'Датчики, извещатели и системы автоматического пожаротушения',
        },
        en: {
          name: 'Fire Safety Systems',
          description: 'Detectors, annunciators and automatic extinguishing systems',
        },
      },
      {
        slug: 'sanoat-avtomatikasi',
        iconName: 'Cpu',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        productCount: 35,
        uz: {
          name: 'Sanoat Avtomatikasi va Nasoslar',
          description: 'Vertikal nasoslar, festo pnevmatika va manometrlar',
        },
        ru: {
          name: 'Промышленная Автоматика и Насосы',
          description: 'Вертикальные насосы, пневматика Festo и манометры',
        },
        en: {
          name: 'Industrial Automation & Pumps',
          description: 'Vertical pumps, Festo pneumatics and pressure gauges',
        },
      },
    ];

    const categoryMap = {};

    for (const cat of categoriesData) {
      const existing = await strapi.entityService.findMany('api::category.category', {
        filters: { slug: cat.slug },
      });

      let uzCat = existing && existing.length > 0 ? existing[0] : null;

      if (!uzCat) {
        uzCat = await strapi.entityService.create('api::category.category', {
          data: {
            slug: cat.slug,
            name: cat.uz.name,
            description: cat.uz.description,
            iconName: cat.iconName,
            imageUrl: cat.imageUrl,
            productCount: cat.productCount,
            locale: 'uz',
            publishedAt: new Date(),
          },
        });
        console.log(`Created UZ Category: ${cat.slug}`);
      }

      categoryMap[cat.slug] = uzCat;

      // Seed RU translation
      const existingRu = await strapi.entityService.findMany('api::category.category', {
        filters: { slug: cat.slug, locale: 'ru' },
      });
      if (!existingRu || existingRu.length === 0) {
        await strapi.entityService.create('api::category.category', {
          data: {
            slug: cat.slug,
            name: cat.ru.name,
            description: cat.ru.description,
            iconName: cat.iconName,
            imageUrl: cat.imageUrl,
            productCount: cat.productCount,
            locale: 'ru',
            publishedAt: new Date(),
          },
        });
        console.log(`Created RU Category: ${cat.slug}`);
      }

      // Seed EN translation
      const existingEn = await strapi.entityService.findMany('api::category.category', {
        filters: { slug: cat.slug, locale: 'en' },
      });
      if (!existingEn || existingEn.length === 0) {
        await strapi.entityService.create('api::category.category', {
          data: {
            slug: cat.slug,
            name: cat.en.name,
            description: cat.en.description,
            iconName: cat.iconName,
            imageUrl: cat.imageUrl,
            productCount: cat.productCount,
            locale: 'en',
            publishedAt: new Date(),
          },
        });
        console.log(`Created EN Category: ${cat.slug}`);
      }
    }

    // 2. Seed Products for 3 locales
    const productsData = [
      {
        slug: 'hikvision-ds-2cd2143g0-i-4mp-dome-ip-camera',
        sku: 'HK-2CD2143G0',
        categorySlug: 'videokuzatuv',
        categoryName: 'Videokuzatuv Tizimlari',
        price: 1250000,
        oldPrice: 1450000,
        currency: 'UZS',
        inStock: true,
        stockCount: 45,
        rating: 4.9,
        reviewCount: 28,
        image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9',
        uz: {
          title: 'Hikvision DS-2CD2143G0-I 4MP Vandal-Proof Dome IP Kamera',
          shortDescription: '4 megapikselli yuqori aniqlikdagi IP kamera',
          fullDescription: 'Hikvision DS-2CD2143G0-I sanoat va tijorat obyektlari uchun moʻljallangan...',
          specifications: { 'Matritsa aniqligi': '4 MP', 'IR Tungi masofa': '30m', Himoya: 'IP67 / IK10' },
          seo: { title: 'Hikvision DS-2CD2143G0-I Xarid Qilish — Kontrol.uz', description: 'Hikvision 4MP IP kamera Toshkent omboridan.' },
        },
        ru: {
          title: 'Hikvision DS-2CD2143G0-I 4MP Купольная Антивандальная IP-Камера',
          shortDescription: 'Высокоточная 4-мегапиксельная купольная IP-камера',
          fullDescription: 'Hikvision DS-2CD2143G0-I предназначена для промышленных и коммерческих объектов...',
          specifications: { 'Разрешение матрицы': '4 Мп', 'ИК подсветка': '30м', Защита: 'IP67 / IK10' },
          seo: { title: 'Купить Hikvision DS-2CD2143G0-I — Kontrol.uz', description: 'Hikvision 4MP IP-камера со склада в Ташкенте.' },
        },
        en: {
          title: 'Hikvision DS-2CD2143G0-I 4MP Vandal-Proof Dome IP Camera',
          shortDescription: '4 Megapixel High Definition Dome IP Camera',
          fullDescription: 'Hikvision DS-2CD2143G0-I designed for industrial and commercial facilities...',
          specifications: { Resolution: '4 MP', 'IR Night Vision': '30m', Protection: 'IP67 / IK10' },
          seo: { title: 'Buy Hikvision DS-2CD2143G0-I — Kontrol.uz', description: 'Hikvision 4MP IP camera from Tashkent warehouse.' },
        },
      },
      {
        slug: 'zkteco-inbio260-access-control-panel',
        sku: 'ZK-INBIO260',
        categorySlug: 'kirishni-boshqarish',
        categoryName: 'Kirishni Boshqarish Tizimlari (SKUD)',
        price: 2800000,
        oldPrice: 3100000,
        currency: 'UZS',
        inStock: true,
        stockCount: 12,
        rating: 4.8,
        reviewCount: 15,
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827',
        uz: {
          title: 'ZKTeco InBio260 2-Door Biometric Access Control Panel',
          shortDescription: '2 eshikli biometrik SKUD paneli',
          fullDescription: 'ZKTeco InBio260 barmoq izi va kartalar orqali kirishni boshqaradi...',
          specifications: { Interfeys: 'TCP/IP, RS485', Xotira: '30,000 karta, 3,000 barmoq izi' },
          seo: { title: 'ZKTeco InBio260 SKUD Paneli — Kontrol.uz', description: 'Biometrik SKUD kontrolleri yetkazib berish va oʻrnatish.' },
        },
        ru: {
          title: 'ZKTeco InBio260 2-Дверная Биометрическая Панель Контроля Доступа',
          shortDescription: 'Биометрическая панель СКУД на 2 двери',
          fullDescription: 'ZKTeco InBio260 управляет доступом по отпечаткам пальцев и картам...',
          specifications: { Интерфейс: 'TCP/IP, RS485', Память: '30,000 карт, 3,000 отпечатков' },
          seo: { title: 'Панель СКУД ZKTeco InBio260 — Kontrol.uz', description: 'Биометрический контроллер СКУД с установкой в Ташкенте.' },
        },
        en: {
          title: 'ZKTeco InBio260 2-Door Biometric Access Control Panel',
          shortDescription: '2-Door Biometric Access Control Panel',
          fullDescription: 'ZKTeco InBio260 manages access control via fingerprints and RFID cards...',
          specifications: { Interface: 'TCP/IP, RS485', Capacity: '30,000 cards, 3,000 fingerprints' },
          seo: { title: 'ZKTeco InBio260 ACS Panel — Kontrol.uz', description: 'Biometric access control panel with fast delivery.' },
        },
      },
      {
        slug: 'festo-pneumatic-valve-terminal-vtug',
        sku: 'FESTO-VTUG-10',
        categorySlug: 'sanoat-avtomatikasi',
        categoryName: 'Sanoat Avtomatikasi va Nasoslar',
        price: 4500000,
        oldPrice: null,
        currency: 'UZS',
        inStock: true,
        stockCount: 8,
        rating: 5.0,
        reviewCount: 9,
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        uz: {
          title: 'Festo VTUG Pnevmatik Klapanlar Terminali',
          shortDescription: 'Kompakt sanoat pnevmatika terminali',
          fullDescription: 'Festo VTUG pnevmo-oraliq klapanlar bloki sanoat avtomatizatsiyasi uchun...',
          specifications: { Bosim: '0.9 - 10 bar', Himoya: 'IP65' },
          seo: { title: 'Festo Pnevmatika Terminali — Kontrol.uz', description: 'Sanoat avtomatizatsiyasi uchun Festo klapanlar bloki.' },
        },
        ru: {
          title: 'Festo VTUG Пневматический Остров Клапанов',
          shortDescription: 'Компактный промышленный пневмоостров',
          fullDescription: 'Festo VTUG блок электромагнитных распределителей для автоматизации...',
          specifications: { Давление: '0.9 - 10 бар', Защита: 'IP65' },
          seo: { title: 'Пневмоостров Festo VTUG — Kontrol.uz', description: 'Клапанный блок Festo для промышленной автоматики.' },
        },
        en: {
          title: 'Festo VTUG Pneumatic Valve Terminal',
          shortDescription: 'Compact industrial valve terminal',
          fullDescription: 'Festo VTUG pneumatic valve manifold for industrial automation processes...',
          specifications: { Pressure: '0.9 - 10 bar', Protection: 'IP65' },
          seo: { title: 'Festo Valve Terminal VTUG — Kontrol.uz', description: 'Festo pneumatic valve terminal for automation.' },
        },
      },
    ];

    for (const prod of productsData) {
      const parentCat = categoryMap[prod.categorySlug];

      for (const loc of ['uz', 'ru', 'en']) {
        const existing = await strapi.entityService.findMany('api::product.product', {
          filters: { slug: prod.slug, locale: loc },
        });

        if (!existing || existing.length === 0) {
          const locData = prod[loc];
          await strapi.entityService.create('api::product.product', {
            data: {
              slug: prod.slug,
              sku: prod.sku,
              title: locData.title,
              category: parentCat?.id,
              categorySlug: prod.categorySlug,
              categoryName: prod.categoryName,
              price: prod.price,
              oldPrice: prod.oldPrice,
              currency: prod.currency,
              inStock: prod.inStock,
              stockCount: prod.stockCount,
              rating: prod.rating,
              reviewCount: prod.reviewCount,
              image: prod.image,
              shortDescription: locData.shortDescription,
              fullDescription: locData.fullDescription,
              specifications: locData.specifications,
              seo: locData.seo,
              locale: loc,
              publishedAt: new Date(),
            },
          });
          console.log(`Created Product (${loc}): ${prod.slug}`);
        }
      }
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

seed();
