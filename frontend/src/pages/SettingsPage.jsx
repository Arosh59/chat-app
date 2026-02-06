import { useState } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { UseAuthStore } from "../store/UseAuthStore";
import { THEMES } from "../constants";
import {
  ChevronRight,
  User,
  Users,
  QrCode,
  MessageCircle,
  Palette,
  Globe,
  HelpCircle,
  Info,
  Moon,
  Bell,
  Lock,
  Save,
  X,
  Camera,
  Image,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import WallpaperSelector from "../components/WallpaperSelector";
import QRGenerator from "../components/QRGenerator";

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { authUser, updateProfile, logout } = UseAuthStore();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null);
  const [age, setAge] = useState(authUser?.age || "");
  const [language, setLanguage] = useState(authUser?.language || "en");
  const [wallpaper, setWallpaperState] = useState(authUser?.wallpaper || "bg-base-100");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [nameInput, setNameInput] = useState(authUser?.fullName || "");
  const [statusInput, setStatusInput] = useState(authUser?.status || "");

  const handleAgeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value && (parseInt(value) < 13 || parseInt(value) > 120)) return;
    setAge(value);
  };

  const handleSaveAge = async () => {
    if (!age || parseInt(age) < 13) {
      toast.error("Age must be 13 or older");
      return;
    }
    try {
      setIsSaving(true);
      await updateProfile({ age: parseInt(age) });
      toast.success("Age updated!");
      setActiveModal(null);
    } catch (error) {
      toast.error("Failed to update age");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = async (lang) => {
    try {
      setIsSaving(true);
      await updateProfile({ language: lang });
      setLanguage(lang);
      toast.success("Language updated!");
      setActiveModal(null);
    } catch (error) {
      toast.error("Failed to update language");
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    try {
      await updateProfile({ theme: newTheme });
      toast.success("Theme updated!");
      setActiveModal(null);
    } catch (error) {
      toast.error("Failed to update theme");
    }
  };

  const handleWallpaperSelect = async (wallpaperClass) => {
    try {
      setIsSaving(true);
      await updateProfile({ wallpaper: wallpaperClass });
      setWallpaperState(wallpaperClass);
      toast.success("Wallpaper updated!");
      setActiveModal(null);
    } catch (error) {
      toast.error("Failed to update wallpaper");
    } finally {
      setIsSaving(false);
    }
  };

  // WhatsApp-style settings sections
  const settingsSections = [
    {
      id: "profile",
      title: "Profile",
      items: [
        {
          icon: <Camera size={20} />,
          label: "Avatar",
          description: "Update your profile photo",
          action: () => setActiveModal("avatar"),
          badge: null,
        },
        {
          icon: <User size={20} />,
          label: `${authUser?.fullName || "User"}`,
          description: "Edit your name",
          action: () => setActiveModal("name"),
          badge: null,
        },
        {
          icon: <MessageCircle size={20} />,
          label: "About",
          description: authUser?.status || "Available",
          action: () => setActiveModal("status"),
          badge: null,
        },
      ],
    },
    {
      id: "account",
      title: "Account",
      items: [
        {
          icon: <Users size={20} />,
          label: "Communities",
          description: `Age: ${authUser?.age || "Not set"}`,
          action: () => navigate("/communities"),
          badge: null,
        },
        {
          icon: <QrCode size={20} />,
          label: "Linked Devices",
          description: "Link a new device with QR code",
          action: () => setActiveModal("qr"),
          badge: null,
        },
      ],
    },
    {
      id: "chats",
      title: "Chats",
      items: [
        {
          icon: <Palette size={20} />,
          label: "Chat Wallpaper",
          description: "Choose or upload wallpaper",
          action: () => setActiveModal("wallpaper"),
          badge: null,
        },
        {
          icon: <Globe size={20} />,
          label: "Font Size",
          description: "Adjust text size",
          action: () => setActiveModal("font"),
          badge: null,
        },
        {
          icon: <Bell size={20} />,
          label: "Chat Backup",
          description: "Back up your chats",
          action: () => toast.success("Backup started"),
          badge: null,
        },
      ],
    },
    {
      id: "display",
      title: "Display",
      items: [
        {
          icon: <Palette size={20} />,
          label: "Theme",
          description: `${theme.charAt(0).toUpperCase() + theme.slice(1)}`,
          action: () => setActiveModal("theme"),
          badge: null,
        },
        {
          icon: <Globe size={20} />,
          label: "Language",
          description: language === "en" ? "English" : language === "si" ? "Sinhala" : "Tamil",
          action: () => setActiveModal("language"),
          badge: null,
        },
      ],
    },
        {
          id: "privacy",
          title: "Privacy & Security",
          items: [
            {
              icon: <Lock size={20} />,
              label: "Privacy",
              description: "Manage who can message you",
              action: () => setActiveModal("privacy"),
              badge: null,
            },
          ],
        },
        {
          id: "help",
          title: "Help",
          items: [
            {
              icon: <HelpCircle size={20} />,
              label: "Help Center",
              description: "Get help with the app",
              action: () => setActiveModal("helpcenter"),
              badge: null,
            },
            {
              icon: <Info size={20} />,
              label: "About",
              description: "Chatty v1.0.0 • Built with ❤️",
              action: () => setActiveModal("about"),
              badge: null,
            },
          ],
        },
  ];

  return (
    <div className="min-h-screen bg-base-100 pt-20 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="px-4 mb-6">
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-base-content/60 text-sm mt-1">
            @{authUser?.email?.split("@")[0]}
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6 px-4">
          {settingsSections.map((section) => (
            <div key={section.id} className="space-y-3">
              {/* Section Header */}
              <h2 className="px-4 text-sm font-semibold text-primary uppercase tracking-wider">
                {section.title}
              </h2>

              {/* Section Items */}
              <div className="bg-base-200/50 rounded-xl overflow-hidden divide-y divide-base-300">
                {section.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-base-300/50 transition-colors text-left active:bg-base-300"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="text-primary shrink-0 w-6 h-6 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base text-base-content">{item.label}</p>
                        <p className="text-xs text-base-content/60 mt-0.5 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-base-content/40 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full btn btn-outline btn-error btn-lg gap-2 mt-8"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Age Modal */}
      {activeModal === "age" && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <button
              onClick={() => setActiveModal(null)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">🎂</span> Your Age
            </h3>
            <p className="text-sm text-base-content/70 mb-4">
              Your age helps us show you age-appropriate communities.
            </p>
            <div className="form-control gap-4">
              <input
                type="number"
                value={age}
                onChange={handleAgeChange}
                placeholder="Enter your age"
                className="input input-bordered w-full text-center text-2xl font-bold"
                min="13"
                max="120"
              />
              <div className="flex gap-3">
                <button
                  className="btn btn-ghost flex-1"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleSaveAge}
                  disabled={isSaving || !age}
                >
                  {isSaving ? <span className="loading loading-spinner" /> : "Save"}
                </button>
              </div>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setActiveModal(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* Theme Modal */}
      {activeModal === "theme" && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <button
              onClick={() => setActiveModal(null)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-4">Choose Theme</h3>
            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {THEMES.map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`p-3 rounded-lg border-2 transition ${
                    theme === t ? "border-primary bg-primary/10" : "border-base-300"
                  }`}
                >
                  <div className="h-12 w-full rounded mb-2" data-theme={t}>
                    <div className="h-full grid grid-cols-4 gap-px p-1">
                      <div className="rounded bg-primary"></div>
                      <div className="rounded bg-secondary"></div>
                      <div className="rounded bg-accent"></div>
                      <div className="rounded bg-neutral"></div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-center truncate">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setActiveModal(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* Language Modal */}
      {activeModal === "language" && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <button
              onClick={() => setActiveModal(null)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-4">Select Language</h3>
            <div className="space-y-2">
              {[
                { code: "en", name: "English" },
                { code: "si", name: "Sinhala" },
                { code: "ta", name: "Tamil" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-4 py-3 rounded-lg border transition ${
                    language === lang.code
                      ? "border-primary bg-primary/10 font-semibold"
                      : "border-base-300 hover:border-primary"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setActiveModal(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* Wallpaper Selector Modal */}
      {activeModal === "wallpaper" && (
        <WallpaperSelector
          currentWallpaper={wallpaper}
          onSelect={handleWallpaperSelect}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Avatar Modal */}
      {activeModal === "avatar" && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-sm">
            <button
              onClick={() => setActiveModal(null)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-4">Update Avatar</h3>
            <div className="flex flex-col items-center gap-4 mb-4">
              <img
                src={avatarPreview || authUser.profilePic || "/avatar.png"}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover"
              />
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => setAvatarPreview(reader.result);
                }}
              />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost flex-1" onClick={() => setActiveModal(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={async () => {
                  if (!avatarPreview) return toast.error("Select an image first");
                  try {
                    setIsSaving(true);
                    await updateProfile({ profilePic: avatarPreview });
                    toast.success("Avatar updated");
                    setActiveModal(null);
                  } catch (err) {
                    toast.error("Failed to update avatar");
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? <span className="loading loading-spinner" /> : "Save"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setActiveModal(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* Name Modal */}
      {activeModal === "name" && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-sm">
            <button
              onClick={() => setActiveModal(null)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-4">Edit Name</h3>
            <input
              className="input input-bordered w-full mb-4"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Full name"
            />
            <div className="flex gap-2">
              <button className="btn btn-ghost flex-1" onClick={() => setActiveModal(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={async () => {
                  if (!nameInput) return toast.error("Name cannot be empty");
                  try {
                    setIsSaving(true);
                    await updateProfile({ fullName: nameInput });
                    toast.success("Name updated");
                    setActiveModal(null);
                  } catch (err) {
                    toast.error("Failed to update name");
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? <span className="loading loading-spinner" /> : "Save"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setActiveModal(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* Status / About Modal */}
      {activeModal === "status" && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-sm">
            <button
              onClick={() => setActiveModal(null)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-4">Edit About</h3>
            <textarea
              className="textarea textarea-bordered w-full mb-4"
              rows={4}
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              placeholder="A short status or about"
            />
            <div className="flex gap-2">
              <button className="btn btn-ghost flex-1" onClick={() => setActiveModal(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={async () => {
                  try {
                    setIsSaving(true);
                    await updateProfile({ status: statusInput });
                    toast.success("About updated");
                    setActiveModal(null);
                  } catch (err) {
                    toast.error("Failed to update about");
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? <span className="loading loading-spinner" /> : "Save"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setActiveModal(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* Privacy Modal */}
      {activeModal === "privacy" && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <button
              onClick={() => setActiveModal(null)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-4">Privacy & Security</h3>
            <p className="text-sm mb-4">Manage who can message you and other privacy options. (Placeholder)</p>
            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setActiveModal(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* Help Center Modal */}
      {activeModal === "helpcenter" && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <button
              onClick={() => setActiveModal(null)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-4">Help & Support</h3>
            <p className="text-sm mb-4">Visit our docs or contact support at support@example.com (placeholder)</p>
            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setActiveModal(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* About Modal */}
      {activeModal === "about" && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <button
              onClick={() => setActiveModal(null)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-4">About Chatty</h3>
            <p className="text-sm mb-4">Chatty v1.0.0 — A tiny real-time chat app example. Built with React, Node, Socket.io.</p>
            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setActiveModal(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* QR Code Modal */}
      {activeModal === "qr" && (
        <dialog className="modal modal-open">
          <div className="modal-box text-center max-w-md">
            <button
              onClick={() => setActiveModal(null)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-4 flex items-center justify-center gap-2">
              <QrCode size={24} /> Link New Device
            </h3>
            <p className="text-sm text-base-content/70 mb-4">
              Scan this QR code with another device to link it to your account.
            </p>
            <div className="mx-auto w-full">
              <QRGenerator />
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setActiveModal(null)}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default SettingsPage;