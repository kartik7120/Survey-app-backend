const mongoose = require("mongoose");
// const Poll = require("./pollSchema");
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    polls: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll"
    }]

});

const User = mongoose.model("User", userSchema);
module.exports = User;