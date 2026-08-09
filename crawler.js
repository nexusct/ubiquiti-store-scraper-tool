import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import url from 'url';
import pLimit from 'p-limit';

import config from './config.js';
import * as utils from './utils.js';

/**
 * Main crawler class
 */
export class UbiquitiCrawler {
  constructor() {
    this.visitedUrls = new Set();
    this.urlsToVisit = [];
    this.limit = pLimit(config.crawlSettings.concurrency);
    this.browser = null;
    this.totalContentText = '';
    this.downloadedAssets = new Set();
  }

  /**
   * Initializes the crawler
   */
  async init() {
    // Create output directory
    await utils.ensureDir(config.outputDir);
    await utils.ensureDir(path.join(config.outputDir, 'pages'));
    await utils.ensureDir(path.join(config.outputDir, 'assets'));

    // Create subdirectories for different asset types
    await utils.ensureDir(path.join(config.outputDir, 'assets', 'images'));
    await utils.ensureDir(path.join(config.outputDir, 'assets', 'videos'));
    await utils.ensureDir(path.join(config.outputDir, 'assets', 'pdfs'));
    await utils.ensureDir(path.join(config.outputDir, 'assets', 'styles'));
    await utils.ensureDir(path.join(config.outputDir, 'assets', 'scripts'));
    await utils.ensureDir(path.join(config.outputDir, 'assets', 'fonts'));

    // Create all_content.txt file
    this.allContentPath = path.join(config.outputDir, 'all_content.txt');
    await fs.writeFile(this.allContentPath, '', 'utf8');

    // Track downloaded assets to avoid duplicates
    this.downloadedAssets = new Set();

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

      // Process the page and extract assets
      await this.processPage(url);

      pageCount++;
      console.log(`Processed ${pageCount} pages. Queue size: ${this.urlsToVisit.length}`);

      // Add a delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, config.crawlSettings.delay));
    }

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

      // Extract and save page info
      const pageTitle = await page.title();
      const sanitizedTitle = utils.sanitizeName(pageTitle) || 'untitled';
      const pageDir = path.join(config.outputDir, 'pages', sanitizedTitle);
      await utils.ensureDir(pageDir);

      // Save page HTML
      await fs.writeFile(path.join(pageDir, 'page.html'), html, 'utf8');

      // Take screenshot
      await page.screenshot({
        path: path.join(pageDir, 'screenshot.png'),
        fullPage: false
      });

      // Extract all asset URLs from the page
      await this.extractAndDownloadAssets(html, url);

      // Extract links for further crawling
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

        // If the link matches an include pattern, add it to the queue
        const shouldInclude = config.patterns.include.some(pattern =>
          link.includes(pattern) || link === config.baseUrl
        );

        if (shouldInclude) {
          if (!this.visitedUrls.has(link) && !this.urlsToVisit.includes(link)) {
            this.urlsToVisit.push(link);
          }
        }
      }

      // Append to all_content.txt
      const contentEntry = `
====================================
${pageTitle}
====================================
URL: ${url}
====================================
`;
      await utils.appendToFile(this.allContentPath, contentEntry);

      await page.close();
    } catch (error) {
      console.error(`Error processing page ${url}:`, error.message);
    }
  }

  /**
   * Extracts and downloads all assets from a page
   * @param {string} html - HTML content of the page
   * @param {string} baseUrl - Base URL of the page
   */
  async extractAndDownloadAssets(html, baseUrl) {
    // Download images
    await this.downloadAssetType(html, baseUrl, config.fileTypes.images, 'images', 'image');

    // Download videos
    await this.downloadAssetType(html, baseUrl, config.fileTypes.videos, 'videos', 'video');

    // Download PDFs
    await this.downloadAssetType(html, baseUrl, config.fileTypes.pdfs, 'pdfs', 'document');

    // Download CSS files
    await this.downloadAssetType(html, baseUrl, config.fileTypes.styles, 'styles', 'style');

    // Download JavaScript files
    await this.downloadAssetType(html, baseUrl, config.fileTypes.scripts, 'scripts', 'script');

    // Download fonts
    await this.downloadAssetType(html, baseUrl, config.fileTypes.fonts, 'fonts', 'font');
  }

  /**
   * Downloads assets of a specific type
   * @param {string} html - HTML content
   * @param {string} baseUrl - Base URL
   * @param {string[]} extensions - File extensions to look for
   * @param {string} assetType - Type of asset (for directory naming)
   * @param {string} assetPrefix - Prefix for downloaded files
   */
  async downloadAssetType(html, baseUrl, extensions, assetType, assetPrefix) {
    const links = utils.extractLinks(html, extensions, baseUrl);

    for (const assetUrl of links) {
      // Skip if already downloaded
      if (this.downloadedAssets.has(assetUrl)) {
        continue;
      }

      try {
        // Generate a unique filename based on URL
        const urlObj = new URL(assetUrl);
        const fileName = utils.sanitizeName(path.basename(urlObj.pathname)) ||
                         `${assetPrefix}_${Date.now()}${path.extname(urlObj.pathname)}`;
        const assetPath = path.join(config.outputDir, 'assets', assetType, fileName);

        await utils.downloadFile(assetUrl, assetPath);
        this.downloadedAssets.add(assetUrl);
        console.log(`Downloaded ${assetType}: ${fileName}`);
      } catch (error) {
        console.error(`Error downloading ${assetType} from ${assetUrl}:`, error.message);
      }
    }
  }
}
