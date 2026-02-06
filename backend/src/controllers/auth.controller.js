import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    const { fullName, email, password, age } = req.body;
    try {

        if (!fullName || !email || !password || !age) {
            return res.status(400).json({ message: "Please enter all required fields." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        if (isNaN(age) || age < 5 || age > 100) {
            return res.status(400).json({ message: "Age must be between 5 and 100." });
        }
        
        const user = await User.findOne({ email });

        if(user) return res.status(400).json({ message: "User already exists." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName, 
            email,
            password: hashedPassword,
            age: parseInt(age),
        });

        if (newUser) {
            generateToken(newUser._id,res)
            await newUser.save();
            
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                age: newUser.age,
                profilePic: newUser.profilePic,
            });

        } else {
            res.status(400).json({ message: "Invalid user data." });
        }
        
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
        
    }
};

export const login = async(req, res) => {
    const { email, password } = req.body;
try {
    const user = await User.findOne({ email });

    if(!user) {
        return res.status(400).json({ message: "Invalid credintials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if(!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid credintials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        profilePic: user.profilePic,
        status: user.status,
        theme: user.theme,
        language: user.language,
        wallpaper: user.wallpaper,
        isOnline: user.isOnline,
    });

} catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error"});

} 
};

export const logout = (req, res) => {
    try{
        res.cookie("jwt", "", {maxAge:0});
        res.status(200).json({ message: "Logged out successfully" });

    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error"});

    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, fullName, status, wallpaper } = req.body;
        const userId = req.user._id;

        const updateData = {};

        if (profilePic) {
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            updateData.profilePic = uploadResponse.secure_url;
        }

        if (fullName) {
            updateData.fullName = fullName;
        }

        if (status) {
            updateData.status = status;
        }

        if (wallpaper) {
            const uploadResponse = await cloudinary.uploader.upload(wallpaper);
            updateData.wallpaper = uploadResponse.secure_url;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {new: true});

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
};

export const checkAuth = (req, res) => {
  try {
    // If your authMiddleware is working, req.user is already populated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - No User Found" });
    }
    res.status(200).json({
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      age: req.user.age,
      profilePic: req.user.profilePic,
      status: req.user.status,
      theme: req.user.theme,
      language: req.user.language,
      wallpaper: req.user.wallpaper,
      isOnline: req.user.isOnline,
    });
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};