import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import UserRoutes from "./routes/user.router.js";
import ServerRoutes from "./routes/server.router.js"
import SymptomRoutes from "./routes/symptom.router.js";
import ContactRoutes from "./routes/contact.router.js";
import reportRoutes from "./routes/report.router.js";
dotenv.config();

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'https://health-suggestion-app-frontend.onrender.com'], // frontend
    credentials: true
}));

app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/user", UserRoutes);
app.use("/server", ServerRoutes);
app.use("/api", SymptomRoutes);
app.use("/contact", ContactRoutes);
app.use("/api/reports", reportRoutes);
mongoose.connect(process.env.MONGODB_URL).then(result => {
    console.log("Database connected successfully!!!!!!!!");


    app.listen(process.env.PORT || 3000, () => {
        console.log(`server started on ${process.env.PORT} port !!!`)
    })

}).catch(err => {
    console.log(err);
    console.log("data base is not connected!!!!!!!!");
})





