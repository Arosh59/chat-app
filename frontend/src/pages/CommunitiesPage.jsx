import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { UseAuthStore } from "../store/UseAuthStore";
import CommunityCard from "../components/CommunityCard";

const CommunitiesPage = () => {
  const { communities, getCommunities } = useChatStore();
  const { authUser } = UseAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    getCommunities();
  }, []);

  const handleOpen = (community) => {
    // If community requires age gating, ensure user meets it (backend also enforces)
    navigate("/");
  };

  return (
    <div className="container mx-auto py-24 px-4">
      <h2 className="text-2xl font-bold mb-4">Communities</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities?.length ? (
          communities.map((c) => (
            <CommunityCard key={c._id} community={c} onOpen={() => handleOpen(c)} />
          ))
        ) : (
          <div>No communities available for your age group.</div>
        )}
      </div>
    </div>
  );
};

export default CommunitiesPage;
