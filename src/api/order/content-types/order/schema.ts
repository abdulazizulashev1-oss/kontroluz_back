export default {
  kind: 'collectionType',
  collectionName: 'orders',
  info: {
    singularName: 'order',
    pluralName: 'orders',
    displayName: 'Order',
    description: 'Cart and Checkout orders',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {},
  attributes: {
    orderNumber: {
      type: 'string',
      required: true,
      unique: true,
    },
    customerName: {
      type: 'string',
      required: true,
    },
    customerPhone: {
      type: 'string',
      required: true,
    },
    customerEmail: {
      type: 'string',
    },
    company: {
      type: 'string',
    },
    shippingAddress: {
      type: 'text',
    },
    paymentMethod: {
      type: 'enumeration',
      enum: ['cash', 'click', 'payme', 'invoice'],
      default: 'cash',
    },
    items: {
      type: 'json',
      required: true,
    },
    subtotal: {
      type: 'biginteger',
      required: true,
    },
    tax: {
      type: 'biginteger',
      default: '0',
    },
    shippingFee: {
      type: 'biginteger',
      default: '0',
    },
    totalAmount: {
      type: 'biginteger',
      required: true,
    },
    notes: {
      type: 'text',
    },
    status: {
      type: 'enumeration',
      enum: ['NEW', 'PENDING_PAYMENT', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'],
      default: 'NEW',
    },
  },
};
