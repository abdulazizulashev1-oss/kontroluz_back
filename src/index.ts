export default {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }: { strapi: any }) {
    try {
      // 1. Configure Public Permissions
      const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (publicRole) {
        const permissionsToEnable = [
          'api::category.category.find',
          'api::category.category.findOne',
          'api::product.product.find',
          'api::product.product.findOne',
          'api::review.review.find',
          'api::review.review.findOne',
          'api::lead.lead.create',
          'api::order.order.create',
          'api::order.order.findOne',
        ];

        for (const action of permissionsToEnable) {
          const existingPermission = await strapi.query('plugin::users-permissions.permission').findOne({
            where: { role: publicRole.id, action },
          });

          if (!existingPermission) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
          }
        }
        strapi.log.info('Public role permissions configured.');
      }

      // 2. Ensure i18n Locales
      const i18nService = strapi.plugin('i18n')?.service('locales');
      if (i18nService) {
        const existingLocales = await i18nService.find();
        const existingCodes = existingLocales.map((l: any) => l.code);

        const requiredLocales = [
          { code: 'uz', name: "O'zbekcha" },
          { code: 'ru', name: 'Русский (ru)' },
          { code: 'en', name: 'English (en)' },
        ];

        for (const reqLoc of requiredLocales) {
          if (!existingCodes.includes(reqLoc.code)) {
            try {
              await i18nService.create(reqLoc);
            } catch (err) {
              // Ignore
            }
          }
        }
      }

      // 3. Seed Categories & Subcategories if empty
      const catCount = await strapi.db.query('api::category.category').count();
      if (catCount === 0) {
        strapi.log.info('Seeding categories, subcategories & products for 3 languages...');

        const mainCategories = [
          {
            slug: 'videokuzatuv',
            iconName: 'Camera',
            imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9',
            productCount: 42,
            uz: { name: 'Videokuzatuv Tizimlari', description: 'IP kameralar, NVR registratorlar va aksessuarlar' },
            ru: { name: 'Системы Видеонаблюдения', description: 'IP-камеры, NVR-регистраторы и аксессуары' },
            en: { name: 'Video Surveillance Systems', description: 'IP cameras, NVR recorders and accessories' },
            subcategories: [
              {
                slug: 'ip-kameralar',
                iconName: 'Camera',
                uz: { name: 'IP Kameralar', description: 'Yuqori aniqlikdagi tarmoq kameralari' },
                ru: { name: 'IP-Камеры', description: 'Сетевые камеры высокого разрешения' },
                en: { name: 'IP Cameras', description: 'High definition network cameras' },
              },
              {
                slug: 'nvr-registratorlar',
                iconName: 'HardDrive',
                uz: { name: 'NVR Registratorlar', description: 'Tarmoq videoyozuv qurilmalari' },
                ru: { name: 'NVR Регистраторы', description: 'Сетевые видеорегистраторы' },
                en: { name: 'NVR Recorders', description: 'Network video recorders' },
              },
              {
                slug: 'ptz-kameralar',
                iconName: 'Maximize',
                uz: { name: 'PTZ Aylanma Kameralar', description: 'Masofadan boshqariluvchi 360 optik zum kameralar' },
                ru: { name: 'PTZ Поворотные Камеры', description: 'Поворотные камеры с оптическим зумом' },
                en: { name: 'PTZ Speed Dome Cameras', description: 'Pan-tilt-zoom optical speed dome cameras' },
              },
            ],
          },
          {
            slug: 'kirishni-boshqarish',
            iconName: 'ShieldCheck',
            imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827',
            productCount: 28,
            uz: { name: 'Kirishni Boshqarish Tizimlari (SKUD)', description: 'Turniketlar, biometrik skanerlar va kontrollerlar' },
            ru: { name: 'Системы Контроля Доступа (СКУД)', description: 'Турникеты, биометрические сканеры и контроллеры' },
            en: { name: 'Access Control Systems (ACS)', description: 'Turnstiles, biometric scanners and controllers' },
            subcategories: [
              {
                slug: 'turniketlar',
                iconName: 'Shield',
                uz: { name: 'Tripod va Rotor Turniketlar', description: 'Oʻtish joylari uchun avtomatlashtirilgan turniketlar' },
                ru: { name: 'Турникеты и Калитки', description: 'Автоматические турникеты для проходных' },
                en: { name: 'Turnstiles & Speed Gates', description: 'Automated turnstiles and gates' },
              },
              {
                slug: 'biometrik-skanerlar',
                iconName: 'Fingerprint',
                uz: { name: 'Biometrik va Yuzni Tanish Skanerlari', description: 'Barmoq izi va Face ID terminallari' },
                ru: { name: 'Биометрические Терминалы', description: 'Сканнеры отпечатков и терминалы Face ID' },
                en: { name: 'Biometric & Face Terminals', description: 'Fingerprint scanners and Face ID devices' },
              },
            ],
          },
          {
            slug: 'yongin-xavfsizligi',
            iconName: 'Flame',
            imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
            productCount: 19,
            uz: { name: "Yong'in Xavfsizligi", description: 'Datchiklar, xabar beruvchilar va avtomatik oʻchirish tizimlari' },
            ru: { name: 'Пожарная Безопасность', description: 'Датчики, извещатели и системы пожаротушения' },
            en: { name: 'Fire Safety Systems', description: 'Detectors, annunciators and extinguishing systems' },
            subcategories: [
              {
                slug: 'tutun-datchiklari',
                iconName: 'Radio',
                uz: { name: 'Tutun va Issiqlik Datchiklari', description: 'Optik tutun detektorlari' },
                ru: { name: 'Дымовые и Тепловые Датчики', description: 'Оптические извещатели дыма и тепла' },
                en: { name: 'Smoke & Heat Detectors', description: 'Optical smoke and thermal sensors' },
              },
              {
                slug: 'avtomatik-ochirish-tizimlari',
                iconName: 'Droplet',
                uz: { name: 'Avtomatik Oʻchirish Tizimlari', description: 'Gazli va kukunli yongʻin oʻchirish modullari' },
                ru: { name: 'Системы Пожаротушения', description: 'Модули газового и порошкового пожаротушения' },
                en: { name: 'Extinguishing Modules', description: 'Gas and powder fire suppression modules' },
              },
            ],
          },
          {
            slug: 'sanoat-avtomatikasi',
            iconName: 'Cpu',
            imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
            productCount: 35,
            uz: { name: 'Sanoat Avtomatikasi va Nasoslar', description: 'Vertikal nasoslar, festo pnevmatika va manometrlar' },
            ru: { name: 'Промышленная Автоматика и Насосы', description: 'Вертикальные насосы, пневматика Festo и манометры' },
            en: { name: 'Industrial Automation & Pumps', description: 'Vertical pumps, Festo pneumatics and pressure gauges' },
            subcategories: [
              {
                slug: 'vertikal-nasoslar',
                iconName: 'Activity',
                uz: { name: 'Vertikal nasoslar', description: 'Koʻp bosqichli yuqori bosimli vertikal nasoslar' },
                ru: { name: 'Вертикальные насосы', description: 'Многоступенчатые насосы высокого давления' },
                en: { name: 'Vertical Pumps', description: 'Multistage high pressure vertical pumps' },
              },
              {
                slug: 'festo-pnevmatika',
                iconName: 'Cpu',
                uz: { name: 'Festo pnevmatika', description: 'Sanoat klapanlari, pnevmotsilindrlar va klapan orollari' },
                ru: { name: 'Пневматика Festo', description: 'Пневмоцилиндры, клапаны и пневмоострова Festo' },
                en: { name: 'Festo Pneumatics', description: 'Industrial valves, cylinders and manifolds' },
              },
              {
                slug: 'kipia-manometrlar',
                iconName: 'Gauge',
                uz: { name: 'KIPIiA manometrlar', description: 'Sanoat manometrlari va bosim datchiklari' },
                ru: { name: 'Манометры и КИПиА', description: 'Промышленные манометры и датчики давления' },
                en: { name: 'Pressure Gauges & Instrumentation', description: 'Industrial pressure gauges and sensors' },
              },
              {
                slug: 'qozonxona-avtomatikasi',
                iconName: 'Flame',
                uz: { name: 'Qozonxona avtomatikasi', description: 'Qozonxona boshqaruv bloklari va xavfsizlik klapanlari' },
                ru: { name: 'Котельная автоматика', description: 'Блоки управления котельными и предохранительные клапаны' },
                en: { name: 'Boiler Room Automation', description: 'Boiler control units and safety valves' },
              },
            ],
          },
        ];

        for (const mainCat of mainCategories) {
          const parentEntriesByLocale: Record<string, any> = {};

          for (const loc of ['uz', 'ru', 'en']) {
            const locData = (mainCat as any)[loc];
            const createdParent = await strapi.entityService.create('api::category.category', {
              data: {
                slug: mainCat.slug,
                name: locData.name,
                description: locData.description,
                iconName: mainCat.iconName,
                imageUrl: mainCat.imageUrl,
                productCount: mainCat.productCount,
                locale: loc,
                publishedAt: new Date(),
              },
            });
            parentEntriesByLocale[loc] = createdParent;
          }

          // Seed subcategories with parent link
          if (mainCat.subcategories && Array.isArray(mainCat.subcategories)) {
            for (const sub of mainCat.subcategories) {
              for (const loc of ['uz', 'ru', 'en']) {
                const subLocData = (sub as any)[loc];
                await strapi.entityService.create('api::category.category', {
                  data: {
                    slug: sub.slug,
                    name: subLocData.name,
                    description: subLocData.description,
                    iconName: sub.iconName,
                    imageUrl: mainCat.imageUrl,
                    productCount: 10,
                    parent: parentEntriesByLocale[loc]?.id,
                    locale: loc,
                    publishedAt: new Date(),
                  },
                });
              }
            }
          }
        }

        // Seed Products
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
          for (const loc of ['uz', 'ru', 'en']) {
            const locData = (prod as any)[loc];
            await strapi.entityService.create('api::product.product', {
              data: {
                slug: prod.slug,
                sku: prod.sku,
                title: locData.title,
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
          }
        }
        strapi.log.info('Seeded all categories, subcategories and products for uz, ru, en!');
      }
    } catch (error) {
      strapi.log.error('Bootstrap error:', error);
    }
  },
};
