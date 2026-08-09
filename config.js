// Configuration for the Ubiquiti scraper

export default {
  // Base URL of the Ubiquiti website
  baseUrl: 'https://ui.com/',

  // Maximum number of pages to crawl (set to a high number to get everything)
  maxPages: 2000,

  // Output directory where all content will be saved
  outputDir: './ui_com_assets',

  // File types to download
  fileTypes: {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp'],
    videos: ['.mp4', '.webm', '.mov', '.avi', '.ogv'],
    pdfs: ['.pdf'],
    styles: ['.css'],
    scripts: ['.js'],
    fonts: ['.woff', '.woff2', '.ttf', '.otf', '.eot']
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
  // This helps organize content into the right folders
  categories: [
    'Products',
    'Solutions',
    'Resources',
    'Support',
    'Community',
    'Company',
    'Store',
    'Other'
  ],

  // Patterns to include/exclude from crawling
  patterns: {
    // Include all ui.com pages
    include: [
      '/products',
      '/solutions',
      '/resources',
      '/support',
      '/community',
      '/company',
      '/'
    ],
    // Exclude unwanted URLs
    exclude: [
      '/cart',
      '/account',
      '/checkout',
      '/login',
      '/logout',
      '?',
      '#'
    ]
  }
};
