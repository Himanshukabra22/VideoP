const mongoose = require("mongoose");

const datSchema = new mongoose.Schema({
    
});

//we will create a new connection

const keypairData = new mongoose.model('Data', dataSchema);
module.exports = keypairData;