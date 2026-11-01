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

if (process.env.NODE_ENV !== "production") {
    console.log("✅ Environment variables loaded");
}

/* ==============================
   MongoDB
============================== */

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        if (process.env.NODE_ENV !== "production") {
            console.log("✅ MongoDB Connected");
        }
    })
    .catch((err) => {
        console.error("MongoDB Connection Error:", err.message);
        process.exit(1);
    });

/* ==============================
   Schemas
============================== */

const adoptionSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    age: { type: Number, required: true },
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

const driveRsvpSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 60 },
    phone: { type: String, required: true },
    guests: { type: Number, default: 1, min: 1, max: 10 },
    drive: { type: String, default: "2026-12-06" },
}, { timestamps: true });
const DriveRsvp = mongoose.model("DriveRsvp", driveRsvpSchema);

const adoptionInterestSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, maxlength: 254, lowercase: true },
    phone: { type: String, required: true, maxlength: 20 },
    city: { type: String, required: true, maxlength: 100 },
    homeType: { type: String, enum: ["owned", "rented", "other"], required: true },
    hasPets: { type: Boolean, required: true },
    experience: { type: String, required: true, maxlength: 1200 },
    puppyName: { type: String, maxlength: 80, default: "" },
    consentAt: { type: Date, required: true },
    status: { type: String, enum: ["pending", "contacted"], default: "pending", index: true },
}, { timestamps: true });
adoptionInterestSchema.index({ status:  1, createdAt: -1 });
const AdoptionInterest = mongoose.model("AdoptionInterest", adoptionInterestSchema);

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

function calculateCurrentAge(ageAtApprovalDays, approvalDate) {
    const daysSinceApproval = Math.floor((Date.now() - new Date(approvalDate).getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, ageAtApprovalDays + daysSinceApproval);
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
                age: Math.max(0, parseInt(age) || 0),
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
                .catch((err) => {
                    if (process.env.NODE_ENV !== "production") {
                        console.error("Email Error:", err.message);
                    }
                });

            res.json({ ok: true, id: submission._id });
        } catch (err) {
            if (process.env.NODE_ENV !== "production") {
                console.error("Adoption submission error:", err.message);
            }
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
            .catch((err) => {
                if (process.env.NODE_ENV !== "production") {
                    console.error("Email Error:", err.message);
                }
            });

        res.json({ ok: true, id: submission._id });
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Volunteer submission error:", err.message);
        }
        res.status(500).json({ error: "Submission failed" });
    }
});

/* ==============================
   Adoption Drive RSVPs
============================== */

const driveLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const adoptionInterestLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

app.post("/api/drive/rsvp", driveLimiter, async(req, res) => {
    try {
        const { name, phone } = req.body;
        const guests = Math.min(10, Math.max(1, parseInt(req.body.guests) || 1));
        if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });
        if (!isValidPhone(phone)) return res.status(400).json({ error: "Invalid phone format" });

        const cleanPhone = sanitizeInput(phone);
        const exists = await DriveRsvp.exists({ phone: cleanPhone });
        if (exists) return res.status(409).json({ error: "This number is already registered" });

        await DriveRsvp.create({ name: sanitizeInput(name).slice(0, 60), phone: cleanPhone, guests });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "RSVP failed" });
    }
});

