import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
        },
        text: {
            type: String,
        },
        image: { 
            type: String,
        },
        status: {
            type: String,
            enum: ["sent", "delivered", "read"],
            default: "sent",
        },
        readBy: [
            {
                userId: mongoose.Schema.Types.ObjectId,
                readAt: Date,
            },
        ],
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;