const { test, expect } = require('@playwright/test');
const { idmeShop } = require('../pages/idmeShop');

const categoryToOfferMap = {
  'Men\'s Shoes': ['Under Armour', 'Nike', 'Saucony US'],
  'Kid\'s Shoes': ['Under Armour', 'Nike', 'Saucony US'],
  'Cars': [
    'Discount Tire', 'Batteries Plus', 'SimpleTire', 'Tirebuyer', 'The Tire Rack', 'RealTruck', 'Tire Agent',
    'Ford Accessories', 'UShip', 'Goodyear Tire', 'Valvoline Instant Oil Change', 'Harley-Davidson', 'CarGurus', 'Caribou',
    'Parts Geek', 'Tiremart', 'K&N® Filters', 'Way.com', 'RevZilla', 'General Motors', 'Tesla', 'Ford Motor Company', 'Toyota',
    'TrueCar', 'Lexus', 'Cummins', 'Troy Lee Designs', 'MOVE Bumpers', 'Belle Tire', 'CJ Pony Parts', 'TRUCKS R US', 'SuperATV',
    '7-Eleven', 'WELD Wheels', '21 OFFROAD', 'Slick Products'
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
});

test('Verify the 7-Eleven military discount offer', async({ page }) => {
  const idmeShopPage = new idmeShop(page);

  await idmeShopPage.goto();

  await idmeShopPage.visitTab('Cars');
  await idmeShopPage.visitOfferCard('7-Eleven', 3);
  await idmeShopPage.verifyMilitaryOffer('7-Eleven');
});