const strapiFactory = require('@strapi/strapi');

async function resetPassword() {
  const strapi = await strapiFactory().load();
  try {
    const email = 'jaloliddina98@gmail.com';
    const newPassword = 'Password2026!'; // Standard strong password

    const user = await strapi.query('admin::user').findOne({ where: { email } });
    if (!user) {
      console.log(`User ${email} not found!`);
      return;
    }

    const hashedPassword = await strapi.admin.services.auth.hashPassword(newPassword);
    await strapi.query('admin::user').update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`\n========================================`);
    console.log(`✅ Admin paroli muvaffaqiyatli yangilandi!`);
    console.log(`Email:    ${email}`);
    console.log(`Parol:    ${newPassword}`);
    console.log(`Admin URL: http://localhost:1337/admin`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Xatolik:', err);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

resetPassword();
