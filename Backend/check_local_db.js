const mongoose = require('mongoose');

const checkLocal = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/test_db', { serverSelectionTimeoutMS: 2000 });
        console.log("Local MongoDB is running!");
        await mongoose.disconnect();
    } catch (error) {
        console.log("Local MongoDB NOT reachable: " + error.code);
    }
};

checkLocal();
