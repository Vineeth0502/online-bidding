
const { placeABid } = require("../services/websocket/auction");

module.exports = (io, socket) => {
    // live bidding
    socket.on("joinBidding", function (data) {
        socket.join(data.room);
    });

    socket.on("liveBid", async (data, errorCall) => {
        const response = await placeABid(data.roomId, data.bid, socket.request.user);
        if (response.msg !== undefined) {
            errorCall(response.msg);
        } else {
            io.in(data.roomId).emit("sendBid", response.newBid, data.roomId);
            if (response.prevTopBidderId) {
                socket.to(response.prevTopBidderId).emit("chatUserBidInfo", { roomId: data.roomId, auctionName: response.auctionName });
            }
        }
    });

    socket.on("leaveBidding", function (data) {
        socket.leave(data.room);
    });
};
