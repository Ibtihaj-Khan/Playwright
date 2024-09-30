const { expect } = require('@playwright/test');

exports.idmeShop = class idmeShop {

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    /**
     * Selectors
     */
    this.page = page;
    this.shopTab = page.locator("a[href='https://shop.id.me?&utm_campaign=B2C&utm_source=nav_menu&utm_medium=web']");

    this.deptList = page.locator('.desktop_nav-departments-list .dropdown_title');
    
    //MAIN DROPDOWN ELEMENTS//
    //Clothing headers + dropdown elements
    this.shopClothingHeader = page.locator('//li/div[text()[contains(., "Clothing & Accessories")]]');
    this.clothingShoes = page.locator('div.category-list>a[data-target="shoes"]');
    
    //Home, Auto, Pets dropdown elements
    this.shopHomeAutoHeader = page.locator('//li/div[text()[contains(., "Home, Auto & Pets")]]');
    this.homeAuto_Automotive = page.locator('div.category-list>a[data-target="automotive"]');

    //DROPDOWN SUBELEMENTS//
    //Shoes Subelements
    this.shoes_Men = page.locator(`${'//div[@class="subcategory"]/span[contains(text(), "Men\'s Shoes")]'}`);
    this.shoes_Kids = page.locator(`${'//div[@class="subcategory"]/span[contains(text(), "Kid\'s Shoes")]'}`);

    //Automotive Dropdown Subelements
    this.automotive_Cars = page.locator(`${'//div[@class="subcategory"]/span[contains(text(), "Cars")]'}`);

    //CHILD PAGE ELEMENTS//
    //Generic Child Page Selectors
    this.pageTitle = page.locator('div.title'); 
    this.offerStoreName = page.locator('span.store-name');
    this.offerStoreNextArrow = page.locator('.next>a[rel="next"]');

    //Military Discount Card Elements
    this.milCardOfferText = page.locator('div.group-military+div.card-content div.card-text>.title');
    this.milCardOfferLink = page.locator('div.group-military+div.card-content>a.button');
  }
  /**
   * Commands
   */
  /**
   * Script used to visit the shop page.
   */
  async goto() {
    await this.page.goto('https://www.id.me/');
    await this.shopTab.nth(0).click();
  }
  /**
   * Script used to visit specific sub tabs of the shop Page.
   * @param {String} tabToVisit is the tab we want to visit.
   */
  async visitTab(tabToVisit) {
    switch (tabToVisit) {
      case "Men\'s Shoes":
        await this.shopClothingHeader.hover();

        await this.clothingShoes.hover();

        await this.shoes_Men.hover();
        await this.shoes_Men.click();
        break;
      
      case "Kid\'s Shoes":
        await this.shopClothingHeader.hover();

        await this.clothingShoes.hover();
        await this.shoes_Kids.hover();
        await this.shoes_Kids.click();
        break;

      case "Cars":
        await this.shopHomeAutoHeader.hover();
        await this.homeAuto_Automotive.hover();

        await this.automotive_Cars.hover();
        await this.automotive_Cars.click();
        break;

      default:
        console.log("No Tab Specified");
    }
  }
/**
 * Basic Script used to verify the header of the child page you're on.
 * @param {String} headerText 
 */
  async verifyHeader(headerText) {
    try {
      await expect(this.pageTitle).toHaveText(headerText);
    } catch(err) {
      console.error(err);
    } finally {
      console.log(`Completed checking header for ${headerText}`);
    }
  }
  /**
   * Script to verify a child page's offer cards.
   * @param {Array} offerList is fromm the map of the category -> Array of the offer companies.
   * For this simple setup we will only be testing the first page.
   */
  async verifyOfferCards(offerList) {
    let totalOffers = offerList.length;
    let nextPages = 0;

    //There are 16 offers per page. If that number is greater, we must determine how many pages to scroll past.
    if (totalOffers > 16) {
      if (totalOffers % 16 == 0) {
        nextPages = Math.floor(totalOffers / 16) - 1;
      } else {
        nextPages = Math.floor(totalOffers / 16);
      }
    }

    //If we have multiple pages of info, we need to verify the fist page, then click next and verify an appropriate numbmer of times.
    //First, check the first page being the first page (index 0 -> 15).
    await expect(this.offerStoreName).toContainText(offerList.slice(0, 16));
    console.log(offerList.slice(0,16));
    if (nextPages > 0) {
      for (let i = 0; i < nextPages; i++) {
        await this.offerStoreNextArrow.click();
        console.log(offerList.slice((16 * (i+1)), (32 * (i+1))));
        await expect(this.offerStoreName).toContainText(offerList.slice((16 * (i+1)), (32 * (i+1))));
      }
    }
  }
  /**
   * For now i'll just set it up in such a way where we click on one from the first page for the demo vs dealing with paginating.
   * @param {String} offer is the card we want to visit.
   * @param {Number} page is the page that the offer is on.
   */
  async visitOfferCard(offer, page) {
    /**
     * I had a couple options when clicking the pagination buttons, we could either click forward a few times (page - 1 times)
     * but I wanted to also demonstrate creating dynamic selectors. It's actually somewhat not optimum here because not all the pages appear
     * at once, so its likely best to use the click forward option.
     */

    await this.page.locator(`//span[@class="button page"]/a[contains(text(),'${page}')]`).click();
    await this.page.locator(`//span[@class="store-name"][contains(text(),'${offer}')]`).click();
  }
  /**
   * Script used to verify the offer card (specifically for Military Offer Cards).
   * @param {String} vendor is the vendor we are visiting to verify their discount(s)/Offers.
   */
  async verifyMilitaryOffer(vendor) {
    const vendorToDiscountMap = {
      "WELD Wheels": "10% Off for Military",
      "7-Eleven": "Save an EXTRA 5¢/gal for Military"
    }

    await expect(this.milCardOfferText).toHaveText(vendorToDiscountMap[vendor]);
    console.log(`Verifying military card text for ${vendor} to be ${vendorToDiscountMap[vendor]}.`)
  }
  /**
   * Script used to verify the link to the partner. 
   */
  async verifyMilitaryOfferPartnerLink(vendor) {
    const vendorToLinkMap = {
      "WELD Wheels": "https://www.weldwheels.com/?afsrc=1&idme_shop_redirect=true",
      "7-Eleven": "https://www.7-eleven.com/7rewards"
    }

    //Click on the partner offer, then wait for redirections. Afterwards, verify page url. Here we are utilizing multiple tabs.
    const [newTab] = await Promise.all([
      this.page.waitForEvent('popup'),
      this.milCardOfferLink.click()
    ])

    console.log(`Verifying the partner referral URL to be ${vendorToLinkMap[vendor]}.`)
    await newTab.waitForURL(vendorToLinkMap[vendor]);
    await expect(newTab).toHaveURL(vendorToLinkMap[vendor]);
  }
};