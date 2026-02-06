import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { UseAuthStore } from "../store/UseAuthStore";
import CommunityCard from "../components/CommunityCard";

const CommunitiesPage = () => {
  const { communities, getCommunities } = useChatStore();
  const { authUser } = UseAuthStore();
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState("all");

  useEffect(() => {
    getCommunities();
  }, []);

  // Define age categories
  const ageCategories = [
    {
      id: "children",
      name: "👶 Children",
      emoji: "👶",
      description: "Ages 5-12",
      minAge: 5,
      maxAge: 12,
    },
    {
      id: "teens",
      name: "🧒 Teens",
      emoji: "🧒",
      description: "Ages 13-19",
      minAge: 13,
      maxAge: 19,
    },
    {
      id: "youths",
      name: "👨 Youths",
      emoji: "👨",
      description: "Ages 20-35",
      minAge: 20,
      maxAge: 35,
    },
    {
      id: "adults",
      name: "👴 Adults",
      emoji: "👴",
      description: "Ages 36-60",
      minAge: 36,
      maxAge: 60,
    },
    {
      id: "elders",
      name: "👵 Elders",
      emoji: "👵",
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

        {/* Age Category Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
          {ageCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setExpandedCategory(cat.id)}
              className={`btn btn-sm md:btn-md whitespace-nowrap transition ${
                expandedCategory === cat.id || cat.id === userAgeCategory?.id
                  ? "btn-primary"
                  : "btn-ghost"
              }`}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="hidden sm:inline">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Communities Grid - Show selected or user's category */}
        <div className="space-y-8">
          {ageCategories
            .filter(
              (cat) =>
                cat.id === expandedCategory ||
                (expandedCategory === "all" && cat.id === userAgeCategory?.id)
            )
            .map((category) => {
              const categoryComms = getCommunitiesByCategory(
                category.minAge,
                category.maxAge
              );

              return (
                <div key={category.id}>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <span className="text-3xl">{category.emoji}</span>
                      {category.name}
                    </h2>
                    <p className="text-base-content/60">{category.description}</p>
                  </div>

                  {categoryComms.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryComms.map((c) => (
                        <CommunityCard
                          key={c._id}
                          community={c}
                          onOpen={() => handleOpen(c)}
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
      </div>
    </div>
  );
};

export default CommunitiesPage;
