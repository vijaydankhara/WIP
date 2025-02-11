import express from "express";
import { registerUser ,loginUser,changePassword,forgotPassword,resetPassword} from "../controllers/userController.js";

const usersRoutes = express.Router();

usersRoutes.post("/registerUser", registerUser);
usersRoutes.post("/loginUser", loginUser);
usersRoutes.post("/changePassword", changePassword);
usersRoutes.post("/forgotPassword", forgotPassword);
usersRoutes.post("/resetPassword", resetPassword);

export default usersRoutes;
