import express from "express";
const router = express.Router();
import {ContactUs} from "../controller/contact.controller.js";

router.post("/",ContactUs);

export default router;