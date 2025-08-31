import mongoose from "mongoose";

const symptomSchema = new mongoose.Schema({
  name: String,
  keyword: String,
  image: String,
  suggestions: [String]
});

export const Symptom =  mongoose.model("Symptom", symptomSchema);
