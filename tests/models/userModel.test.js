const assert = require('assert');
const fs = require('fs').promises;
const path = require('path');
const { saveUser, findUserByEmail, updateUserByEmail } = require('../../api/models/userModel');

// --- Mocking fs.promises (similar to urlModel.test.js) ---
let mockFileSystemStore = {};
const originalReadFile = fs.readFile;
const originalWriteFile = fs.writeFile;

// Adjusted path for users.json within the context of api/models directory
const USERS_FILE_PATH = path.join(__dirname, '..', '..', 'api', 'models', 'users.json');


function mockFs() {
    fs.readFile = async (filePath, encoding) => {
        assert.strictEqual(encoding, 'utf8', 'File read encoding should be utf8');
        if (mockFileSystemStore[filePath]) {
            return mockFileSystemStore[filePath];
        }
        const error = new Error(`ENOENT: no such file or directory, open '${filePath}'`);
        error.code = 'ENOENT';
        throw error; // Simulate file not found
    };

    fs.writeFile = async (filePath, data, encoding) => {
        assert.strictEqual(encoding, 'utf8', 'File write encoding should be utf8');
        mockFileSystemStore[filePath] = data; // "Write" to in-memory store
    };
}

function restoreFs() {
    fs.readFile = originalReadFile;
    fs.writeFile = originalWriteFile;
}
// --- End Mocking fs.promises ---

async function runUserModelTests() {
    console.log("\nStarting userModel.js tests...\n");

    // Test Suite: saveUser
    console.log("--- Testing saveUser ---");
    mockFileSystemStore = {}; // Reset for each suite

    // Test 1: Save a new user
    const user1 = { fullName: "Test User", email: "test@example.com", emailVerified: false, passwordHash: "hash123", urls: [] };
    let savedUser1 = await saveUser(user1.fullName, user1.email, user1.emailVerified, user1.passwordHash, user1.urls);
    assert.deepStrictEqual(savedUser1, user1, "Test 1.1 Failed: Saved user object mismatch.");
    let usersInStore = JSON.parse(mockFileSystemStore[USERS_FILE_PATH]);
    assert.deepStrictEqual(usersInStore, [user1], "Test 1.2 Failed: users.json content after first save is incorrect.");
    console.log("Test 1 Passed: Save a new user.");

    // Test 2: Attempt to save user with existing email
    try {
        await saveUser("Another User", user1.email, false, "hash456", []);
        assert.fail("Test 2 Failed: saveUser should throw error for existing email.");
    } catch (e) {
        assert.ok(e instanceof Error, "Test 2.1 Failed: Error type mismatch.");
        assert.strictEqual(e.message, "User with this email already exists.", "Test 2.2 Failed: Error message for existing email mismatch.");
        console.log("Test 2 Passed: saveUser throws error for existing email.");
    }
    
    // Test 3: saveUser with missing parameters
    try {
        await saveUser("Missing Info", undefined, false, "hash789");
        assert.fail("Test 3 Failed: saveUser should throw error for missing parameters.");
    } catch (e) {
        assert.ok(e instanceof Error, "Test 3.1 Failed: Error type mismatch.");
        assert.strictEqual(e.message, "Full name, email, emailVerified, and passwordHash are required.", "Test 3.2 Failed: Error message for missing params.");
        console.log("Test 3 Passed: saveUser throws error for missing parameters.");
    }
    console.log("--- saveUser tests completed ---\n");

    // Test Suite: findUserByEmail
    console.log("--- Testing findUserByEmail ---");
    // mockFileSystemStore is populated with user1
    
    // Test 4: Find an existing user by email
    let found = await findUserByEmail(user1.email);
    assert.deepStrictEqual(found, user1, "Test 4 Failed: Did not find existing user by email.");
    console.log("Test 4 Passed: Find an existing user by email.");

    // Test 5: Try to find non-existing user by email
    found = await findUserByEmail("nonexist@example.com");
    assert.strictEqual(found, null, "Test 5 Failed: Should return null for non-existing email.");
    console.log("Test 5 Passed: Return null for non-existing email.");
    console.log("--- findUserByEmail tests completed ---\n");

    // Test Suite: updateUserByEmail
    console.log("--- Testing updateUserByEmail ---");
    // mockFileSystemStore still has user1

    // Test 6: Update fullName of an existing user
    const updatedFullName = "Test User Updated";
    let updatedUser = await updateUserByEmail(user1.email, { fullName: updatedFullName });
    assert.strictEqual(updatedUser.fullName, updatedFullName, "Test 6.1 Failed: User's fullName not updated.");
    assert.strictEqual(updatedUser.email, user1.email, "Test 6.2 Failed: User's email should not change on this update.");
    usersInStore = JSON.parse(mockFileSystemStore[USERS_FILE_PATH]);
    assert.strictEqual(usersInStore[0].fullName, updatedFullName, "Test 6.3 Failed: users.json not updated with new fullName.");
    console.log("Test 6 Passed: Update fullName of an existing user.");

    // Test 7: Add a URL to an existing user's urls array (initially empty)
    const newUrl1 = "short1";
    updatedUser = await updateUserByEmail(user1.email, { urls: [newUrl1] });
    assert.deepStrictEqual(updatedUser.urls, [newUrl1], "Test 7.1 Failed: URL not added to initially empty array.");
    usersInStore = JSON.parse(mockFileSystemStore[USERS_FILE_PATH]);
    assert.deepStrictEqual(usersInStore[0].urls, [newUrl1], "Test 7.2 Failed: users.json not updated with new URL.");
    console.log("Test 7 Passed: Add URL to initially empty array.");

    // Test 8: Add another URL to the user's urls array
    const newUrl2 = "short2";
    updatedUser = await updateUserByEmail(user1.email, { urls: [...updatedUser.urls, newUrl2] });
    assert.deepStrictEqual(updatedUser.urls, [newUrl1, newUrl2], "Test 8.1 Failed: Second URL not added correctly.");
    usersInStore = JSON.parse(mockFileSystemStore[USERS_FILE_PATH]);
    assert.deepStrictEqual(usersInStore[0].urls, [newUrl1, newUrl2], "Test 8.2 Failed: users.json not updated with second URL.");
    console.log("Test 8 Passed: Add another URL to existing array.");

    // Test 9: Try to update a non-existing user
    updatedUser = await updateUserByEmail("nonexist@example.com", { fullName: "Ghost User" });
    assert.strictEqual(updatedUser, null, "Test 9 Failed: Should return null when trying to update non-existing user.");
    console.log("Test 9 Passed: Return null for updating non-existing user.");

    // Test 10: updateUserByEmail with missing parameters
    try {
        await updateUserByEmail(user1.email, undefined);
        assert.fail("Test 10 Failed: updateUserByEmail should throw error for missing updateData.");
    } catch (e) {
        assert.ok(e instanceof Error, "Test 10.1 Failed: Error type mismatch.");
        assert.strictEqual(e.message, "Email and updateData are required for updating a user.", "Test 10.2 Failed: Error message for missing params.");
        console.log("Test 10 Passed: updateUserByEmail throws error for missing parameters.");
    }
    console.log("--- updateUserByEmail tests completed ---\n");
    
    console.log("userModel.js tests completed successfully!");
}

// Mock fs before running tests
mockFs();

runUserModelTests()
    .catch(error => {
        console.error("User model test suite failed:", error);
        restoreFs(); // Ensure fs is restored even on failure
        process.exit(1); // Indicate failure
    })
    .finally(() => {
        restoreFs(); // Restore original fs functions after tests
    });
