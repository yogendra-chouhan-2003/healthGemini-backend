import express from "express";
import { getAllSymptoms, getSuggestionsByKeyword ,addsymptoms} from "../controller/symptom.controller.js";

const router = express.Router();

router.get("/symptoms", getAllSymptoms);
router.get("/suggestions/:keyword", getSuggestionsByKeyword);
router.post("/addData",addsymptoms)

export default router;
