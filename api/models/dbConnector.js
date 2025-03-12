const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env'});



// MongoDB Atlas setup
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true })
    .then(console.log('[INFO] Connected to Database'));

// export the authenticated mongoose client
module.exports = mongoose;