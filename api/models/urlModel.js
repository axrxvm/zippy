const fs = require('fs').promises;
const path = require('path');

const URLS_FILE_PATH = path.join(__dirname, 'urls.json');

// Helper function to read URLs from the JSON file
async function readUrlsFromFile() {
    try {
        const data = await fs.readFile(URLS_FILE_PATH, 'utf8');
        if (!data) { // Handle empty file case
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or JSON is invalid, return an empty array
        if (error.code === 'ENOENT' || error instanceof SyntaxError) {
            return [];
        }
        // For other errors, re-throw
        console.error("Error reading from urls.json:", error);
        throw error;
    }
}

// Helper function to write URLs to the JSON file
async function writeUrlsToFile(urls) {
    try {
        await fs.writeFile(URLS_FILE_PATH, JSON.stringify(urls, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing to urls.json:", error);
        throw error;
    }
}

/**
 * Saves a new URL mapping to the urls.json file.
 * @param {string} original_url - The original URL.
 * @param {string} short_url - The generated short URL.
 * @param {boolean} userBelongs - Indicates if the URL belongs to a registered user.
 * @returns {object} The saved URL object.
 */
async function saveUrl(original_url, short_url, userBelongs) {
    if (original_url === undefined || short_url === undefined || userBelongs === undefined) {
        throw new Error("Original URL, Short URL, and userBelongs flag are required.");
    }

    const urls = await readUrlsFromFile();
    const newUrl = {
        original_url,
        short_url,
        userBelongs, // Schema: original_url, short_url, userBelongs
    };

    urls.push(newUrl);
    await writeUrlsToFile(urls);
    return newUrl;
}

/**
 * Finds a URL mapping by its short URL.
 * @param {string} short_url - The short URL to search for.
 * @returns {object|null} The URL object if found, otherwise null.
 */
async function findUrlByShortUrl(short_url) {
    if (!short_url) {
        return null;
    }
    const urls = await readUrlsFromFile();
    return urls.find(url => url.short_url === short_url) || null;
}

/**
 * Finds a URL mapping by its original URL.
 * @param {string} original_url - The original URL to search for.
 * @returns {object|null} The URL object if found, otherwise null.
 */
async function findUrlByOriginalUrl(original_url) {
    if (!original_url) {
        return null;
    }
    const urls = await readUrlsFromFile();
    return urls.find(url => url.original_url === original_url) || null;
}

module.exports = {
    saveUrl,
    findUrlByShortUrl,
    findUrlByOriginalUrl,
};