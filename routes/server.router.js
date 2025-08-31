import express from "express";
import { CreateServer } from "../controller/server.controller.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();

router.post("/ask",auth,CreateServer);


export default router;