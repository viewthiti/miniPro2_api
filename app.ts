import express from "express";
import { router as test } from "./api/test";
import cors from "cors";
import { router as register } from "./api/register";
import { router as login } from "./api/login";
import { router as users } from "./api/users";

import bodyParser from "body-parser";

export const app = express();
app.use(express.json());
app.use(bodyParser.text());
app.use(bodyParser.json());


// app.use("/", (req, res) => {
//   res.send("Hello World!!!");
// });

app.use(
    cors({
      origin: "*",
      // origin: "http://localhost:4200",
    })  
  );
  
  app.use("/", test);
  app.use("/", register);
  app.use("", login);
  app.use("/users", users);