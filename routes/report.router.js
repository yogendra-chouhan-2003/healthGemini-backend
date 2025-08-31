import express from "express";
import upload from "../middleware/upload.js";
import { analyzeReport} from "../controller/report.controller.js";

const router = express.Router();

// POST /api/reports/upload
router.post("/upload", upload.single("report"), analyzeReport);


export default router;
