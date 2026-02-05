import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const JoinCommunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSelectedCommunity } = useChatStore();

  useEffect(() => {
    const join = async () => {
      try {
        const res = await axiosInstance.get(`/communities/share-link/${id}`);
        // For now, we simply set selected community and navigate home
        setSelectedCommunity({ _id: id, name: res.data.communityName });
        toast.success("Joined community");
        navigate("/");
      } catch (error) {
        toast.error("Failed to join community");
        navigate("/communities");
      }
    };
    join();
  }, [id]);

  return <div className="container mx-auto py-24">Joining community...</div>;
};

export default JoinCommunity;
