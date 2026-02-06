import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

// Predefined wallpapers with solid colors and gradients
const WALLPAPERS = [
  { id: 1, name: "White", bg: "bg-white" },
  { id: 2, name: "Light Gray", bg: "bg-gray-100" },
  { id: 3, name: "Dark", bg: "bg-gray-900" },
  { id: 4, name: "Blue Gradient", bg: "bg-gradient-to-br from-blue-400 to-blue-600" },
  { id: 5, name: "Purple Gradient", bg: "bg-gradient-to-br from-purple-400 to-purple-600" },
  { id: 6, name: "Green Gradient", bg: "bg-gradient-to-br from-green-400 to-green-600" },
  { id: 7, name: "Orange Gradient", bg: "bg-gradient-to-br from-orange-400 to-orange-600" },
  { id: 8, name: "Pink Gradient", bg: "bg-gradient-to-br from-pink-400 to-pink-600" },
];

const WallpaperSelector = ({ currentWallpaper, onSelect, onClose }) => {
  const [selectedId, setSelectedId] = useState(currentWallpaper || WALLPAPERS[0].id);

  const handleSelect = (wallpaperId) => {
    setSelectedId(wallpaperId);
  };

  const handleSave = () => {
    const selected = WALLPAPERS.find((w) => w.id === selectedId);
    onSelect(selected.bg);
    toast.success("Wallpaper updated!");
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X size={20} />
        </button>

        <h3 className="font-bold text-lg mb-4">Choose Chat Wallpaper</h3>

        {/* Upload from device */}
        <div className="mb-4">
          <label htmlFor="wallpaper-upload" className="btn btn-sm mr-2">Upload from device</label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="wallpaper-upload"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => {
                const base64 = reader.result;
                onSelect(base64);
                toast.success("Wallpaper uploaded!");
                onClose();
              };
            }}
          />
        </div>

        {/* Wallpaper Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 max-h-64 overflow-y-auto">
          {WALLPAPERS.map((wallpaper) => (
            <button
              key={wallpaper.id}
              onClick={() => handleSelect(wallpaper.id)}
              className={`relative h-24 rounded-lg border-2 transition overflow-hidden ${
                selectedId === wallpaper.id
                  ? "border-primary"
                  : "border-base-300 hover:border-primary/50"
              }`}
            >
              {/* Wallpaper Preview */}
              <div className={`w-full h-full ${wallpaper.bg}`} />

              {/* Selected Checkmark */}
              {selectedId === wallpaper.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="bg-primary rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
              )}

              {/* Label */}
              <p className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs p-1 text-center">
                {wallpaper.name}
              </p>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            className="btn btn-ghost flex-1"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={handleSave}
          >
            Apply
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </div>
  );
};

export default WallpaperSelector;
