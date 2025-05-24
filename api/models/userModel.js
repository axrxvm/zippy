const fs = require('fs').promises;
const path = require('path');

const USERS_FILE_PATH = path.join(__dirname, 'users.json');

// Helper function to read users from the JSON file
async function readUsersFromFile() {
    try {
        const data = await fs.readFile(USERS_FILE_PATH, 'utf8');
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
        console.error("Error reading from users.json:", error);
        throw error;
    }
}

// Helper function to write users to the JSON file
async function writeUsersToFile(users) {
    try {
        await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing to users.json:", error);
        throw error;
    }
}

/**
 * Saves a new user to the users.json file.
 * @param {string} fullName
 * @param {string} email
 * @param {boolean} emailVerified
 * @param {string} passwordHash
 * @param {Array<string>} [urls=[]] - Optional: list of short URLs associated with the user.
 * @returns {object} The saved user object.
 */
async function saveUser(fullName, email, emailVerified, passwordHash, urls = []) {
    if (fullName === undefined || email === undefined || emailVerified === undefined || passwordHash === undefined) {
        throw new Error("Full name, email, emailVerified, and passwordHash are required.");
    }

    const users = await readUsersFromFile();

    // Check if user with the same email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        throw new Error("User with this email already exists.");
    }

    const newUser = {
        fullName,
        email,
        emailVerified,
        passwordHash,
        urls, // Schema: fullName, email, emailVerified, passwordHash, urls: [String]
    };

    users.push(newUser);
    await writeUsersToFile(users);
    return newUser;
}

/**
 * Finds a user by their email.
 * @param {string} email - The email to search for.
 * @returns {object|null} The user object if found, otherwise null.
 */
async function findUserByEmail(email) {
    if (!email) {
        return null;
    }
    const users = await readUsersFromFile();
    return users.find(user => user.email === email) || null;
}

/**
 * Updates a user's information by their email.
 * @param {string} email - The email of the user to update.
 * @param {object} updateData - An object containing the fields to update.
 * @returns {object|null} The updated user object, or null if the user was not found.
 */
async function updateUserByEmail(email, updateData) {
    if (!email || !updateData) {
        throw new Error("Email and updateData are required for updating a user.");
    }

    const users = await readUsersFromFile();
    const userIndex = users.findIndex(user => user.email === email);

    if (userIndex === -1) {
        return null; // User not found
    }

    // Merge existing user data with updateData
    users[userIndex] = { ...users[userIndex], ...updateData };

    // Ensure that if urls are updated, they are an array (as per schema)
    if (updateData.urls !== undefined && !Array.isArray(users[userIndex].urls)) {
        console.warn(`Corrected 'urls' field to be an array for user ${email}. Original value: ${users[userIndex].urls}`);
        users[userIndex].urls = Array.isArray(updateData.urls) ? updateData.urls : [];
    }


    await writeUsersToFile(users);
    return users[userIndex];
}

module.exports = {
    saveUser,
    findUserByEmail,
    updateUserByEmail,
};