const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    options: {
        type: [String],
        required: true
    },
    votes: {
        type: [Number],
        required: true,
    },
    flair: {
        type: String
    },
    userVoted: {
        type: [String]
    }
});
const Poll = mongoose.model("Poll", pollSchema);
module.exports = Poll;