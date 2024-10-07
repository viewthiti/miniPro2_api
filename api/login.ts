
import { conn } from "../dbconnect";
import express from "express";
import { Users } from "../model/users_get_res";
import mysql from "mysql";

export const router = express.Router();
const bcrypt = require('bcryptjs');

router.post("/login", (req, res) => {
    const { phone, password } = req.body;

    // ใช้ SQL เพื่อค้นหาผู้ใช้ในตาราง Users
    const sqlUser = "SELECT * FROM Users WHERE phone = ?";
    // ใช้ SQL เพื่อค้นหาผู้ใช้ในตาราง Riders
    const sqlRider = "SELECT * FROM rider WHERE phone = ?";

    // เช็คในตาราง Users ก่อน
    conn.query(sqlUser, [phone], async (err, userResult) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
            return;
        }

        // หากพบผู้ใช้ในตาราง Users
        if (userResult.length > 0) {
            const user = userResult[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                res.json({
                    message: "User login successful",
                    user: user,
                    userType: "user", // ระบุประเภทผู้ใช้
                });
                return;
            } else {
                res.status(401).json({ message: "Invalid phone or password" });
                return;
            }
        }

        // หากไม่พบในตาราง Users ให้เช็คในตาราง Riders
        conn.query(sqlRider, [phone], async (err, riderResult) => {
            if (err) {
                res.status(500).json({ message: "An error occurred" });
                return;
            }

            // หากพบผู้ใช้ในตาราง Riders
            if (riderResult.length > 0) {
                const rider = riderResult[0];
                const match = await bcrypt.compare(password, rider.password);
                if (match) {
                    res.json({
                        message: "Rider login successful",
                        user: rider,
                        userType: "rider", // ระบุประเภทผู้ใช้
                    });
                } else {
                    res.status(401).json({ message: "Invalid phone or password" });
                }
            } else {
                // ไม่พบผู้ใช้ในทั้งสองตาราง
                res.status(404).json({ message: "No user found with that phone number" });
            }
        });
    });
});
