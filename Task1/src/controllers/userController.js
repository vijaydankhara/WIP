import UserServices from "../services/userServices.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { ThrowError } from "../utils/ErrorUtils.js";

const userServices = new UserServices();

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Register User
export const registerUser = async (req, res) => {
  try {
    let user = await userServices.getUser({ email: req.body.email });
    if (user) {
      return res.status(400).json({ message: "User is already registered." });
    }
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    user = await userServices.addNewUser({
      ...req.body,
      password: hashPassword,
    });

    res.status(201).json({ user, message: "New user added successfully." });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    let user = await userServices.getUser({
      email: req.body.email,
      isDelete: false,
    });
    if (!user) {
      return res.status(400).json({
        message: ` Email Not Found..Please Check Your Email Address.`,
      });
    }
    let chekPassword = await bcrypt.compare(req.body.password, user.password);
    if (!chekPassword) {
      return res.status(401).json({
        message: ` Password is Not Match Please Enter Correct Password..`,
      });
    }
    let token = jwt.sign({ userId: user._id }, "User");
    console.log(token);
    res.status(200).json({ token, message: `Login SuccesFully..` });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { userId } = req.query;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password are required." });
    }
    let user = await userServices.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }
    if (newPassword === oldPassword) {
      return res
        .status(400)
        .json({ message: "New password can not be the same as old password." });
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await userServices.updateUser(userId, { password: hashPassword });

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

// Forgot Password (Send OTP)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Provide Email Id" });
    }

    const user = await userServices.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }

    // Ensure user is a valid Mongoose document
    if (!(user instanceof mongoose.Model)) {
      return res.status(500).json({ message: "Invalid user data" });
    }

    // Generate OTP
    const otp = generateOTP();
    user.resetOTP = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    await user.save(); // Save OTP in the database

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MY_GMAIL,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "OTP sent successfully to your email." });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

// Reset Password using OTP
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email, OTP, and new password." });
    }

    const user = await userServices.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate OTP
    if (user.resetOTP !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Hash new password
    user.password = await bcrypt.hash(password, 10);
    user.resetOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    //  Generate a new JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Password reset successfully.",
      user: { id: user._id, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};
