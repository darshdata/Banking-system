const mongoose = require("mongoose");

const blackListSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, "Token is required for blacklisting."],
    unique: [true, "This token is already blacklisted."],
  },
}, {
  timestamps: true
}); 

blackListSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 }); // Expire after 24 hours

const blackListModel = mongoose.model("TokenBlackList", blackListSchema);

module.exports = blackListModel;