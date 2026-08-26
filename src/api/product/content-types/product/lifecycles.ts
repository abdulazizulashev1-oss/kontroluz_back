async function triggerRevalidation(model: string, entry: any) {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const secret = process.env.REVALIDATE_SECRET || 'kontrol_secret_key_2026';
    const url = `${frontendUrl}/api/revalidate?secret=${secret}`;

    // Use native fetch or Node http
    if (typeof fetch !== 'undefined') {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, entry }),
      }).catch(() => { });
    }
  } catch (err) {
    // Revalidation errors should not break backend persistence
  }
}

export default {
  async afterCreate(event: any) {
    const { result } = event;
    await triggerRevalidation('product', result);
  },

  async afterUpdate(event: any) {
    const { result } = event;
    await triggerRevalidation('product', result);
  },

  async afterDelete(event: any) {
    const { result } = event;
    await triggerRevalidation('product', result);
  },
};
