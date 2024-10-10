import { conn } from "../dbconnect";
import express from "express";
import { Users } from "../model/users_get_res";
import mysql from "mysql";

export const router = express.Router();
const bcrypt = require("bcryptjs");

router.get("/Users", (req, res) => {
  conn.query("select * from Users", (err, result, fields) => {
    res.json(result);
  });
});

// สมัคร Users

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
import { Rider } from "../model/rider_get_res";

const firebaseConfig = {
  apiKey: "AIzaSyCKWNIrnLBDZI5hsVsjJXC_U7tTpWsoL6s",
  authDomain: "miniproject2-cs.firebaseapp.com",
  projectId: "miniproject2-cs",
  storageBucket: "miniproject2-cs.appspot.com",
  messagingSenderId: "29183647488",
  appId: "1:29183647488:web:23753ae01752da8cd89de5",
  measurementId: "G-BN4NRHMWNC",
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
const fileUpload = new FileMiddleware();

router.post(
  "/register",
  fileUpload.diskLoader.single("file"),
  async (req, res) => {
    const users: Users = req.body;
    const riders: Rider = req.body;

    // ตรวจสอบรหัสผ่าน
    if (users.password !== users.confirmPassword) {
      res.status(400).json({ error: "Passwords do not match." });
      return;
    }

    let checkphoneSql = `
  SELECT phone FROM Users WHERE phone = ?
  UNION
  SELECT phone FROM rider WHERE phone = ?
`;
    checkphoneSql = mysql.format(checkphoneSql, [users.phone, riders.phone]);

    // ตรวจสอบเบอร์โทรศัพท์ซ้ำ
    conn.query(checkphoneSql, async (err, results) => {
      if (err) {
        console.error("Error checking phone number:", err);
        return res.status(600).json({ error: "Internal server error." });
      }

      if (results.length > 0) {
        return res
          .status(409)
          .json({ error: "Phone number already registered." });
      }

      // อัปโหลดรูปภาพไปยัง Firebase (หากมีรูป)
      let imageUrl = null;
      if (req.file) {
        try {
          const filename =
            Date.now() + "-" + Math.round(Math.random() * 10000) + ".png";
          const storageRef = ref(storage, "/images/" + filename);
          const metadata = { contentType: req.file.mimetype };

          const snapshot = await uploadBytesResumable(
            storageRef,
            req.file.buffer,
            metadata
          );
          imageUrl = await getDownloadURL(snapshot.ref); // ดึง URL ของรูปภาพ
        } catch (error) {
          console.error("Error uploading to Firebase:", error);
          return res.status(509).json({ error: "Error uploading image." });
        }
      }

      // ถ้าไม่มีปัญหา อัปเดตรหัสผ่าน และข้อมูลผู้ใช้ใหม่ลงในฐานข้อมูล
      try {
        console.log("User data:", users);

        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(users.password, 10);
        console.log("Hashed password:", hashedPassword);
        console.log("Image URL:", imageUrl);

        let sql =
          "INSERT INTO `Users`(`phone`, `name`, `password`, `address`, `lat`, `long`, `image`) VALUES (?,?,?,?,?,?,?)";

        sql = mysql.format(sql, [
          users.phone,
          users.name,
          hashedPassword,
          users.address,
          users.lat,
          users.long,
          imageUrl, // เก็บ URL ของรูปภาพในฐานข้อมูล
        ]);

        // ใส่ผู้ใช้ใหม่ลงในฐานข้อมูล
        conn.query(sql, (err, result) => {
          if (err) {
            console.error("Error inserting user:", err);
            return res.status(501).json({ error: "Error registering user." });
          }

          // ส่งผลลัพธ์กลับเมื่อการลงทะเบียนสำเร็จ
          return res.status(201).json({
            message: "User registered successfully.",
            imageUrl: imageUrl,
          });
        });
      } catch (hashError) {
        console.error("Error hashing password:", hashError);
        return res.status(500).json({ error: "Error registering user 1." });
      }
    });
  }
);

//สมัคร Rider
router.post(
  "/registerrider",
  fileUpload.diskLoader.single("file"),
  async (req, res) => {
    const riders: Rider = req.body;
    const users: Users = req.body;

    // ตรวจสอบรหัสผ่าน
    if (riders.password !== riders.confirmPassword) {
      res.status(400).json({ error: "Passwords do not match." });
      return;
    }

    let checkphoneSql = `
  SELECT phone FROM Users WHERE phone = ?
  UNION
  SELECT phone FROM rider WHERE phone = ?
`;
    checkphoneSql = mysql.format(checkphoneSql, [users.phone, riders.phone]);

    // ตรวจสอบเบอร์โทรศัพท์ซ้ำ
    conn.query(checkphoneSql, async (err, results) => {
      if (err) {
        console.error("Error checking phone number:", err);
        return res.status(600).json({ error: "Internal server error." });
      }

      if (results.length > 0) {
        return res
          .status(409)
          .json({ error: "Phone number already registered." });
      }

      // อัปโหลดรูปภาพไปยัง Firebase (หากมีรูป)
      let imageUrl = null;
      if (req.file) {
        try {
          const filename =
            Date.now() + "-" + Math.round(Math.random() * 10000) + ".png";
          const storageRef = ref(storage, "/images/" + filename);
          const metadata = { contentType: req.file.mimetype };

          const snapshot = await uploadBytesResumable(
            storageRef,
            req.file.buffer,
            metadata
          );
          imageUrl = await getDownloadURL(snapshot.ref); // ดึง URL ของรูปภาพ
        } catch (error) {
          console.error("Error uploading to Firebase:", error);
          return res.status(509).json({ error: "Error uploading image." });
        }
      }

      // ถ้าไม่มีปัญหา อัปเดตรหัสผ่าน และข้อมูลผู้ใช้ใหม่ลงในฐานข้อมูล
      try {
        console.log("User data:", riders);

        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(riders.password, 10);
        console.log("Hashed password:", hashedPassword);
        console.log("Image URL:", imageUrl);

        let sql =
          "INSERT INTO `rider`(`phone`, `name`, `password`, `number`, `image`) VALUES (?,?,?,?,?)";

        sql = mysql.format(sql, [
          riders.phone,
          riders.name,
          hashedPassword,
          riders.number,
          imageUrl, // เก็บ URL ของรูปภาพในฐานข้อมูล
        ]);

        // ใส่ผู้ใช้ใหม่ลงในฐานข้อมูล
        conn.query(sql, (err, result) => {
          if (err) {
            console.error("Error inserting user:", err);
            return res.status(501).json({ error: "Error registering user." });
          }

          // ส่งผลลัพธ์กลับเมื่อการลงทะเบียนสำเร็จ
          return res.status(201).json({
            message: "User registered successfully.",
            imageUrl: imageUrl,
          });
        });
      } catch (hashError) {
        console.error("Error hashing password:", hashError);
        return res.status(500).json({ error: "Error registering user 1." });
      }
    });
  }
);

// การลบ Users
router.delete("/deleteuser/:usersID", async (req, res) => {
  const usersID = req.params.usersID;

  let sql = `SELECT image FROM Users WHERE userID = ?`;
  sql = mysql.format(sql, [usersID]);

  conn.query(sql, async (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const imageUrl = results[0].image; // ดึง URL ของรูปภาพ

    // ตรวจสอบว่า imageUrl มีค่าไหม
    if (imageUrl && imageUrl !== "undefined") {
      try {
        // Debug: ดูว่า imageUrl เป็นอะไร
        console.log("Image URL: ", imageUrl);

        // ดึงชื่อไฟล์จาก URL โดยใช้ decodeURIComponent และ split
        const filePath = decodeURIComponent(imageUrl.split('images%2F')[1].split('?')[0]);

        // Debug: ดูว่า filename ที่ได้เป็นอะไร
        console.log("Filename: ", filePath);

        const storageRef = ref(storage, `/images/${filePath}`);

        // ลบไฟล์ใน Firebase Storage
        await deleteObject(storageRef);
        console.log("Image deleted from Firebase.");
      } catch (error) {
        console.error("Error deleting image from Firebase:", error);
        return res.status(509).json({ error: "Error deleting image." });
      }
    } else {
      console.log("No image found for this user.");
    }

    // ลบผู้ใช้จากฐานข้อมูล
    let deleteUserSql = `DELETE FROM Users WHERE userID = ?`;
    deleteUserSql = mysql.format(deleteUserSql, [usersID]);

    conn.query(deleteUserSql, (err, result) => {
      if (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ error: "Error deleting user." });
      }

      return res.status(200).json({ message: "User and image deleted successfully." });
    });
  });
});


