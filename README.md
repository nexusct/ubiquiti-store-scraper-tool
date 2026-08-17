# Ubiquiti Store Scraper Tool

A JavaScript web scraper that downloads product information, images, videos, and PDF files from the Ubiquiti store website (https://store.ui.com/us/*). The tool organizes content into folders by product category and name, and creates a consolidated text file with all extracted data.

## Features

- **Automated Crawling** - Recursively crawls all product pages from the Ubiquiti store
- **Multi-Asset Downloads** - Downloads images, videos, and PDF files
- **Smart Organization** - Organizes content into folders by product category and name
- **Consolidated Output** - Creates a single text file with all parsed content, organized by sections
- **Configurable** - Customizable crawl settings, concurrency limits, and file types

## Folder Structure

```
ubiquiti_store/
├── products/
│   ├── [category1]/
│   │   ├── [product1]/
│   │   │   ├── images/
│   │   │   ├── videos/
│   │   │   ├── pdfs/
│   │   │   └── product_info.md
│   │   └── [product2]/
│   ├── [category2]/
│   └── ...
└── all_content.txt
```

## Requirements

- **Node.js** - v16 or higher
- **npm** - v7 or higher

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/nexusct/ubiquiti-store-scraper-tool.git
   cd ubiquiti-store-scraper-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up pre-commit hooks for security scanning:
   ```bash
   pip install pre-commit
   pre-commit install
   ```

## Usage

Run the scraper:

```bash
npm start
```

The script will:
1. Crawl the Ubiquiti store website starting from the base URL
2. Download all product information, images, videos, and PDFs
3. Organize everything into the appropriate folder structure
4. Create a consolidated text file with all content at `ubiquiti_store/all_content.txt`

## Configuration

The scraper behavior can be customized by creating a `config.js` file (see `config.js` in the repository for the default settings):

- **baseUrl** - Starting URL for the crawler
- **maxPages** - Maximum number of pages to crawl
- **outputDir** - Directory where all content will be saved
- **fileTypes** - File extensions to download (images, videos, PDFs)
- **crawlSettings** - Concurrency, timeout, delay, and user agent
- **categories** - Product categories to organize into folders
- **patterns** - URL patterns to include/exclude from crawling

### Example Configuration

```javascript
export default {
  baseUrl: 'https://store.ui.com/us/',
  maxPages: 1000,
  outputDir: './ubiquiti_store',
  crawlSettings: {
    concurrency: 5,
    timeout: 30000,
    delay: 500
  }
};
```

## Security

This is a **public repository**. Never commit:
- API keys, tokens, or credentials
- Private configuration files
- Internal network addresses
- Database dumps or backups

See [SECURITY.md](SECURITY.md) for our full security policy and how to report vulnerabilities.

## Rate Limiting & Ethics

This tool is designed for educational and research purposes. When using this scraper:

- **Respect robots.txt** - Check the target site's robots.txt before scraping
- **Rate limit your requests** - Use reasonable delays between requests (default: 500ms)
- **Avoid overwhelming servers** - Limit concurrency (default: 5 concurrent requests)
- **Check Terms of Service** - Ensure your use complies with the target site's ToS
- **Use responsibly** - Don't use scraped data for commercial purposes without permission

## Troubleshooting

### Common Issues

**Timeout Errors**
- Increase the `timeout` value in `crawlSettings`
- Reduce the `concurrency` value to avoid overwhelming the server

**Missing Dependencies**
- Run `npm install` to ensure all dependencies are installed
- Check that you're using Node.js v16 or higher

**Download Failures**
- Check your internet connection
- Verify the target URLs are accessible
- Some assets may require authentication or may be region-locked

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Disclaimer

This tool is provided for educational and research purposes only. Users are responsible for ensuring their use of this tool complies with all applicable laws and the terms of service of any websites they scrape. The authors are not responsible for any misuse of this tool.
