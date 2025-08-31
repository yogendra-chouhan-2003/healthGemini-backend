import { Symptom } from "../model/Symptom.model.js";

 
export const getAllSymptoms = async (req, res) => {
  const symptoms = await Symptom.find();
  return res.status(201).json(symptoms);
};

export const getSuggestionsByKeyword = async (req, res) => {
  const { keyword } = req.params;
  const symptom = await Symptom.findOne({ keyword });
  if (!symptom) return res.status(404).json({ message: "Not found" });
  return res.status(201).json(symptom);
};
 




export const addsymptoms = async (req, res) => {
  try {
    let symptoms = req.body;
     const savedSymptoms = await Symptom.insertMany(symptoms);

    return res.status(201).json({message: "Symptoms inserted successfully",data: savedSymptoms});
  } catch (error) {
    console.error("Bulk insert error:", error);
    return res.status(500).json({error: "Failed to insert symptoms"});
  }
};
