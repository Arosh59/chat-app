import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const CommunityCard = ({ community, onOpen }) => {
  const { setSelectedCommunity } = useChatStore();
  const [loading, setLoading] = useState(false);

  const handleJoin = () => {
    setSelectedCommunity(community);
    onOpen && onOpen(community);
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/communities/share-link/${community._id}`);
      const { shareLink } = res.data;
      await navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied to clipboard");
    } catch (error) {
      toast.error("Failed to get share link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 shadow hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{community.name}</h3>
          <p className="text-sm text-muted">{community.description}</p>
          <p className="text-xs mt-2">Age: {community.minAge} - {community.maxAge}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button className="btn btn-sm" onClick={handleJoin}>Join</button>
          <button className="btn btn-outline btn-sm" onClick={handleShare} disabled={loading}>
            {loading ? "..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
