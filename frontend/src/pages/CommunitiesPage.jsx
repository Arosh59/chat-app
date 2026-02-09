import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { UseAuthStore } from "../store/UseAuthStore";
import { axiosInstance } from "../lib/axios";
import CommunityCard from "../components/CommunityCard";
import toast from "react-hot-toast";
import { X, Upload } from "lucide-react";

const CommunitiesPage = () => {
  const { communities, getCommunities } = useChatStore();
  const { authUser } = UseAuthStore();
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [imagePreviews, setImagePreviews] = useState({}); // Map of communityId to preview
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    getCommunities();
  }, []);

  // Define age categories
  const ageCategories = [
    {
      id: "children",
      name: "Children",
      description: "Ages 5-12",
      minAge: 5,
      maxAge: 12,
    },
    {
      id: "teens",
      name: "Teens",
      description: "Ages 13-19",
      minAge: 13,
      maxAge: 19,
    },
    {
      id: "youths",
      name: "Youths",
      description: "Ages 20-35",
      minAge: 20,
      maxAge: 35,
    },
    {
      id: "adults",
      name: "Adults",
      description: "Ages 36-60",
      minAge: 36,
      maxAge: 60,
    },
    {
      id: "elders",
      name: "Elders",
      description: "Ages 61+",
      minAge: 61,
      maxAge: 120,
    },
  ];

  // Filter communities by age category
  const getCommunitiesByCategory = (minAge, maxAge) => {
    return communities?.filter(
      (c) => c.minAge <= authUser?.age && authUser?.age <= c.maxAge
    ) || [];
  };

  const handleOpen = (community) => {
    // Age gating is enforced on backend
    navigate("/");
  };

  const handleEditImage = (community) => {
    // Allow opening the modal for any community
    setEditingCommunity(community);
    setImagePreviews({
      ...imagePreviews,
      [community._id]: community.image,
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && editingCommunity) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews({
          ...imagePreviews,
          [editingCommunity._id]: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (!editingCommunity) return;

    const imagePreview = imagePreviews[editingCommunity._id];
    if (!imagePreview) return;

    try {
      setIsUpdating(true);
      
      // Log for debugging
      console.log("Uploading image for community:", editingCommunity._id);
      console.log("Image preview length:", imagePreview.length);
      
      const res = await axiosInstance.put(`/communities/${editingCommunity._id}`, {
        image: imagePreview,
      });
      
      console.log("Update response:", res.data);
      
      // Get fresh communities from the server to ensure consistency
      await getCommunities();
      
      toast.success("Community image updated!");
      setEditingCommunity(null);
      setImagePreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[editingCommunity._id];
        return newPreviews;
      });
    } catch (error) {
      console.error("Error updating image:", error.response?.data || error.message);
      
      if (error.response?.status === 403) {
        toast.error("Only the community creator can edit the image");
      } else if (error.response?.status === 404) {
        toast.error("Community not found");
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to update community image");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const userAgeCategory = ageCategories.find(
    (cat) => authUser?.age >= cat.minAge && authUser?.age <= cat.maxAge
  );

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Communities</h1>
          <p className="text-base-content/70">
            {userAgeCategory
              ? `You're viewing communities for ${userAgeCategory.name}`
              : "Explore age-appropriate communities"}
          </p>
        </div>

        {/* Age Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {ageCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                const newSet = new Set(selectedCategories);
                if (newSet.has(cat.id)) {
                  newSet.delete(cat.id);
                } else {
                  newSet.add(cat.id);
                }
                setSelectedCategories(newSet);
              }}
              className={`btn btn-sm transition ${
                selectedCategories.has(cat.id)
                  ? "btn-primary"
                  : "btn-ghost"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Communities Grid - Show selected categories or user's category if none selected */}
        <div className="space-y-8">
          {ageCategories
            .filter(
              (cat) =>
                selectedCategories.size === 0
                  ? cat.id === userAgeCategory?.id
                  : selectedCategories.has(cat.id)
            )
            .map((category) => {
              const categoryComms = getCommunitiesByCategory(
                category.minAge,
                category.maxAge
              );

              return (
                <div key={category.id}>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                    <p className="text-base-content/60">{category.description}</p>
                  </div>

                  {categoryComms.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryComms.map((c) => (
                        <CommunityCard
                          key={c._id}
                          community={c}
                          onOpen={() => handleOpen(c)}
                          onEdit={() => handleEditImage(c)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-base-200 rounded-lg">
                      <p className="text-base-content/60">
                        No communities available in this category yet.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Info Box */}
        <div className="mt-12 p-6 bg-info/10 rounded-lg border border-info/20">
          <p className="text-sm text-base-content/70">
            💡 <strong>Age-Based Communities:</strong> Communities are organized by age groups to ensure you connect with people in your life stage. Your age ({authUser?.age}) determines which communities you can access.
          </p>
        </div>

        {/* Edit Community Image Modal */}
        {editingCommunity && (
          <dialog className="modal modal-open">
            <div className="modal-box max-w-md">
              <button
                onClick={() => {
                  setEditingCommunity(null);
                  setImagePreviews((prev) => {
                    const newPreviews = { ...prev };
                    delete newPreviews[editingCommunity._id];
                    return newPreviews;
                  });
                }}
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              >
                <X size={20} />
              </button>

              <h3 className="font-bold text-lg mb-4">Edit Community Image</h3>
              <p className="text-sm text-base-content/70 mb-4">{editingCommunity.name}</p>

              {/* Image Preview */}
              <div className="mb-4">
                {imagePreviews[editingCommunity._id] ? (
                  <div className="relative">
                    <img
                      src={imagePreviews[editingCommunity._id]}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 hover:opacity-100 transition cursor-pointer">
                      <div className="text-center text-white">
                        <Upload size={32} className="mx-auto mb-2" />
                        <p className="text-sm">Click to change</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-base-300 rounded-lg cursor-pointer hover:border-primary transition">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                    <div className="text-center">
                      <Upload size={32} className="mx-auto text-base-content/40 mb-2" />
                      <p className="text-sm font-medium">Click to upload image</p>
                    </div>
                  </label>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost flex-1"
                  onClick={() => {
                    setEditingCommunity(null);
                    setImagePreviews((prev) => {
                      const newPreviews = { ...prev };
                      delete newPreviews[editingCommunity._id];
                      return newPreviews;
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleSaveImage}
                  disabled={isUpdating || !imagePreviews[editingCommunity._id] || imagePreviews[editingCommunity._id] === editingCommunity.image}
                >
                  {isUpdating ? <span className="loading loading-spinner" /> : "Save"}
                </button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={() => setEditingCommunity(null)}>
              <button>close</button>
            </form>
          </dialog>
        )}
      </div>
    </div>
  );
};

export default CommunitiesPage;
