// Configuration for the Ubiquiti store scraper

export default {
  // Base URL of the Ubiquiti store
  baseUrl: 'https://store.ui.com/us/',
  
  // Maximum number of pages to crawl (set to a high number to get everything)
  maxPages: 1000,
  
  // Output directory where all content will be saved
  outputDir: './ubiquiti_store',
  
  // File types to download
  fileTypes: {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    videos: ['.mp4', '.webm', '.mov'],
    pdfs: ['.pdf']
  },
  
  // Crawling settings
  crawlSettings: {
    // Maximum concurrent requests
    concurrency: 5,
    
    // Timeout for each request (in milliseconds)
    timeout: 30000,
    
    // Delay between requests (in milliseconds)
    delay: 500,
    
    // User agent to use for requests
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  },
  
  // Product categories to look for
  // This helps organize products into the right folders
  categories: [
    'Networks',
    'Protect',
    'Access',
    'Talk',
    'Connect',
    'Cameras',
    'Door Access',
    'Accessories',
    'Sensors',
    'Antennas'
  ],
  
  // Patterns to include/exclude from crawling
  patterns: {
    // Include only product pages and category pages
    include: [
      '/us/products/',
      '/us/collections/'
    ],
    // Exclude unwanted URLs
    exclude: [
      '/cart',
      '/account',
      '/search',
      '/pages/',
      '/policies/'
    ]
  }
};
