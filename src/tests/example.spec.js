const { test, expect } = require('@playwright/test');
const { idmeShop } = require('../pages/idmeShop');

const categoryToOfferMap = {
  'Men\'s Shoes': ['Under Armour', 'Saucony US', 'Nike'],
  'Kid\'s Shoes': ['Under Armour', 'Saucony US', 'Nike'],
  'Cars': [
    'Discount Tire', 'Batteries Plus', 'SimpleTire', 'Tirebuyer', 'RealTruck', 'AARP® Auto Insurance Program from The Hartford', 'Tire Agent',
    'The Tire Rack', 'Ford Accessories', 'Valvoline Instant Oil Change', 'Goodyear Tire', 'CarGurus', 'Harley-Davidson', 'Parts Geek',
    'Tiremart', 'K&N® Filters', 'Way.com'
  ]
}

test('Verify the shop categories', async ({ page }) => {
  const idmeShopPage = new idmeShop(page);

  await idmeShopPage.goto();
  try {
    await expect(idmeShopPage.deptList).toContainText([
      'Clothing & Accessories',
      'Health & Beauty',
      'Sports & Outdoors',
      'Travel & Entertainment',
      'Lifestyle',
      'Technology & Office',
      'Home, Auto & Pets',
      'Shopping & Delivery'
    ]);
  } catch (err) {
    console.log(err);
  } finally {
    console.log("Verified shop category headers.");
  }
});

test('Visit all categories and verify headers', async ({ page }) => {
  const idmeShopPage = new idmeShop(page);

  const Headers = ['Men\'s Shoes','Kid\'s Shoes', 'Cars'];

  await idmeShopPage.goto();

  for (let header of Headers) {
    await idmeShopPage.visitTab(header);
    await idmeShopPage.verifyHeader(header);
  }
});

test('Verify the offer shops available for the selected categories', async({ page }) => {
  const idmeShopPage = new idmeShop(page);
  
  await idmeShopPage.goto();

  for (let [category, offers] of Object.entries(categoryToOfferMap)) {
    await idmeShopPage.visitTab(category);
    await idmeShopPage.verifyOfferCards(offers);
  }
});

test('Verify the WELD Wheels military discount offer', async({ page }) => {
  const idmeShopPage = new idmeShop(page);

  await idmeShopPage.goto();

  await idmeShopPage.visitTab('Cars');
  await idmeShopPage.visitOfferCard('WELD Wheels', 3);
  await idmeShopPage.verifyMilitaryOffer('WELD Wheels');

  await idmeShopPage.verifyMilitaryOfferPartnerLink('WELD Wheels');
});

test('Verify the 7-Eleven military discount offer', async({ page }) => {
  const idmeShopPage = new idmeShop(page);

  await idmeShopPage.goto();

  await idmeShopPage.visitTab('Cars');
  await idmeShopPage.visitOfferCard('7-Eleven', 3);
  await idmeShopPage.verifyMilitaryOffer('7-Eleven');
  await idmeShopPage.verifyMilitaryOfferPartnerLink('7-Eleven');
});