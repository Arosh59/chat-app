import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { Image as ImageIcon, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const CreateCommunityPage = () => {
  const navigate = useNavigate();
  const { createCommunity } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    minAge: "13",
    maxAge: "35",
    image: null,
    imagePreview: null,
  });

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: reader.result,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Community name is required");
      return;
    }

    const minAge = parseInt(formData.minAge);
    const maxAge = parseInt(formData.maxAge);

    if (minAge > maxAge) {
      toast.error("Min age must be less than max age");
      return;
    }

    try {
      setLoading(true);
      const res = await createCommunity({
        name: formData.name,
        description: formData.description,
        minAge,
        maxAge,
        image: formData.image,
      });

      if (res) {
        toast.success("Community created successfully!");
        navigate("/communities");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-circle"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Create Community</h1>
            <p className="text-base-content/60">Start a new community for your age group</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Community Name *</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Gaming Enthusiasts"
              className="input input-bordered"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              placeholder="Describe your community..."
              className="textarea textarea-bordered h-24"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Image Upload */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Community Image</span>
            </label>
            <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-base-300 rounded-lg cursor-pointer hover:border-primary transition">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
              <div className="text-center">
                {formData.imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-sm text-base-content/60">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon size={32} className="mx-auto text-base-content/40" />
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs text-base-content/60">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Age Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Min Age *</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={formData.minAge}
                onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
                min="5"
                max="100"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Max Age *</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={formData.maxAge}
                onChange={(e) => setFormData({ ...formData, maxAge: e.target.value })}
                min="5"
                max="100"
                required
              />
            </div>
          </div>

          {/* Age Category Info */}
          <div className="alert alert-info">
            <p className="text-sm">
              Your community will be visible to users aged {formData.minAge}-{formData.maxAge} years old.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              className="btn btn-ghost flex-1"
              onClick={() => navigate("/communities")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading || !formData.name}
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Community"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityPage;
