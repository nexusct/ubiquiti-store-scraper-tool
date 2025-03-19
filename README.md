# Ubiquiti Store Scraper Tool

This tool downloads all pages and product information including images, videos, and PDF files from the Ubiquiti store website (https://store.ui.com/us/*). It organizes the information into folders by product category and name, and creates a consolidated text file with all content.

## Features

- Crawls all product pages from the Ubiquiti store
- Downloads images, videos, and PDF files
- Organizes content into folders by product category and name
- Creates a single text file with all parsed text, organized by sections

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
1. Crawl the Ubiquiti store website
2. Download all product information, images, videos, and PDFs
3. Organize everything into the appropriate folder structure
4. Create a consolidated text file with all content

## Configuration

You can modify the `config.js` file to adjust:
- Starting URL
- Maximum number of pages to crawl
- Download location
- File types to download

## License

MIT
