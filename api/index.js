require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const bcryptjs = require("bcryptjs");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./config/cloudinary");

const app = express();
const PORT = process.env.PORT || 4000;

/* ==============================
   Middleware
============================== */

app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000").split(",");
app.use(
    cors({
        origin: allowedOrigins,
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

const requiredEnvVars = ['JWT_SECRET', 'ADMIN_PASSWORD_HASH', 'ADMIN_EMAIL'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
}

console.log("✅ Environment variables loaded:", {
    JWT_SECRET: process.env.JWT_SECRET ? "***" : "MISSING",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH ? "***" : "MISSING",
});

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
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    age: { type: String, required: true, trim: true },
    gender: { type: String, required: true, trim: true },
    vaccinated: { type: String, required: true, trim: true },
    reportername: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    imageUrl: String,
    public_id: String,
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "adopted"],
        default: "pending",
        index: true,
    },
}, { timestamps: true });

const volunteerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    why: { type: String, required: true, trim: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        index: true,
    },
}, { timestamps: true });

adoptionSchema.index({ status: 1, createdAt: -1 });
adoptionSchema.index({ email: 1 });
volunteerSchema.index({ status: 1, createdAt: -1 });
volunteerSchema.index({ email: 1 });

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
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ["image/jpeg", "image/png"];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG and PNG files are allowed"));
        }
    },
});

/* ==============================
   Validation Utilities
============================== */

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) && email.length <= 254;
}

function isValidPhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.length >= 7 && phone.length <= 20;
}

function sanitizeInput(input) {
    if (typeof input !== "string") return "";
    return input.trim().substring(0, 1000);
}

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
            const { name, email, age, gender, vaccinated, reportername, location, phone, description } = req.body;

            if (!name || !email || !phone || !location) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            if (!isValidEmail(email)) {
                return res.status(400).json({ error: "Invalid email format" });
            }

            if (!isValidPhone(phone)) {
                return res.status(400).json({ error: "Invalid phone format" });
            }

            const submission = await Adoption.create({
                name: sanitizeInput(name),
                email: sanitizeInput(email).toLowerCase(),
                age: sanitizeInput(age),
                gender: sanitizeInput(gender),
                vaccinated: sanitizeInput(vaccinated),
                reportername: sanitizeInput(reportername),
                location: sanitizeInput(location),
                phone: sanitizeInput(phone),
                description: sanitizeInput(description),
                imageUrl: req.file ? req.file.path : null,
                public_id: req.file ? req.file.filename : null,
            });

            transporter
                .sendMail({
                    from: `"Tails of Bijapur" <${process.env.SMTP_USER}>`,
                    to: process.env.ADMIN_EMAIL,
                    subject: `🐾 New Adoption - ${submission.name}`,
                    html: `<p>New adoption submission from <strong>${submission.name}</strong></p>`,
                })
                .catch((err) => console.error("Email Error:", err.message));

            res.json({ ok: true, id: submission._id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Submission failed" });
        }
    }
);

/* ==============================
   Volunteer Submit
============================== */

app.post("/api/volunteer", async(req, res) => {
    try {
        const { name, email, phone, role, time, why } = req.body;

        if (!name || !email || !phone || !role || !time || !why) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if (!isValidPhone(phone)) {
            return res.status(400).json({ error: "Invalid phone format" });
        }

        const submission = await Volunteer.create({
            name: sanitizeInput(name),
            email: sanitizeInput(email).toLowerCase(),
            phone: sanitizeInput(phone),
            role: sanitizeInput(role),
            time: sanitizeInput(time),
            why: sanitizeInput(why),
        });

        transporter
            .sendMail({
                from: `"Tails of Bijapur" <${process.env.SMTP_USER}>`,
                to: process.env.ADMIN_EMAIL,
                subject: `🚨 New Volunteer Recruit - ${submission.name}`,
                html: `<p>A new volunteer (<strong>${submission.name}</strong> - ${submission.role}) has applied.</p>`,
            })
            .catch((err) => console.error("Email Error:", err.message));

        res.json({ ok: true, id: submission._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Submission failed" });
    }
});

/* ==============================
   Admin Login
============================== */

app.post("/api/admin/login", loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    try {
        if (!process.env.ADMIN_PASSWORD_HASH) {
            console.error("❌ ADMIN_PASSWORD_HASH not set in environment variables");
            return res.status(500).json({ error: "Server configuration error" });
        }

        const isEmailValid = email === process.env.ADMIN_EMAIL;
        const isPasswordValid = await bcryptjs.compare(password, process.env.ADMIN_PASSWORD_HASH);

        if (isEmailValid && isPasswordValid) {
            const token = jwt.sign({ role: "admin", email },
                process.env.JWT_SECRET, { expiresIn: "1h" }
            );

            console.log(`✅ Admin login successful for ${email}`);
            return res.json({ token });
        }

        console.warn(`⚠️ Failed login attempt for ${email}`);
        res.status(401).json({ error: "Invalid credentials" });
    } catch (err) {
        console.error("❌ Login error:", err.message);
        res.status(500).json({ error: "Login failed" });
    }
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
        const status = req.query.status || "pending";
        const validStatuses = ["pending", "approved", "rejected"];

        const query = validStatuses.includes(status) ? { status } : { status: "pending" };
        const data = await Volunteer.find(query)
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
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            Adoption.find({ status: "approved" })
                .select("name age gender vaccinated description imageUrl reportername location phone")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Adoption.countDocuments({ status: "approved" })
        ]);

        res.json({
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch" });
    }
});

/* ==============================
   Public Adopted Puppies (Hall of Fame)
============================== */
app.get("/api/adopted-puppies", async(req, res) => {
    try {
        // Checking for "adopted" and the typo "apdopted" based on your DB document
        const data = await Adoption.find({ status: { $in: ["adopted"] } })
            .select("name age location imageUrl status")
            .sort({ updatedAt: -1 }) // Sort by most recently updated/adopted
            .lean();

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch adopted puppies" });
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