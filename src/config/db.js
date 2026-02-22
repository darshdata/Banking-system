const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        mongoose.connect(process.env.MONGO_URI);
        console.log('Server is connected to database');
    }
    catch(err){
        console.error((err) => console.log("server is not connected to database"));
        process.exit(1);
    }
}

module.exports = connectDB;