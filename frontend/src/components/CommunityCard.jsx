import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Users, Share2 } from "lucide-react";

const CommunityCard = ({ community, onOpen, onEdit }) => {
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

  const handleEdit = () => {
    onEdit && onEdit(community);
  };

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-all">
      {/* Community Image */}
      <div className="relative h-40 bg-linear-to-br from-primary/20 to-secondary/20 overflow-hidden group cursor-pointer">
        {community.image ? (
          <>
            <img
              src={community.image}
              alt={community.name}
              className="w-full h-full object-cover"
            />
            {onEdit && (
              <button
                onClick={handleEdit}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition"
              >
                <p className="text-white text-sm font-medium">Click to change image</p>
              </button>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-base-300 relative">
            <div className="text-center z-10">
              <div className="text-5xl mb-2">👥</div>
              <p className="text-xs text-base-content/50">No image</p>
              {onEdit && <p className="text-xs text-primary mt-2 group-hover:text-primary-focus">Click to add image</p>}
            </div>
            {onEdit && (
              <button
                onClick={handleEdit}
                className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition"
              />
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body p-4">
        <h2 className="card-title text-lg line-clamp-1">{community.name}</h2>
        <p className="text-sm text-base-content/70 line-clamp-2">{community.description}</p>

        {/* Info Row */}
        <div className="flex items-center justify-between text-xs text-base-content/60 my-2">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{community.members?.length || 0} members</span>
          </div>
          <div className="badge badge-sm badge-outline">
            Ages {community.minAge}-{community.maxAge}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-actions gap-2 mt-4">
          <button
            className="btn btn-primary btn-sm flex-1"
            onClick={handleJoin}
          >
            Join
          </button>
          <button
            className="btn btn-ghost btn-sm btn-square"
            onClick={handleShare}
            disabled={loading}
            title="Share community"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
