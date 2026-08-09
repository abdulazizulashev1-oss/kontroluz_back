export default {
  collectionName: 'components_shared_seos',
  info: {
    displayName: 'SEO',
    icon: 'search',
    description: 'SEO Meta information',
  },
  options: {},
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    title: {
      type: 'string',
      required: true,
      pluginOptions: {
        i18n: {
          localized: true,
        },
      },
    },
    description: {
      type: 'text',
      required: true,
      pluginOptions: {
        i18n: {
          localized: true,
        },
      },
    },
    keywords: {
      type: 'json',
      pluginOptions: {
        i18n: {
          localized: true,
        },
      },
    },
    canonicalUrl: {
      type: 'string',
    },
    ogImage: {
      type: 'string',
    },
  },
};
