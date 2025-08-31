import { User } from "../model/user.model.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
dotenv.config();

//resetPassword
export const resetPassword = async (req, res) => {
    const { password } = req.body;
    const { id } = req.params;
    try {
        let saltKey = await bcrypt.genSaltSync(12);
        const hashedPassword = await bcrypt.hashSync(password, saltKey);
        console.log(hashedPassword);
        //const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(id, { password: hashedPassword });

        res.status(200).json({ message: "Password reset successful!" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internal server error!" });
    }
}

//forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });
        if (!user.isVerified) return res.status(401).json({ message: "Email not verified" });

        return res.status(200).json({ message: "User verified, reset allowed", userId: user._id });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internal server error!" });
    }
}

//profile
export const getUserProfile = async (req, res) => {
    let userId = req.user.userId;
    try {
        let user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(400).json({ error: "User not found!" });
        }
        user.profile.imageName = "http://localhost:3000/user/profile/" + user.profile.imageName;
        return res.status(201).json({ message: user });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internal server error!" });
    }
}

export const createProfile = async (req, res) => {
    try {
        let userId = req.user.userId;
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: "User not found!" });
        }

        user.profile.imageName = req.file.filename;
        user.profile.address = req.body.address;
        user.profile.name = req.body.name ?? user.name;
        user.profile.email = req.body.email ?? user.email;
        user.profile.contact = req.body.contact ?? user.contact;
        user.profile.age = req.body.age ?? user.age;
        user.profile.gender = req.body.gender ?? user.gender;

        user.save();
        return res.status(201).json({ message: "Profile created!", profile: user.profile });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internalserver error!" });
    }
}

export const removeFavorite = async (req, res) => {
    let userId = req.user.userId;
    let favoriteId = req.params.id;
    try {

        let result = await User.findByIdAndUpdate(userId, { $pull: { favorites: { _id: favoriteId } } })
        if (!result) {
            return res.status(400).json({ error: "User not found!" });
        }
        return res.status(201).json({ message: "Favorite removed successfully!", favorites: "result.favorites" })


    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internal server error!" });
    }
}

export const getAllFavorites = async (req, res) => {
    const userId = req.user.userId;
    try {
        let user = await User.findById(userId).select("favorites");
        if (!user.favorites) {
            return res.status(200).json({ message: "you don't have favorites yet!", favorites: [] });
        }
        let sortedFavorites = user.favorites.sort((a, b) => { return b.savedAt - a.savedAt });

        return res.status(201).json({ message: sortedFavorites });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internal servver Error!" });
    }
}

export const addToFavorites = async (req, res) => {
    const { prompt, response, category } = req.body;
    const userId = req.user.userId;
    if (!prompt || !response) {
        return res.status(400).json({ error: "Prompt and response are required." });
    }

    try {
        const result = await User.findByIdAndUpdate(userId, {
            $push: {
                favorites: { prompt, response, category }
            }
        });
        return res.status(201).json({ message: "Added to favorites!" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error!" });
    }
}

export const GetUserHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select("history");

        return res.status(200).json({ history: user.history });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Unable to fetch history!" });
    }
};


export const CreateUser = async (req, res) => {
    try {
        let error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(401).json({ error: "bad request" });
        }

        let { name, email, password, contact } = req.body;
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Email already exists!" });
        }
        let saltKey = await bcrypt.genSalt(12);
        password = await bcrypt.hash(password, saltKey);
        let result = await User.create({ name, email, password, contact });
        await sendEmail(email, name);

        return res.status(201).json({ message: "user created & open email to verify account!", user: result });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internal server error!" });
    }
}

const sendEmail = (email, name) => {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        //https://health-suggestion-app-backend.onrender.com
        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Account Verification',
            html: `<h4>Dear ${name}</h4>
            <p>Thank you for registration. To verify account please click on below button</p>
            <form method="post" action="https://health-suggestion-app-backend.onrender.com/user/verification">
              <input type="hidden" name="email" value="${email}"/>
              <button type="submit" style="background-color: blue; color:white; width:200px; border: none; border: 1px solid grey; border-radius:10px;">Verify</button>
            </form>
            <p>
               <h6>Thank you</h6>
               Healify Bot Team.
            </p>
            `
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });

}

export const verification = async (req, res) => {
    try {
        let { email } = req.body;
        let result = await User.updateOne({ email }, { $set: { isVerified: true } });
        return res.status(201).json({ message: "Account Verified successfully!", result });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internal server error!!" });
    }
}

export const Authentication = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required!" });
        }
        const user = await User.findOne({ email });
        console.log(user);

        if (!user) {
            return res.status(401).json({ error: "Unauthorized user || Email is not found!" });
        }
        if (!user.isVerified) {
            return res.status(401).json({ error: "user is not verified!!" });
        }
        let status = bcrypt.compareSync(password, user.password);
        status && res.cookie("token", generateToken(user._id, user.email), {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });
        return status ? res.status(201).json({ message: "sign-in is successfull!", user }) : res.status(401).json({ error: "Unauthorized user || password is not found!" });


    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internal server error!!" });
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, name, picture } = ticket.getPayload();

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ name, email, password: "", contact: "", isVerified: true, profile: { imageName: picture } });
        }else if (!user.isVerified) {
            // Existing user ko verify kar do
            user.isVerified = true;
            await user.save();
        }

        // JWT token same tarike se set karo jaise Authentication me
        const jwtToken = jwt.sign({ userId: user._id, userEmail: user.email }, process.env.TOKEN_SECRET);
        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        return res.status(200).json({ message: "Google login success", user });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Google login failed" });

    }
}

const generateToken = (userId, userEmail) => {
    let payload = { userId, userEmail };
    let token = jwt.sign(payload, process.env.TOKEN_SECRET);
    console.log(token);
    return token;
}

export const Logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        res.status(201).json({ message: "Logout successfull!!!" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internal server error!!" });
    }
}