import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
const app = express();
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

// Connect Database
import connectDB from "./db/db.js";
connectDB();

// middlewares
app.use(bodyParser.json());
app.use(cookieParser("secret"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//UserRoute
import { userRoute } from "./routes/route.user.js";
app.use("/user", userRoute);

import {adminRoute} from "./routes/route.admin.js"
app.use("/admin" , adminRoute)
// Listners
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(` Server is started at http://localhost:${PORT} `);
});