app.get("/api/drive/rsvps", async(req, res) => {
    try {
        const [agg, recent] = await Promise.all([
            DriveRsvp.aggregate([{ $group: { _id: null, people: { $sum: "$guests" }, groups: { $sum: 1 } } }]),
            DriveRsvp.find().sort({ createdAt: -1 }).limit(12).select("name guests createdAt").lean(),
        ]);
        res.json({
            people: agg[0]?.people || 0,
            groups: agg[0]?.groups || 0,
            // first names only, for privacy
            recent: recent.map(r => ({ name: String(r.name).trim().split(/\s+/)[0], guests: r.guests })),
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch" });
    }
});

app.post("/api/drive/adoption-interest", adoptionInterestLimiter, async(req, res) => {
    try {
        const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
        const { name, email, phone, city, homeType, hasPets, experience, puppyName, consent } = body;

        const requiredFields = [name, email, phone, city, homeType, hasPets, experience];
        if (requiredFields.some((value) => typeof value !== "string" || !value.trim()) || consent !== true) {
            return res.status(400).json({ error: "Please complete all required fields and consent to being contacted." });
        }
        if (puppyName !== undefined && typeof puppyName !== "string") {
            return res.status(400).json({ error: "Please enter a valid puppy name or leave it blank." });
        }

        const cleanName = sanitizeInput(name);
        const cleanEmail = sanitizeInput(email).toLowerCase();
        const cleanPhone = sanitizeInput(phone);
        const cleanCity = sanitizeInput(city);
        const cleanHomeType = homeType.trim();
        const cleanHasPets = hasPets.trim();
        const cleanExperience = sanitizeInput(experience);
        const cleanPuppyName = sanitizeInput(puppyName || "");

        if (!isValidEmail(cleanEmail)) return res.status(400).json({ error: "Please enter a valid email address." });
        if (!isValidPhone(cleanPhone)) return res.status(400).json({ error: "Please enter a valid phone number." });
        if (!["owned", "rented", "other"].includes(cleanHomeType)) {
            return res.status(400).json({ error: "Please select a valid home type." });
        }
        if (!["yes", "no"].includes(cleanHasPets)) {
            return res.status(400).json({ error: "Please select whether you have other pets at home." });
        }
        if (cleanName.length > 80 || cleanEmail.length > 254 || cleanPhone.length > 20 || cleanCity.length > 100 ||
            cleanExperience.length > 1200 || cleanPuppyName.length > 80) {
            return res.status(400).json({ error: "One or more answers are too long." });
        }

        const application = await AdoptionInterest.create({
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            city: cleanCity,
            homeType: cleanHomeType,
            hasPets: cleanHasPets === "yes",
            experience: cleanExperience,
            puppyName: cleanPuppyName,
            consentAt: new Date(),
        });

        transporter.sendMail({
            from: `"Tails of Bijapur" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `New puppy adoption enquiry - ${application.name}`,
            text: [
                `New adoption enquiry from ${application.name}`,
                `Email: ${application.email}`,
                `Phone: ${application.phone}`,
                `City / area: ${application.city}`,
                `Home: ${application.homeType}`,
                `Other pets: ${application.hasPets ? "Yes" : "No"}`,
                `Puppy of interest: ${application.puppyName || "No preference"}`,
                `Dog-care experience: ${application.experience}`,
            ].join("\n"),
        }).catch((err) => {
            if (process.env.NODE_ENV !== "production") {
                console.error("Adoption interest email notification failed:", err.message);
            }
        });

        res.status(201).json({ ok: true, id: application._id });
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Adoption interest submission error:", err.message);
        }
        res.status(500).json({ error: "We couldn’t send your enquiry. Please try again." });
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
            console.error("Server Configuration: ADMIN_PASSWORD_HASH not set");
            return res.status(500).json({ error: "Server configuration error" });
        }

        const isEmailValid = email === process.env.ADMIN_EMAIL;
        const isPasswordValid = await bcryptjs.compare(password, process.env.ADMIN_PASSWORD_HASH);

        if (isEmailValid && isPasswordValid) {
            const token = jwt.sign({ role: "admin", email },
                process.env.JWT_SECRET, { expiresIn: "1h" }
            );
            return res.json({ token });
        }

        res.status(401).json({ error: "Invalid credentials" });
    } catch (err) {
        console.error("Login error:", err.message);
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
        if (process.env.NODE_ENV !== "production") {
            console.error("Fetch pending adoptions error:", err.message);
        }
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
                .catch((err) => {
                    if (process.env.NODE_ENV !== "production") {
                        console.error("Email notification error:", err.message);
                    }
                });
        }

        res.json(updated);
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Update adoption error:", err.message);
        }
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
        if (process.env.NODE_ENV !== "production") {
            console.error("Fetch volunteers error:", err.message);
        }
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
                .catch((err) => {
                    if (process.env.NODE_ENV !== "production") {
                        console.error("Email notification error:", err.message);
                    }
                });
        }

        res.json(updated);
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Update volunteer error:", err.message);
        }
        res.status(500).json({ error: "Update failed" });
    }
});

app.get("/api/admin/adoption-interests", verifyAdmin, async(req, res) => {
    try {
        const data = await AdoptionInterest.find({ status: "pending" })
            .sort({ createdAt: -1 })
            .lean();
        res.json(data);
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Fetch adoption interests error:", err.message);
        }
        res.status(500).json({ error: "Failed to fetch adoption enquiries" });
    }
});

app.patch("/api/admin/adoption-interests/:id", verifyAdmin, async(req, res) => {
    try {
        if (req.body.status !== "contacted") {
            return res.status(400).json({ error: "Invalid status" });
        }

        const updated = await AdoptionInterest.findByIdAndUpdate(
            req.params.id, { status: "contacted" }, { new: true }
        );
        if (!updated) return res.status(404).json({ error: "Enquiry not found" });
        res.json(updated);
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Update adoption interest error:", err.message);
        }
        res.status(500).json({ error: "Failed to update enquiry" });
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
                .select("name age gender vaccinated description imageUrl reportername location phone updatedAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Adoption.countDocuments({ status: "approved" })
        ]);

        const dataWithCalculatedAge = data.map(puppy => ({
            ...puppy,
            age: calculateCurrentAge(puppy.age, puppy.updatedAt)
        }));

        res.json({
            data: dataWithCalculatedAge,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Fetch approved puppies error:", err.message);
        }
        res.status(500).json({ error: "Failed to fetch" });
    }
});

/* ==============================
   Public Adopted Puppies (Hall of Fame)
============================== */
app.get("/api/adopted-puppies", async(req, res) => {
    try {
        const data = await Adoption.find({ status: "adopted" })
            .select("name age location imageUrl status updatedAt")
            .sort({ updatedAt: -1 })
            .lean();

        const dataWithCalculatedAge = data.map(puppy => ({
            ...puppy,
            age: calculateCurrentAge(puppy.age, puppy.updatedAt)
        }));

        res.json(dataWithCalculatedAge);
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Fetch adopted puppies error:", err.message);
        }
        res.status(500).json({ error: "Failed to fetch adopted puppies" });
    }
});


/* ==============================
   Start Server (Vercel Secure)
============================== */

// Only listen locally. Vercel will use the exported app automatically.
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
    });
}

// Export for Vercel/Serverless
module.exports = app;