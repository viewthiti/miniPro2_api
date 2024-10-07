import express from "express";
import { router as test } from "./api/test";

export const app = express();

app.use("/", test);
// app.use("/", (req, res) => {
//   res.send("Hello World!!!");
// });