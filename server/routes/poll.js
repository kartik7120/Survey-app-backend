const Poll = require("../models/pollSchema");
const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const { default: mongoose } = require("mongoose");
const checkUserAuthentication = require("../middleware/checkUserAuthtication");
const jwt = require("jsonwebtoken");
router.get("/allPolls/details", async (req, res, next) => {
    try {
        const noOfPolls = await Poll.find({}).count();
        const noOfUsers = await User.find({}).count();
        const allPolls = await Poll.find({}, { votes: 1, _id: 0 });
        let totalVotes = 0;
        allPolls.map((votesObj) => {
            votesObj.votes.map((vote) => {
                totalVotes += vote;
                return 1;
            })
            return 1;
        })
        const body = {
            noOfPolls,
            noOfUsers,
            totalVotes
        }
        res.contentType("application/json");
        res.json(body);
    } catch (error) {
        next(error);
    }
})

router.get("/allPolls/page/:pgNumber", async (req, res, next) => {
    try {
        const { pgNumber } = req.params;
        const totalPolls = Math.ceil((await Poll.find({}).count()) / 5);
        const pollData = await (Poll.find({}).skip((pgNumber - 1) * 5).limit(5));
        const body = {
            totalPolls,
            pollData
        }
        res.contentType("application/json");
        res.json(body);
    } catch (error) {
        next(error);
    }
})

router.get("/allPolls/:id", async (req, res) => {
    const { id } = req.params;

    const poll = await Poll.findById({ _id: id });
    res.contentType("application/json");

    res.json(JSON.stringify(poll));
})

router.post("/create", checkUserAuthentication, async (req, res, next) => {
    try {
        const token = req.header("o-auth-token");

        const payload = jwt.verify(token, process.env.SECRET);
        const id = payload.sub;
        if (payload) {
            const { title, description, options, flair } = req.body;
            let op = [];
            for (let [, value] of Object.entries(options)) {
                op.push(value); // values for options
            }
            let vote = [];
            for (let i = 0; i < op.length; i++) {
                vote.push(0); // initial values for votes for each option value
            }
            const newPoll = new Poll({
                _id: new mongoose.Types.ObjectId(),
                title: title,
                description: description,
                options: op,
                votes: vote,
                flair: flair
            });
            await newPoll.save()
                .then(() => console.log("Successfully saved to the database"))
                .catch((err) => console.log("Error in saving to the database", err));

            await (await User.findByIdAndUpdate({ _id: id }, { $push: { "polls": newPoll._id } }, { new: true })).save();
            // user.polls = newPoll._id;
            res.json(newPoll._id);
        }
        else
            res.json("User is not logged in so cannot create a poll");
    } catch (error) {
        next(error);
    }
});

router.patch("/updateVotes/:id", checkUserAuthentication, async (req, res, next) => {
    try {
        const { _id, targetValue } = req.body;
        const token = req.header("o-auth-token");

        const poll = await Poll.findById({ _id });
        let updateIdx = -1;
        const optionArray = poll.options;
        let userVotedArray = poll.userVoted;

        for (let i = 0; i < optionArray.length; i++) {
            if (optionArray[i] === targetValue) {
                updateIdx = i;
                break;
            }
        }
        const payload = jwt.verify(token, process.env.SECRET);
        userVotedArray.push(payload.sub);
        const set = new Set();
        userVotedArray.map((userId) => {
            set.add(userId);
            return 1;
        })

        userVotedArray = [];

        for (let userId of set) {
            userVotedArray.push(userId);
        }

        const votesArray = poll.votes;
        votesArray[updateIdx] = votesArray[updateIdx] + 1;

        const newPoll = await Poll.findByIdAndUpdate({ _id }, { $set: { "votes": votesArray, "userVoted": userVotedArray } }, { new: true });
        res.contentType("application/json");
        res.json(newPoll);
    } catch (error) {
        next(error);
    }

})

module.exports = router;