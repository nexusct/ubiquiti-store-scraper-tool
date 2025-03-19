import * as cheerio from 'cheerio';

/**
 * Extracts product specifications from a product page
 */
export class ProductParser {
  /**
   * Extracts detailed product information from HTML content
   * @param {string} html - HTML content of the product page
   * @param {string} url - URL of the product page
   * @returns {Object} Product information object
   */
  static extractProductInfo(html, url) {
    const $ = cheerio.load(html);
    
    // Basic product info
    const product = {
      name: this.extractProductName($),
      description: this.extractProductDescription($),
      price: this.extractProductPrice($),
      specifications: this.extractProductSpecifications($),
      features: this.extractProductFeatures($),
      url: url
    };
    
    return product;
  }
  
  /**
   * Extracts the product name
   * @param {CheerioStatic} $ - Cheerio instance
   * @returns {string} Product name
   */
  static extractProductName($) {
    // Try different selectors for product name
    const selectors = [
      'h1.product-title',
      'h1.product-name',
      'h1.product_title',
      'h1.product-single__title',
      'h1'
    ];
    
    for (const selector of selectors) {
      const name = $(selector).first().text().trim();
      if (name) {
        return name;
      }
    }
    
    // Fallback to title tag
    const title = $('title').text().trim().replace(/\\s*[\\-|]\\s*Ubiquiti.*$/i, '');
    return title || 'Unknown Product';
  }
  
  /**
   * Extracts the product description
   * @param {CheerioStatic} $ - Cheerio instance
   * @returns {string} Product description
   */
  static extractProductDescription($) {
    // Try different selectors for product description
    const selectors = [
      '.product-description',
      '.product-details__description',
      '.product-single__description',
      '.product__description',
      'meta[name="description"]'
    ];
    
    for (const selector of selectors) {
      let desc;
      
      if (selector.startsWith('meta')) {
        desc = $(selector).attr('content');
      } else {
        desc = $(selector).text();
      }
      
      if (desc && desc.trim()) {
        return desc.trim();
      }
    }
    
    return '';
  }
  
  /**
   * Extracts the product price
   * @param {CheerioStatic} $ - Cheerio instance
   * @returns {string} Product price
   */
  static extractProductPrice($) {
    // Try different selectors for product price
    const selectors = [
      '.product-price',
      '.price',
      '.product__price',
      'meta[property="product:price:amount"]',
      '[data-product-price]'
    ];
    
    for (const selector of selectors) {
      let price;
      
      if (selector.startsWith('meta')) {
        price = $(selector).attr('content');
      } else {
        price = $(selector).first().text();
      }
      
      if (price && price.trim()) {
        return price.trim();
      }
    }
    
    return 'Price not available';
  }
  
  /**
   * Extracts product specifications
   * @param {CheerioStatic} $ - Cheerio instance
   * @returns {Object} Product specifications as key-value pairs
   */
  static extractProductSpecifications($) {
    const specs = {};
    
    // Look for spec tables
    const specSelectors = [
      '.product-specifications table',
      '.specifications table',
      '.product-specs table',
      '.specs-table',
      'table.specifications'
    ];
    
    for (const selector of specSelectors) {
      const $table = $(selector);
      
      if ($table.length > 0) {
        // Extract specs from table rows
        $table.find('tr').each((i, row) => {
          const $cells = $(row).find('td, th');
          
          if ($cells.length >= 2) {
            const key = $($cells[0]).text().trim();
            const value = $($cells[1]).text().trim();
            
            if (key && value) {
              specs[key] = value;
            }
          }
        });
        
        // If we found specs, return them
        if (Object.keys(specs).length > 0) {
          return specs;
        }
      }
    }
    
    // Look for spec lists (dl/dt/dd pattern)
    $('dl').each((i, list) => {
      const $terms = $(list).find('dt');
      const $defs = $(list).find('dd');
      
      $terms.each((j, term) => {
        const key = $(term).text().trim();
        const value = $($defs[j]).text().trim();
        
        if (key && value) {
          specs[key] = value;
        }
      });
    });
    
    return specs;
  }
  
  /**
   * Extracts product features
   * @param {CheerioStatic} $ - Cheerio instance
   * @returns {string[]} Array of product features
   */
  static extractProductFeatures($) {
    const features = [];
    
    // Look for feature lists
    const featureSelectors = [
      '.product-features ul li',
      '.features ul li',
      '.product-highlights li',
      '.key-features li'
    ];
    
    for (const selector of featureSelectors) {
      const $features = $(selector);
      
      if ($features.length > 0) {
        $features.each((i, feature) => {
          const text = $(feature).text().trim();
          if (text) {
            features.push(text);
          }
        });
        
        // If we found features, return them
        if (features.length > 0) {
          return features;
        }
      }
    }
    
    return features;
  }
  
  /**
   * Converts product information to Markdown format
   * @param {Object} product - Product information object
   * @returns {string} Markdown text
   */
  static toMarkdown(product) {
    let markdown = `# ${product.name}\n\n`;
    
    if (product.price && product.price !== 'Price not available') {
      markdown += `**Price**: ${product.price}\n\n`;
    }
    
    if (product.description) {
      markdown += `## Description\n\n${product.description}\n\n`;
    }
    
    if (product.features && product.features.length > 0) {
      markdown += `## Features\n\n`;
      for (const feature of product.features) {
        markdown += `- ${feature}\n`;
      }
      markdown += '\n';
    }
    
    if (product.specifications && Object.keys(product.specifications).length > 0) {
      markdown += `## Specifications\n\n`;
      for (const [key, value] of Object.entries(product.specifications)) {
        markdown += `- **${key}**: ${value}\n`;
      }
      markdown += '\n';
    }
    
    markdown += `**Product URL**: ${product.url}\n`;
    
    return markdown;
  }
}
