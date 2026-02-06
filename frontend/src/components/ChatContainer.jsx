import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { UseAuthStore } from "../store/UseAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { formatMessageTime } from "../lib/utils";
import { Check, CheckCheck } from "lucide-react";

const ChatContainer = () => {
  const { messages, getMessages, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { authUser } = UseAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            {/* AVATAR LOGIC */}
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            <div className="chat-header mb-1 flex items-center justify-between">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
              {/* Message Status Icons - Only show for sent messages */}
              {message.senderId === authUser._id && (
                <div className="ml-2">
                  {message.status === "read" && (
                    <CheckCheck size={14} className="text-blue-500" title="Read" />
                  )}
                  {message.status === "delivered" && (
                    <CheckCheck size={14} className="text-gray-400" title="Delivered" />
                  )}
                  {message.status === "sent" && (
                    <Check size={14} className="text-gray-400" title="Sent" />
                  )}
                </div>
              )}
            </div>

            <div className="chat-bubble flex flex-col gap-2">
              {/* IMAGE RENDERING - This was missing! */}
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-50 rounded-md mb-2"
                />
              )}
              {/* TEXT RENDERING */}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;