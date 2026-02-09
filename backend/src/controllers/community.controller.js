import Community from "../models/community.model.js";
import Message from "../models/message.model.js";
import { io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

export const createCommunity = async (req, res) => {
  try {
    const { name, description, minAge, maxAge, image } = req.body;
    const createdBy = req.user._id;

    if (!name || minAge === undefined || maxAge === undefined) {
      return res.status(400).json({ error: "Name and age range are required" });
    }

    let imageUrl = "";
    if (image) {
      // Create new community first to get its ID
      const tempCommunity = new Community({
        name,
        description,
        minAge: parseInt(minAge),
        maxAge: parseInt(maxAge),
        isElderly: maxAge > 60,
        members: [createdBy],
        createdBy,
      });
      
      // Save temporarily to get the _id
      await tempCommunity.save();
      
      // Upload image with unique public_id
      const uploadResponse = await cloudinary.uploader.upload(image, {
        resource_type: "auto",
        public_id: `community_${tempCommunity._id}_image`,
      });
      imageUrl = uploadResponse.secure_url;
      
      // Update with image URL
      tempCommunity.image = imageUrl;
      await tempCommunity.save();
      await tempCommunity.populate("createdBy", "fullName profilePic");
      
      return res.status(201).json(tempCommunity);
    }

    const newCommunity = new Community({
      name,
      description,
      image: imageUrl,
      minAge: parseInt(minAge),
      maxAge: parseInt(maxAge),
      isElderly: maxAge > 60,
      members: [createdBy],
      createdBy,
    });

    await newCommunity.save();
    await newCommunity.populate("createdBy", "fullName profilePic");

    res.status(201).json(newCommunity);
  } catch (error) {
    console.log("Error in createCommunity:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { name, description, image } = req.body;
    const userId = req.user._id;
    const isAdmin = req.user.isAdmin;

    console.log("Update community request:", { communityId, userId, isAdmin });

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    console.log("Community found:", { id: community._id, createdBy: community.createdBy, members: community.members?.length });

    // Check if user is a member of the community or is an admin
    const currentUserId = userId.toString();
    const isMember = community.members?.some(m => m.toString() === currentUserId);

    // Allow editing if user is a member or an admin
    if (!isMember && !isAdmin) {
      return res.status(403).json({ error: "Only community members and admins can update the community" });
    }

    if (name) community.name = name;
    if (description) community.description = description;

    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          resource_type: "auto",
          public_id: `community_${communityId}_image`,
          overwrite: true,
        });
        community.image = uploadResponse.secure_url;
      } catch (uploadError) {
        console.log("Cloudinary upload error:", uploadError.message);
        return res.status(400).json({ error: "Image upload failed: " + uploadError.message });
      }
    }

    await community.save();
    res.status(200).json(community);
  } catch (error) {
    console.log("Error in updateCommunity:", error.message);
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user._id;
    const userAge = req.user.age;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Age validation
    if (userAge < community.minAge || userAge > community.maxAge) {
      return res.status(403).json({ 
        error: `Age not in range. Community requires ages ${community.minAge}-${community.maxAge}. Your age: ${userAge}` 
      });
    }

    if (community.members.includes(userId)) {
      return res.status(400).json({ error: "Already a member of this community" });
    }

    community.members.push(userId);
    await community.save();
    await community.populate("members", "fullName profilePic age");

    res.status(200).json(community);
  } catch (error) {
    console.log("Error in joinCommunity:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    community.members = community.members.filter(m => m.toString() !== userId.toString());
    await community.save();

    res.status(200).json({ message: "Left community successfully" });
  } catch (error) {
    console.log("Error in leaveCommunity:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId)
      .populate("createdBy", "fullName profilePic")
      .populate("members", "fullName profilePic age");

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    res.status(200).json(community);
  } catch (error) {
    console.log("Error in getCommunity:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("createdBy", "fullName profilePic")
      .populate("members", "fullName");

    res.status(200).json(communities);
  } catch (error) {
    console.log("Error in getAllCommunities:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendCommunityMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { communityId } = req.params;
    const senderId = req.user._id;

    const newMessage = new Message({
      senderId,
      groupId: communityId, // Add this field to your Message model
      text,
      image,
    });

    await newMessage.save();

    // SOCKET.IO: Broadcast to everyone in this community "room"
    io.to(communityId).emit("newCommunityMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

 

  export const getMyCommunities = async (req, res) => {
  try {
    const userAge = req.user.age;
    let query;

    if (userAge >= 31) {
      // Logic for Elders
      query = { isElderly: true };
    } else {
      // Logic for specific age ranges
      query = { minAge: { $lte: userAge }, maxAge: { $gte: userAge } };
    }

    const communities = await Community.find(query);
    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCommunityMessages = async (req, res) => {
  try {
    const { communityId } = req.params;

    // Find all messages belonging to this community group
    const messages = await Message.find({ groupId: communityId })
      .populate("senderId", "fullName profilePic"); // This lets us show the sender's name/photo

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getCommunityMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCommunityMembers = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId).populate(
      "members",
      "fullName profilePic age isAdmin"
    );

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    res.status(200).json(community.members);
  } catch (error) {
    console.log("Error in getCommunityMembers: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { communityId, memberId } = req.params;
    const adminId = req.user._id;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Check if requester is the creator/admin
    if (community.createdBy.toString() !== adminId.toString()) {
      return res.status(403).json({ error: "Only community creator can remove members" });
    }

    community.members = community.members.filter(
      (m) => m.toString() !== memberId
    );

    await community.save();

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.log("Error in removeMember: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const promoteMember = async (req, res) => {
  try {
    const { communityId, memberId } = req.params;
    const adminId = req.user._id;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Check if requester is the creator/admin
    if (community.createdBy.toString() !== adminId.toString()) {
      return res.status(403).json({ error: "Only community creator can promote members" });
    }

    // Note: This is a placeholder. You might need to add an 'admins' array to Community model
    // For now, we'll just return success
    res.status(200).json({ message: "Member promoted successfully" });
  } catch (error) {
    console.log("Error in promoteMember: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};