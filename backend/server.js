require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./config/cloudinary");

const app = express();
const PORT = process.env.PORT || 4000;

/* ==============================
   Middleware
============================== */

app.use(helmet());

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "*",
        credentials: true,
    })
);

app.use(express.json());

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
});

/* ==============================
   Env Safety Check
============================== */

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing in environment variables");
}

/* ==============================
   MongoDB
============================== */

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Error:", err));

/* ==============================
   Schemas
============================== */

const adoptionSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: String,
    gender: String,
    vaccinated: String,
    reportername: String,
    location: String,
    phone: String,
    description: String,
    imageUrl: String,
    public_id: String,
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
}, { timestamps: true });

const volunteerSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    role: String,
    time: String,
    why: String,
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
}, { timestamps: true });

const Adoption = mongoose.model("Adoption", adoptionSchema);
const Volunteer = mongoose.model("Volunteer", volunteerSchema);

/* ==============================
   Cloudinary Upload
============================== */

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "tails_of_bijapur",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/* ==============================
   Email Transport
============================== */

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/* ==============================
   Adoption Submit
============================== */

app.post(
    "/api/adopt-submissions",
    upload.single("image"),
    async(req, res) => {
        try {
            const { location, phone } = req.body;

            if (!location || !phone) {
                return res
                    .status(400)
                    .json({ error: "Missing required fields" });
            }

            const submission = await Adoption.create({
                ...req.body,
                imageUrl: req.file ? req.file.path : null,
                public_id: req.file ? req.file.filename : null,
            });

            transporter
                .sendMail({
                    from: `"Tails of Bijapur" <${process.env.SMTP_USER}>`,
                    to: process.env.ADMIN_EMAIL,
                    subject: `🐾 New Adoption - ${
                        submission.name || "Unknown"
                    }`,
                    text: `New submission received.`,
                })
                .catch((err) =>
                    console.error("Email Error:", err.message)
                );

            res.json({ ok: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
);

/* ==============================
   Volunteer Submit
============================== */

app.post("/api/volunteer", async(req, res) => {
    try {
        const submission = await Volunteer.create(req.body);

        // Alert the Admin
        transporter
            .sendMail({
                from: `"Tails of Bijapur" <${process.env.SMTP_USER}>`,
                to: process.env.ADMIN_EMAIL,
                subject: `🚨 New Volunteer Recruit - ${submission.name}`,
                text: `A new volunteer (${submission.name} - ${submission.role}) has applied. Log into the command center to review.`,
            })
            .catch((err) => console.error("Email Error:", err.message));

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Submission failed" });
    }
});

/* ==============================
   Admin Login
============================== */

app.post("/api/admin/login", loginLimiter, (req, res) => {
    const { email, password } = req.body;

    if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
    ) {
        const token = jwt.sign({ role: "admin" },
            process.env.JWT_SECRET, { expiresIn: "1h" }
        );

        return res.json({ token });
    }

    res.status(401).json({ error: "Invalid credentials" });
});

/* ==============================
   Admin Middleware
============================== */

function verifyAdmin(req, res, next) {
    const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
}

/* ==============================
   Admin Routes
============================== */

// --- ADOPTIONS ---
app.get("/api/admin/pending", verifyAdmin, async(req, res) => {
    try {
        const data = await Adoption.find({ status: "pending" })
            .sort({ createdAt: -1 })
            .lean();

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch adoptions" });
    }
});

app.patch("/api/admin/adoptions/:id", verifyAdmin, async(req, res) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const updated = await Adoption.findByIdAndUpdate(
            req.params.id, { status }, { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: "Record not found" });
        }

        if (status === "approved" && updated.email) {
            transporter
                .sendMail({
                    from: `"Tails of Bijapur" <${process.env.SMTP_USER}>`,
                    to: updated.email,
                    subject: "🐾 Adoption Approved!",
                    text: `Hello ${updated.name}, your adoption request is approved!`,
                })
                .catch((err) => console.error(err.message));
        }

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Update failed" });
    }
});

// --- VOLUNTEERS ---
app.get("/api/admin/volunteers", verifyAdmin, async(req, res) => {
    try {
        const data = await Volunteer.find({ status: "pending" })
            .sort({ createdAt: -1 })
            .lean();

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch volunteers" });
    }
});

app.patch("/api/admin/volunteers/:id", verifyAdmin, async(req, res) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const updated = await Volunteer.findByIdAndUpdate(
            req.params.id, { status }, { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: "Record not found" });
        }

        if (status === "approved" && updated.email) {
            transporter
                .sendMail({
                    from: `"Tails of Bijapur" <${process.env.SMTP_USER}>`,
                    to: updated.email,
                    subject: "🐾 Welcome to the Vanguard!",
                    text: `Hello ${updated.name}, your volunteer application has been approved! We will be in touch shortly.`,
                })
                .catch((err) => console.error(err.message));
        }

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Update failed" });
    }
});

/* ==============================
   Public Approved Puppies
============================== */

app.get("/api/approved-puppies", async(req, res) => {
    try {
        const data = await Adoption.find({ status: "approved" })
            .select(
                "name age gender vaccinated description imageUrl reportername location"
            )
            .sort({ createdAt: -1 })
            .lean();

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch" });
    }
});

/* ==============================
   Start Server (Vercel Secure)
============================== */

// Only listen locally. Vercel will use the exported app automatically.
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`🚀 Command Center Online: Port ${PORT}`);
    });
}

// Export for Vercel/Serverless
module.exports = app;