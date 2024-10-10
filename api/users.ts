import express from "express";
import { conn, queryAsync } from "../dbconnect";
import mysql from "mysql";
// import { editUsers } from "../model/edit_get_res";
import { log } from "console";

export const router = express.Router();

//ดึงข้อมูลมาโชว์
router.get("/:userID", (req, res) => {
  const userID = +req.params.userID;
  const sql =
    "select userID, phone, name, address, lat, `long`, image from Users where userID = ?";
  // log(userID);
  conn.query(sql, [userID], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json(result[0]);
  });
});

router.get("/phone/:phone", (req, res) => {
    const phone = req.params.phone; // รับเบอร์โทรศัพท์จากพารามิเตอร์
    const sql = "SELECT userID, phone, name, address, lat, `long`, image FROM Users WHERE phone LIKE ?";
  
    // การใช้เครื่องหมาย '%' เพื่อค้นหาเบอร์โทรศัพท์ที่มีส่วนตรงกัน
    const searchPattern = `%${phone}%`;
  
    conn.query(sql, [searchPattern], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
  
      // ตรวจสอบว่าพบผลลัพธ์หรือไม่
      if (result.length > 0) {
        res.json(result); // ส่งผลลัพธ์กลับไป
      } else {
        res.status(404).json({ message: "No users found" }); // ถ้าไม่พบผู้ใช้
      }
    });
  });
  
