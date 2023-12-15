import express from "express";

import userModel from "./models/userModel.js";

import bodyParser from "body-parser";

import router from "./Routes/routes.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import { uri } from "./models/userModel.js";
const PORT = process.env.PORT || 7070;

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

const session_store = new MongoStore({
  mongoUrl: uri,
  dbName: "drivetestGroup",
  collectionName: "Encryption_session",
});

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    session_store,
  })
);

app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT} !!!`);
});

app.use("/", router);