// การลบ Rider
router.delete("/deleterider/:usersID", async (req, res) => {
  const usersID = req.params.usersID;

  let sql = `SELECT image FROM rider WHERE riderID = ?`;
  sql = mysql.format(sql, [usersID]);

  conn.query(sql, async (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const imageUrl = results[0].image; // ดึง URL ของรูปภาพ

    // ตรวจสอบว่า imageUrl มีค่าไหม
    if (imageUrl && imageUrl !== "undefined") {
      try {
        // Debug: ดูว่า imageUrl เป็นอะไร
        console.log("Image URL: ", imageUrl);

        // ดึงชื่อไฟล์จาก URL โดยใช้ decodeURIComponent และ split
        const filePath = decodeURIComponent(imageUrl.split('images%2F')[1].split('?')[0]);

        // Debug: ดูว่า filename ที่ได้เป็นอะไร
        console.log("Filename: ", filePath);

        const storageRef = ref(storage, `/images/${filePath}`);

        // ลบไฟล์ใน Firebase Storage
        await deleteObject(storageRef);
        console.log("Image deleted from Firebase.");
      } catch (error) {
        console.error("Error deleting image from Firebase:", error);
        return res.status(509).json({ error: "Error deleting image." });
      }
    } else {
      console.log("No image found for this user.");
    }

    // ลบผู้ใช้จากฐานข้อมูล
    let deleteUserSql = `DELETE FROM rider WHERE riderID = ?`;
    deleteUserSql = mysql.format(deleteUserSql, [usersID]);

    conn.query(deleteUserSql, (err, result) => {
      if (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ error: "Error deleting user." });
      }

      return res.status(200).json({ message: "User and image deleted successfully." });
    });
  });
});


