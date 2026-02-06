import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { UseAuthStore } from "../store/UseAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, socket } = UseAuthStore();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on("userTyping", (data) => {
      if (data.senderId === selectedUser?._id) {
        setIsTyping(true);
      }
    });

    socket.on("userStoppedTyping", (data) => {
      if (data.senderId === selectedUser?._id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [socket, selectedUser?._id]);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {isTyping ? (
                <span className="animate-pulse font-semibold text-primary">typing...</span>
              ) : onlineUsers.includes(selectedUser._id) ? (
                "Online"
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
