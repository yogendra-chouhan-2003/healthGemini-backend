import express from "express";
import { body} from "express-validator";
import {CreateUser ,resetPassword, forgotPassword,verification,Authentication,googleAuth, Logout,GetUserHistory,addToFavorites,getAllFavorites,removeFavorite,createProfile,getUserProfile} from "../controller/user.controller.js";
import { auth } from "../middleware/auth.js";
import multer from "multer";

const upload = multer({dest:"public/profile"});
const router = express.Router();

router.post("/",
    body("name","Name is required").notEmpty(),
    body("name","Name must be at least 2 characters long").isLength({min:2}),
    body("email","Email is required").notEmpty(),
    body("email","Invalid email format").isEmail(),
    body("password","Password is required").notEmpty(),
    body("password","Password must be at least 6 characters long").isLength({min:6}),
    body("contact","Contact is required!!").notEmpty(),
    body("contact","Invalid contact number").isMobilePhone(),
    CreateUser
)
router.post("/verification",verification);
router.post("/authentication",Authentication);
router.post("/google", googleAuth);
router.delete("/logout",Logout);


router.get("/history",auth,GetUserHistory);
router.post("/favorate",auth,addToFavorites);
router.get("/favorates",auth,getAllFavorites);
router.delete("/favorites/:id", auth, removeFavorite);

//profile
router.patch("/profile",auth,upload.single("imageName"),createProfile);
router.get("/profile", auth, getUserProfile);

//forgot password
router.post("/forgot-password",forgotPassword);
router.put("/reset-password/:id",resetPassword);
export default router;