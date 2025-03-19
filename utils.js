import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import sanitize from 'sanitize-filename';
import { URL } from 'url';

/**
 * Ensures a directory exists, creating it if necessary
 * @param {string} dirPath - Path to the directory
 */
export const ensureDir = async (dirPath) => {
  await fs.ensureDir(dirPath);
};

/**
 * Sanitizes a string to be used as a filename or directory name
 * @param {string} name - Name to sanitize
 * @returns {string} Sanitized name
 */
export const sanitizeName = (name) => {
  return sanitize(name.trim()).replace(/\\s+/g, '_');
};

/**
 * Determines the product category based on the product name or URL
 * @param {string} productName - Name of the product
 * @param {string} url - URL of the product page
 * @param {string[]} categories - List of possible categories
 * @returns {string} Category name
 */
export const determineCategory = (productName, url, categories) => {
  // Try to extract category from URL first
  const urlParts = url.split('/');
  const collectionIndex = urlParts.indexOf('collections');
  
  if (collectionIndex !== -1 && collectionIndex + 1 < urlParts.length) {
    const urlCategory = urlParts[collectionIndex + 1];
    if (urlCategory && urlCategory !== '') {
      // Convert to title case and remove hyphens
      return urlCategory
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
  
  // If URL doesn't contain a category, try to match with product name
  for (const category of categories) {
    if (productName.toLowerCase().includes(category.toLowerCase())) {
      return category;
    }
  }
  
  // Default category if no match found
  return 'Other';
};

/**
 * Downloads a file from a URL and saves it to the specified path
 * @param {string} url - URL of the file to download
 * @param {string} outputPath - Path where to save the file
 */
export const downloadFile = async (url, outputPath) => {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(outputPath);
    
    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading file from ${url}:`, error.message);
  }
};

/**
 * Extracts links of specific types from HTML content
 * @param {string} html - HTML content
 * @param {string[]} fileExtensions - File extensions to look for
 * @param {string} baseUrl - Base URL to resolve relative URLs
 * @returns {string[]} Array of absolute URLs
 */
export const extractLinks = (html, fileExtensions, baseUrl) => {
  const links = [];
  const regex = /href=["']([^"']+)["']|src=["']([^"']+)["']/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const url = match[1] || match[2];
    
    if (url) {
      // Check if the URL has one of the specified extensions
      const hasMatchingExtension = fileExtensions.some(ext => 
        url.toLowerCase().endsWith(ext)
      );
      
      if (hasMatchingExtension) {
        // Convert relative URL to absolute
        try {
          const absoluteUrl = new URL(url, baseUrl).href;
          links.push(absoluteUrl);
        } catch (error) {
          console.error(`Invalid URL: ${url}`);
        }
      }
    }
  }
  
  return [...new Set(links)]; // Remove duplicates
};

/**
 * Appends text to a file, creating the file if it doesn't exist
 * @param {string} filePath - Path to the file
 * @param {string} text - Text to append
 */
export const appendToFile = async (filePath, text) => {
  await fs.ensureFile(filePath);
  await fs.appendFile(filePath, text + '\\n', 'utf8');
};

/**
 * Extracts the product name from a product page
 * @param {string} html - HTML content of the product page
 * @returns {string} Product name
 */
export const extractProductName = (html) => {
  const titleMatch = html.match(/<title>([^<]+)<\\/title>/);
  if (titleMatch && titleMatch[1]) {
    // Clean up the title (remove "- Ubiquiti Store" etc.)
    let title = titleMatch[1].trim();
    title = title.replace(/\\s*[\\-|]\\s*Ubiquiti.*$/i, '');
    return title;
  }
  
  // Fallback to h1
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\\/h1>/);
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim();
  }
  
  return 'Unknown Product';
};

/**
 * Extracts the product description from a product page
 * @param {string} html - HTML content of the product page
 * @returns {string} Product description
 */
export const extractProductDescription = (html) => {
  // Look for meta description first
  const metaMatch = html.match(/<meta\\s+name=["']description["']\\s+content=["']([^"']+)["']/i);
  if (metaMatch && metaMatch[1]) {
    return metaMatch[1].trim();
  }
  
  // Look for product description in the page content
  const descMatch = html.match(/<div[^>]*class=["'][^"']*product-description[^"']*["'][^>]*>([\\s\\S]*?)<\\/div>/i);
  if (descMatch && descMatch[1]) {
    // Remove HTML tags
    return descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim();
  }
  
  return '';
};
