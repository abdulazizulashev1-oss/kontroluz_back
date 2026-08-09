import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::order.order', () => ({
  async create(ctx) {
    const { data } = ctx.request.body;

    if (!data || typeof data !== 'object') {
      return ctx.badRequest('Missing request data body');
    }

    // 1. Auto-generate unique order number if not provided
    if (!data.orderNumber) {
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      data.orderNumber = `ORD-${datePart}-${randomPart}`;
    }

    // 2. Validate customer details
    if (!data.customerName || !data.customerPhone) {
      return ctx.badRequest('customerName and customerPhone are required');
    }

    // 3. Ensure items array exists
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return ctx.badRequest('Cart items cannot be empty');
    }

    // 4. Calculate or sanitize amounts if necessary
    let calculatedSubtotal = 0;
    for (const item of data.items) {
      const itemPrice = Number(item.price) || 0;
      const itemQty = Number(item.quantity) || 1;
      calculatedSubtotal += itemPrice * itemQty;
    }

    if (!data.subtotal) {
      data.subtotal = calculatedSubtotal;
    }

    if (data.tax === undefined) {
      data.tax = Math.round(data.subtotal * 0.12); // 12% QQS
    }

    if (data.shippingFee === undefined) {
      data.shippingFee = data.subtotal > 5000000 ? 0 : 50000;
    }

    if (!data.totalAmount) {
      data.totalAmount = Number(data.subtotal) + Number(data.tax) + Number(data.shippingFee);
    }

    // 5. Default status
    if (!data.status) {
      data.status = 'NEW';
    }

    ctx.request.body.data = data;
    return await super.create(ctx);
  },
}));
