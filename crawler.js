import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import url from 'url';
import pLimit from 'p-limit';

import config from './config.js';
import * as utils from './utils.js';
import { ProductParser } from './product-parser.js';

/**
 * Main crawler class
 */
export class UbiquitiCrawler {
  constructor() {
    this.visitedUrls = new Set();
    this.productUrls = new Set();
    this.urlsToVisit = [];
    this.limit = pLimit(config.crawlSettings.concurrency);
    this.browser = null;
    this.totalContentText = '';
  }

  /**
   * Initializes the crawler
   */
  async init() {
    // Create output directory
    await utils.ensureDir(config.outputDir);
    await utils.ensureDir(path.join(config.outputDir, 'products'));
    
    // Create all_content.txt file
    this.allContentPath = path.join(config.outputDir, 'all_content.txt');
    await fs.writeFile(this.allContentPath, '', 'utf8');
    
    // Launch browser
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('Crawler initialized.');
  }

  /**
   * Starts the crawling process
   */
  async start() {
    console.log(`Starting to crawl ${config.baseUrl}`);
    
    // Add the starting URL to the queue
    this.urlsToVisit.push(config.baseUrl);
    
    let pageCount = 0;
    
    // Process URLs until the queue is empty or we reach the maximum page count
    while (this.urlsToVisit.length > 0 && pageCount < config.maxPages) {
      const url = this.urlsToVisit.shift();
      
      // Skip if we've already visited this URL
      if (this.visitedUrls.has(url)) {
        continue;
      }
      
      // Mark as visited
      this.visitedUrls.add(url);
      
      // Process the page
      await this.processPage(url);
      
      pageCount++;
      console.log(`Processed ${pageCount} pages. Queue size: ${this.urlsToVisit.length}`);
      
      // Add a delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, config.crawlSettings.delay));
    }
    
    // Process all discovered product pages
    console.log(`Found ${this.productUrls.size} product pages. Processing them...`);
    
    const productPromises = [...this.productUrls].map(url => 
      this.limit(() => this.processProductPage(url))
    );
    
    await Promise.all(productPromises);
    
    console.log('Crawling complete.');
    
    // Close the browser
    await this.browser.close();
  }

  /**
   * Processes a single page
   * @param {string} url - URL of the page to process
   */
  async processPage(url) {
    try {
      console.log(`Processing page: ${url}`);
      
      const page = await this.browser.newPage();
      
      // Set user agent
      await page.setUserAgent(config.crawlSettings.userAgent);
      
      // Set timeout
      await page.setDefaultNavigationTimeout(config.crawlSettings.timeout);
      
      // Navigate to URL
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Get page content
      const html = await page.content();
      
      // Extract links
      const links = await page.evaluate(() => {
        const urls = [];
        const linkElements = document.querySelectorAll('a');
        
        for (const link of linkElements) {
          if (link.href) {
            urls.push(link.href);
          }
        }
        
        return urls;
      });
      
      // Process links
      for (const link of links) {
        // Skip external links
        if (!link.startsWith(config.baseUrl)) {
          continue;
        }
        
        // Skip excluded patterns
        if (config.patterns.exclude.some(pattern => link.includes(pattern))) {
          continue;
        }
        
        // Check if this looks like a product page
        if (link.includes('/products/')) {
          this.productUrls.add(link);
          continue;
        }
        
        // If the link matches an include pattern, add it to the queue
        if (config.patterns.include.some(pattern => link.includes(pattern))) {
          if (!this.visitedUrls.has(link) && !this.urlsToVisit.includes(link)) {
            this.urlsToVisit.push(link);
          }
        }
      }
      
      await page.close();
    } catch (error) {
      console.error(`Error processing page ${url}:`, error.message);
    }
  }

  /**
   * Processes a product page
   * @param {string} url - URL of the product page
   */
  async processProductPage(url) {
    try {
      console.log(`Processing product page: ${url}`);
      
      const page = await this.browser.newPage();
      
      // Set user agent
      await page.setUserAgent(config.crawlSettings.userAgent);
      
      // Set timeout
      await page.setDefaultNavigationTimeout(config.crawlSettings.timeout);
      
      // Navigate to URL
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Get page content
      const html = await page.content();
      
      // Extract product information using the ProductParser
      const product = ProductParser.extractProductInfo(html, url);
      
      // Generate markdown content
      const markdownContent = ProductParser.toMarkdown(product);
      
      // Determine product category
      const category = utils.determineCategory(product.name, url, config.categories);
      
      // Sanitize names for use in paths
      const sanitizedCategory = utils.sanitizeName(category);
      const sanitizedProduct = utils.sanitizeName(product.name);
      
      // Create product directory
      const productDir = path.join(
        config.outputDir, 
        'products', 
        sanitizedCategory, 
        sanitizedProduct
      );
      
      await utils.ensureDir(productDir);
      await utils.ensureDir(path.join(productDir, 'images'));
      await utils.ensureDir(path.join(productDir, 'videos'));
      await utils.ensureDir(path.join(productDir, 'pdfs'));
      
      // Save product information
      await fs.writeFile(path.join(productDir, 'product_info.md'), markdownContent, 'utf8');
      
      // Append to all_content.txt
      const allContentEntry = `
====================================
${category} - ${product.name}
====================================
${product.description}

Price: ${product.price}

Features:
${product.features.map(feature => `- ${feature}`).join('\n')}

URL: ${url}
====================================
`;
      await utils.appendToFile(this.allContentPath, allContentEntry);
      
      // Take a screenshot of the product page
      await page.screenshot({ 
        path: path.join(productDir, 'screenshot.png'),
        fullPage: false 
      });
      
      // Extract and download images
      const imageLinks = utils.extractLinks(html, config.fileTypes.images, url);
      
      for (let i = 0; i < imageLinks.length; i++) {
        const imageUrl = imageLinks[i];
        const imageName = `image_${i + 1}${path.extname(imageUrl)}`;
        const imagePath = path.join(productDir, 'images', imageName);
        
        await utils.downloadFile(imageUrl, imagePath);
        console.log(`Downloaded image: ${imageName}`);
      }
      
      // Extract and download videos
      const videoLinks = utils.extractLinks(html, config.fileTypes.videos, url);
      
      for (let i = 0; i < videoLinks.length; i++) {
        const videoUrl = videoLinks[i];
        const videoName = `video_${i + 1}${path.extname(videoUrl)}`;
        const videoPath = path.join(productDir, 'videos', videoName);
        
        await utils.downloadFile(videoUrl, videoPath);
        console.log(`Downloaded video: ${videoName}`);
      }
      
      // Extract and download PDFs
      const pdfLinks = utils.extractLinks(html, config.fileTypes.pdfs, url);
      
      for (let i = 0; i < pdfLinks.length; i++) {
        const pdfUrl = pdfLinks[i];
        const pdfName = `document_${i + 1}${path.extname(pdfUrl)}`;
        const pdfPath = path.join(productDir, 'pdfs', pdfName);
        
        await utils.downloadFile(pdfUrl, pdfPath);
        console.log(`Downloaded PDF: ${pdfName}`);
      }
      
      await page.close();
    } catch (error) {
      console.error(`Error processing product page ${url}:`, error.message);
    }
  }
}
