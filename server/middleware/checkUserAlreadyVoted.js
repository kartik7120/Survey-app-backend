const Poll = require("../models/pollSchema");
const JWT = require("jsonwebtoken");
const checkUserAlreadyVoted = async (req, res, next) => {
    const token = req.header("o-auth-token");
    const { _id } = req.body;
    try {
        const decodedToken = JWT.decode(token, { complete: true });
        const user_id = decodedToken.sub;
        const poll = await Poll.findById({ _id });
        const isUserVoted = poll.userVoted.find(userId => userId === user_id);
        if (!isUserVoted) {
            return res.status(403).json("You have already voted on this poll");
        }
        next();
    } catch (error) {
        return res.status(404).json("Token is invalid");
    }
}
module.exports = checkUserAlreadyVoted;