import { Contact } from "../model/Contact.model.js";

export const ContactUs = async (req, res) => {
    try {

        const { name, email, message } = req.body;

        const newContact = new Contact({ name, email, message });
        await newContact.save();

        res.status(200).json({ message: "Message saved" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internal server error!" });
    }
}