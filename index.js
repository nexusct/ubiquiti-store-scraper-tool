#!/usr/bin/env node

import { UbiquitiCrawler } from './crawler.js';
import config from './config.js';

/**
 * Main entry point for the application
 */
async function main() {
  console.log('====================================');
  console.log('Ubiquiti Store Scraper Tool');
  console.log('====================================');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Max Pages: ${config.maxPages}`);
  console.log(`Output Directory: ${config.outputDir}`);
  console.log('====================================');
  
  try {
    // Create crawler instance
    const crawler = new UbiquitiCrawler();
    
    // Initialize crawler
    await crawler.init();
    
    // Start crawling
    await crawler.start();
    
    console.log('====================================');
    console.log('Crawling complete!');
    console.log(`All content has been saved to ${config.outputDir}`);
    console.log(`A consolidated text file with all content is available at: ${config.outputDir}/all_content.txt`);
    console.log('====================================');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Execute main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
