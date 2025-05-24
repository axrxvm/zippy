const express = require('express');
const apiRouter = express.Router();
const { findUrlByShortUrl, saveUrl } = require("./models/urlModel");
const uuidv4 = require('uuid').v4;

apiRouter.use(express.json());

apiRouter.post('/shorten', async (req, res) => {
    const bodyUrl = req.body?.url;
    const bodyShortUrl = req.body?.shorturl;

    if (!bodyUrl || typeof bodyUrl !== 'string') {
        return res.status(400).json({ error: "URL is required and must be a string" });
    }

    const urlRegex = new RegExp(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/);

    if (!urlRegex.test(bodyUrl)) {
        return res.status(400).json({ error: "Invalid URL format" });
    }


    // check for customURL request or RandomURL request
    if(req.body.randomUrl == 'true') {

        // Generate uuid
        function generateCustomUuid(){

            let genRandomURL = uuidv4();
            genRandomURL = genRandomURL.substring(0,6);
            return genRandomURL; 
        }

         // Do a while loop until we find the unique uuid in db
        let genUrl = generateCustomUuid();
        let urlExists = await findUrlByShortUrl(genUrl); // Use findUrlByShortUrl
        // Loop while urlExists is not null (meaning a URL was found)
        while(urlExists !== null) { 
            genUrl = generateCustomUuid(); // Regenerate UUID
            urlExists = await findUrlByShortUrl(genUrl); // Check again
        }
        
        // Create new entry in db using saveUrl
        // Assuming 'userBelongs' is false for URLs created via this general route
        const result = await saveUrl(bodyUrl, genUrl, false);

        if (!result) { // saveUrl might throw an error, or could return null on failure (depending on impl.)
            return res.status(500).json({ error: "Failed to create short URL" });
        }

        res.json({
            info: "Short Url created successfully",
            original_url: result.original_url,
            short_url: `https://zippy.up.railway.app/${result.short_url}`,
        });
    }

    else { // Logic for custom short URL

        // check if the custom short url already exists in the database
        const urlExists = await findUrlByShortUrl(bodyShortUrl); // Use findUrlByShortUrl
        
        if(urlExists === null) { // If null, the URL does not exist

            // Create new entry in db using saveUrl
            // Assuming 'userBelongs' is false for URLs created via this general route
            const result = await saveUrl(bodyUrl, bodyShortUrl.toString(), false);

            if (!result) {
                return res.status(500).json({ error: "Failed to create short URL" });
            }

            res.json({
                info: "Short Url created successfully",
                original_url: result.original_url,
                short_url: `https://zippy.up.railway.app/${result.short_url}`
            })
        }

        else { // Custom shortURL already exists

            res.json({
                info: "the shortened url already exists, try new one",
                original_url: urlExists.original_url, // Access property directly
                short_url: `https://zippy.up.railway.app/${urlExists.short_url}`, // Access property directly
                });
        }
    }

})

apiRouter.get('/:url', async (req, res) => {

    const reqUrl = req.params.url;

    // Read from the database using findUrlByShortUrl
    const urlExists = await findUrlByShortUrl(reqUrl);
    
    if(urlExists === null) { // If null, URL not found
        res.status(404).json({ // Send 404 for not found
            error: 'The requested Url is not found'
        });
    }
    else {
        res.redirect(urlExists.original_url); // Access property directly
    }
})

apiRouter.get('/', (req, res) => {
    res.send('[INFO] Welcome to Zippy - Compact Fast URL Shortner');
})

// Module Exports
module.exports = apiRouter;

