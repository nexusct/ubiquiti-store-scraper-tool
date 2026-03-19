# Ubiquiti Website Scraper Tool

This tool downloads all pages and assets including images, videos, PDFs, CSS, JavaScript, and fonts from the Ubiquiti website (https://ui.com). It organizes the content into folders by page and asset type, and creates a consolidated text file with all content.

## Features

- Crawls all pages from the Ubiquiti website
- Downloads all asset types: images, videos, PDFs, CSS, JavaScript, and fonts
- Organizes content into folders by page and asset type
- Takes screenshots of each page
- Saves page HTML for offline viewing
- Creates a single text file with all page titles and URLs
- Avoids duplicate asset downloads

## Folder Structure

```
ui_com_assets/
├── pages/
│   ├── [page1]/
│   │   ├── page.html
│   │   └── screenshot.png
│   ├── [page2]/
│   └── ...
├── assets/
│   ├── images/
│   ├── videos/
│   ├── pdfs/
│   ├── styles/
│   ├── scripts/
│   └── fonts/
└── all_content.txt
```

## Requirements

- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/nexusct/ubiquiti-store-scraper-tool.git
   ```

2. Install dependencies:
   ```
   cd ubiquiti-store-scraper-tool
   npm install
   ```

## Usage

Run the scraper:

```
npm start
```

The script will:
1. Crawl the Ubiquiti website
2. Download all page HTML and take screenshots
3. Extract and download all assets (images, videos, PDFs, CSS, JavaScript, fonts)
4. Organize everything into the appropriate folder structure
5. Create a consolidated text file with all page information

## Configuration

You can modify the `config.js` file to adjust:
- Base URL (currently set to https://ui.com/)
- Maximum number of pages to crawl
- Download location
- File types to download (images, videos, PDFs, CSS, JS, fonts)
- Crawl settings (concurrency, timeout, delay)

## License

MIT
