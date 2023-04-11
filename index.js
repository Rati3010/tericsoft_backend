import { UserModel } from "./models/user.model.js";
import { connection } from "./config/db.js";
import session from "express-session";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
dotenv.config();
app.use(
  cors({
    origin: "*",
  })
);
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.secret,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(express.json());
app.post("/register", async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const user = await UserModel.find({ email });
    if (user.length < 1) {
      const newUser = new UserModel({ email, name, password });
      await newUser.save();
      res.status(201).json({ message: "Successfully Registered...!" });
    } else {
      res.status(200).json({ message: "Email already exist" });
    }
  } catch (error) {
    res.status(415).json({ message: "Facing difficulty to register" });
  }
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.find({ email });
    if (user.length < 1) {
      res.status(401).json({ message: "Email is not exist, Do register first" });
    } else {
      if (user[0].password === password) {
        req.session.user = user[0];
        req.session.save();
        res.status(200).json({ message: "Successfully Loged in...!" });
      } else {
        res.status(401).json({ message: "Enter the correct password" });
      }
    }
  } catch (error) {
    res.status(401).json({ message: "Facing difficulty to Login" });
  }
});
app.post("/calculateBMI", async (req, res) => {
  const { height, weight } = req.body;
  let heightMeter = (height * 0.3048).toFixed(2);
  heightMeter = heightMeter ** 2;
  try {
    if (req.session.user) {
      const BMI = (weight / heightMeter).toFixed(2);
      const id = req.session.user._id;
      const user = await UserModel.updateOne(
        { _id: id },
        { $push: { history: { height, weight, BMI } } }
      );
      res.send(user);
    } else {
      res.status(401).json({ message: "Login Firsrt...!" });
    }
  } catch (error) {
    res.send(error);
  }
});
app.get("/getProfile", async (req, res) => {
  if (req.session.user) {
    const user = req.session.user;
    res.json({email:user.email,name:user.name});
  }else{
    res.status(401).send("Login First...!")
  }
});
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.send("Unable to Logout");
    } else {
      res.send("Logout Successfully...!");
    }
  });
});
app.listen(process.env.port, async () => {
  try {
    await connection;
    console.log("connected to DB successfully", process.env.port);
  } catch (error) {
    console.log("connection failed", error);
  }
});
