const Chat = require("../models/chat");
const User = require("../models/user");

const chatMiddleware = {};

chatMiddleware.checkIfChatRoomExists = async function (req, res, next) {
    const { foundUser } = req;
    try {
        const foundChatRoom = await Chat.findOne({
            $and: [
                {
                    participants: {
                        $elemMatch: {
                            "user.username": req.user.user
                        }
                    }
                },
                // eslint-disable-next-line no-dupe-keys
                {
                    participants: {
                        $elemMatch: {
                            "user.username": foundUser.username
                        }
                    }
                }
            ]
        });
        if (foundChatRoom !== null) {
            return res.status(200).json({
                msg: "chat room already exist",
                chatRoom: foundChatRoom
            });
        } else {
            return next();
        }
    } catch (error) {
        return res.status(400).json({
            msg: Chat.processErrors(error)
        });
    }
};

chatMiddleware.checkIfUserExists = async function (req, res, next) {
    const { username } = req.params;
    try {
        const foundUser = await User.findOne({ username: username });
        if (foundUser !== null) {
            req.foundUser = {
                username: foundUser.username,
                id: foundUser._id
            };
            return next();
        }
    } catch (error) {
        return res.status(200).json({
            msg: "user not found"
        });
    }
};

chatMiddleware.getRoom = async function (req, res, next) {
    const { id } = req.params;
    try {
        const foundChatRoom = await Chat.findOne({ _id: id }).populate("participants");
        res.foundRoom = foundChatRoom;
        return next();
    } catch (error) {
        return res.status(400).json({
            msg: Chat.processErrors(error)
        });
    }
};

module.exports = chatMiddleware;
