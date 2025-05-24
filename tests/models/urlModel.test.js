const assert = require('assert');
const fs = require('fs').promises;
const path = require('path');
const { saveUrl, findUrlByShortUrl, findUrlByOriginalUrl } = require('../../api/models/urlModel');

// --- Mocking fs.promises ---
let mockFileSystemStore = {};
const originalReadFile = fs.readFile;
const originalWriteFile = fs.writeFile;

const URLS_FILE_PATH = path.join(__dirname, '..', '..', 'api', 'models', 'urls.json');

function mockFs() {
    fs.readFile = async (filePath, encoding) => {
        assert.strictEqual(encoding, 'utf8', 'File read encoding should be utf8');
        if (mockFileSystemStore[filePath]) {
            return mockFileSystemStore[filePath];
        }
        const error = new Error(`ENOENT: no such file or directory, open '${filePath}'`);
        error.code = 'ENOENT';
        throw error;
    };

    fs.writeFile = async (filePath, data, encoding) => {
        assert.strictEqual(encoding, 'utf8', 'File write encoding should be utf8');
        mockFileSystemStore[filePath] = data;
    };
}

function restoreFs() {
    fs.readFile = originalReadFile;
    fs.writeFile = originalWriteFile;
}
// --- End Mocking fs.promises ---

async function runUrlModelTests() {
    console.log("Starting urlModel.js tests...\n");

    // Test Suite: saveUrl
    console.log("--- Testing saveUrl ---");
    mockFileSystemStore = {}; // Reset for each suite or test

    // Test 1: Save a single URL
    const url1 = { original_url: "https://example.com", short_url: "exmpl", userBelongs: false };
    let savedUrl1 = await saveUrl(url1.original_url, url1.short_url, url1.userBelongs);
    assert.deepStrictEqual(savedUrl1, url1, "Test 1.1 Failed: Saved URL object mismatch.");
    let urlsInStore = JSON.parse(mockFileSystemStore[URLS_FILE_PATH]);
    assert.deepStrictEqual(urlsInStore, [url1], "Test 1.2 Failed: urls.json content after first save is incorrect.");
    console.log("Test 1 Passed: Save a single URL.");

    // Test 2: Save a second URL
    const url2 = { original_url: "https://google.com", short_url: "googl", userBelongs: true };
    let savedUrl2 = await saveUrl(url2.original_url, url2.short_url, url2.userBelongs);
    assert.deepStrictEqual(savedUrl2, url2, "Test 2.1 Failed: Second saved URL object mismatch.");
    urlsInStore = JSON.parse(mockFileSystemStore[URLS_FILE_PATH]);
    assert.deepStrictEqual(urlsInStore, [url1, url2], "Test 2.2 Failed: urls.json content after second save is incorrect.");
    console.log("Test 2 Passed: Save a second URL.");

    // Test 3: saveUrl with missing parameters
    try {
        await saveUrl("https://missing.com", undefined, false);
        assert.fail("Test 3 Failed: saveUrl should throw error for missing parameters.");
    } catch (e) {
        assert.ok(e instanceof Error, "Test 3 Failed: Error type mismatch.");
        assert.strictEqual(e.message, "Original URL, Short URL, and userBelongs flag are required.", "Test 3 Failed: Error message mismatch for missing params.");
        console.log("Test 3 Passed: saveUrl throws error for missing parameters.");
    }
    console.log("--- saveUrl tests completed ---\n");


    // Test Suite: findUrlByShortUrl
    console.log("--- Testing findUrlByShortUrl ---");
    // mockFileSystemStore is already populated with url1 and url2
    
    // Test 4: Find an existing URL by short_url
    let found = await findUrlByShortUrl("exmpl");
    assert.deepStrictEqual(found, url1, "Test 4 Failed: Did not find existing URL by short_url.");
    console.log("Test 4 Passed: Find an existing URL by short_url.");

    // Test 5: Try to find non-existing URL by short_url
    found = await findUrlByShortUrl("nonexist");
    assert.strictEqual(found, null, "Test 5 Failed: Should return null for non-existing short_url.");
    console.log("Test 5 Passed: Return null for non-existing short_url.");
    console.log("--- findUrlByShortUrl tests completed ---\n");


    // Test Suite: findUrlByOriginalUrl
    console.log("--- Testing findUrlByOriginalUrl ---");
    // mockFileSystemStore is still populated

    // Test 6: Find an existing URL by original_url
    found = await findUrlByOriginalUrl("https://google.com");
    assert.deepStrictEqual(found, url2, "Test 6 Failed: Did not find existing URL by original_url.");
    console.log("Test 6 Passed: Find an existing URL by original_url.");

    // Test 7: Try to find non-existing URL by original_url
    found = await findUrlByOriginalUrl("https://nonexist.com");
    assert.strictEqual(found, null, "Test 7 Failed: Should return null for non-existing original_url.");
    console.log("Test 7 Passed: Return null for non-existing original_url.");
    console.log("--- findUrlByOriginalUrl tests completed ---\n");

    console.log("urlModel.js tests completed successfully!");
}

// Mock fs before running tests
mockFs();

runUrlModelTests()
    .catch(error => {
        console.error("Test suite failed:", error);
        restoreFs(); // Ensure fs is restored even on failure
        process.exit(1); // Indicate failure
    })
    .finally(() => {
        restoreFs(); // Restore original fs functions after tests
    });
