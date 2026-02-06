import { useState, useEffect } from "react";
import { X, Plus, Trash2, Crown } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const CommunityMembers = ({ communityId, isAdmin = false, onClose }) => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axiosInstance.get(`/communities/${communityId}/members`);
        setMembers(res.data);
      } catch (error) {
        toast.error("Failed to load members");
      } finally {
        setIsLoading(false);
      }
    };

    if (communityId) {
      fetchMembers();
    }
  }, [communityId]);

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the community?")) return;

    try {
      await axiosInstance.delete(`/communities/${communityId}/members/${memberId}`);
      setMembers(members.filter((m) => m._id !== memberId));
      toast.success("Member removed");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handlePromoteToAdmin = async (memberId) => {
    try {
      await axiosInstance.put(`/communities/${communityId}/members/${memberId}/promote`);
      setMembers(
        members.map((m) =>
          m._id === memberId ? { ...m, isAdmin: true } : m
        )
      );
      toast.success("Member promoted to admin");
    } catch (error) {
      toast.error("Failed to promote member");
    }
  };

  const filteredMembers = members.filter((member) =>
    member.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-96 overflow-y-auto">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X size={20} />
        </button>

        <h3 className="font-bold text-lg mb-4">
          Community Members ({members.length})
        </h3>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        {/* Members List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner" />
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredMembers.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-3 rounded-lg bg-base-200 hover:bg-base-300 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img
                        src={member.profilePic || "/avatar.png"}
                        alt={member.fullName}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {member.fullName}
                      {member.isAdmin && (
                        <Crown size={16} className="text-warning" />
                      )}
                    </p>
                    <p className="text-xs text-base-content/60">
                      Age: {member.age}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {isAdmin && member.role !== "admin" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePromoteToAdmin(member._id)}
                      className="btn btn-xs btn-ghost"
                      title="Promote to admin"
                    >
                      <Crown size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="btn btn-xs btn-ghost text-error"
                      title="Remove member"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-base-content/60">No members found</p>
          </div>
        )}

        <div className="modal-action mt-4">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </div>
  );
};

export default CommunityMembers;
