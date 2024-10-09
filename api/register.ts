import { conn } from "../dbconnect";
import express from "express";
import { Users } from "../model/users_get_res";
import mysql from "mysql";

export const router = express.Router();
const bcrypt = require('bcryptjs');

router.get("/Users", (req, res) => {
    conn.query("select * from Users", (err, result, fields) => {
      res.json(result);
    });
  });
  

//สมัคร Users

// router.post("/register", (req, res) => {
//     const users: Users = req.body;

//     if (users.password !== users.confirmPassword) {
//        res.status(400).json({ error: "Passwords do not match." });
//        return
//     }

//     let checkphoneSql = "SELECT * FROM `Users` WHERE `phone` = ?";
//     checkphoneSql = mysql.format(checkphoneSql, [users.phone]);

//     conn.query(checkphoneSql, async (err, results) => {
//         if (err) {
//             console.error("Error checking phone number:", err);
//             return res.status(500).json({ error: "Internal server error." });
//         }

//         // ถ้ามีหมายเลขโทรศัพท์อยู่ในฐานข้อมูลแล้ว
//         if (results.length > 0) {
//             const existingPhones = results.filter((user: { phone: string; }) => user.phone === users.phone);

//             const errors = [];
//             if (existingPhones.length > 0) {
//                 errors.push("Phone number already registered.");
//             }
//             return res.status(409).json({ errors });
//         }

//         // ถ้าเบอร์ไม่อยู่ในฐานข้อมูล ให้ทำการลงทะเบียนผู้ใช้ใหม่
//         try {
//             const hashedPassword = await bcrypt.hash(users.password, 10);
//             let sql =
//                 "INSERT INTO `Users`(`phone`, `name`, `password`, `address`, `lat`, `long`, `image`) VALUES (?,?,?,?,?,?,?)";

//             sql = mysql.format(sql, [
//                 users.phone,
//                 users.name,
//                 hashedPassword,
//                 users.address,
//                 users.lat,
//                 users.long,
//                 null,
//             ]);

//             // ใส่ผู้ใช้ใหม่ลงในฐานข้อมูล
//             conn.query(sql, (err, result) => {
//                 if (err) {
//                     console.error("Error inserting user:", err);
//                     return res.status(500).json({ error: "Error registering user." });
//                 }

//                 // ส่งผลลัพธ์กลับเมื่อการลงทะเบียนสำเร็จ
//                 return res.status(201).json({ message: "User registered successfully." });
//             });
//         } catch (hashError) {
//             console.error("Error hashing password:", hashError);
//             return res.status(500).json({ error: "Error registering user." });
//         }
//     });
// });


//Firebase
// 1.connect filebase
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
// import { lmage } from "../model/Image_get_res";
import multer from "multer";

const firebaseConfig = {
    apiKey: "AIzaSyCKWNIrnLBDZI5hsVsjJXC_U7tTpWsoL6s",
    authDomain: "miniproject2-cs.firebaseapp.com",
    projectId: "miniproject2-cs",
    storageBucket: "miniproject2-cs.appspot.com",
    messagingSenderId: "29183647488",
    appId: "1:29183647488:web:23753ae01752da8cd89de5",
    measurementId: "G-BN4NRHMWNC"
  };

//เชื่อม firebase
initializeApp(firebaseConfig);
const storage = getStorage();

class FileMiddleware {
  //Attribute filename
  filename = "";

  //Attribute diskLoader
  //Create object of diskLoader for saving file
  public readonly diskLoader = multer({
    storage: multer.memoryStorage(),
    //limits file size
    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
}

//POST/Upload
const fileUpload = new FileMiddleware();
router.post("/upload", fileUpload.diskLoader.single("file"), async (req, res) => {
  // 2.uplaod file to firebase
  //Genarate filename
  const filename =
    Date.now() + "-" + Math.round(Math.random() * 10000) + ".png";

  //define saving filename On firebase
  const storageRef = ref(storage, "/images/" + filename);
  //defind detail
  const metadata = {
    contentType: req.file!.mimetype,
  };
  //upload
  const snapshot = await uploadBytesResumable(
    storageRef,
    req.file!.buffer,
    metadata
  );

  const url = await getDownloadURL(snapshot.ref);
  res.status(200).json({
    url: url,
  });
  console.log(req.file);
});