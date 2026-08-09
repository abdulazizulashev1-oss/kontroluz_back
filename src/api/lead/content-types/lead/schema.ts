export default {
  kind: 'collectionType',
  collectionName: 'leads',
  info: {
    singularName: 'lead',
    pluralName: 'leads',
    displayName: 'Lead',
    description: 'Order Requests and B2B Leads',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {},
  attributes: {
    clientName: {
      type: 'string',
      required: true,
    },
    phone: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
    },
    company: {
      type: 'string',
    },
    category: {
      type: 'string',
    },
    message: {
      type: 'text',
    },
    objectType: {
      type: 'string',
    },
    areaSqM: {
      type: 'integer',
    },
    estimatedPriceMin: {
      type: 'biginteger',
    },
    estimatedPriceMax: {
      type: 'biginteger',
    },
    status: {
      type: 'enumeration',
      enum: ['NEW', 'CONTACTED', 'COMPLETED', 'CANCELLED'],
      default: 'NEW',
    },
  },
};
