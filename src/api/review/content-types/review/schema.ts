export default {
  kind: 'collectionType',
  collectionName: 'reviews',
  info: {
    singularName: 'review',
    pluralName: 'reviews',
    displayName: 'Review',
    description: 'Product Reviews',
  },
  options: {
    draftAndPublish: true,
  },
  pluginOptions: {},
  attributes: {
    product: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::product.product',
      inversedBy: 'reviews',
    },
    author: {
      type: 'string',
      required: true,
    },
    rating: {
      type: 'integer',
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: 'text',
      required: true,
    },
    date: {
      type: 'date',
    },
  },
};
