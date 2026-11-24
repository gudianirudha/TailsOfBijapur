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
const { createHash, randomBytes } = require("crypto");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./config/cloudinary");

const app = express();
const PORT = process.env.PORT || 4000;
app.set("trust proxy", process.env.VERCEL === "1" ? 1 : false);

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
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { forwardedHeader: false },
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
    passwordHash: { type: String, select: false },
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

const volunteerAccountSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 80, trim: true },
    email: { type: String, required: true, maxlength: 254, lowercase: true, trim: true, unique: true },
    phone: { type: String, required: true, maxlength: 20, trim: true },
    passwordHash: { type: String, select: false },
    passwordSetupTokenHash: { type: String, select: false },
    passwordSetupExpiresAt: { type: Date, select: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
}, { timestamps: true });
volunteerAccountSchema.index({ status: 1, createdAt: -1 });
const VolunteerAccount = mongoose.model("VolunteerAccount", volunteerAccountSchema);
const volunteerSuperAdminEmail = (process.env.VOLUNTEER_SUPER_ADMIN_EMAIL || "support@tailsofbijapur.org")
    .trim()
    .toLowerCase();

const puppySchema = new mongoose.Schema({
    tagNumber: { type: String, required: true, unique: true },
    name: { type: String, maxlength: 80, default: "" },
    age: { type: String, required: true, maxlength: 40 },
    gender: { type: String, enum: ["female", "male", "unknown"], required: true },
    vaccination: { type: String, maxlength: 500 },
    dhppiDoseCount: { type: Number, min: 0, validate: Number.isInteger },
    antiRabiesDate: { type: String, match: /^\d{4}-\d{2}-\d{2}$/ },
    dhppiVaccinations: [{ type: String, match: /^\d{4}-\d{2}-\d{2}$/ }],
    antiRabiesVaccinations: [{ type: String, match: /^\d{4}-\d{2}-\d{2}$/ }],
    fosterName: { type: String, maxlength: 100, default: "" },
    location: { type: String, maxlength: 200, default: "" },
    photos: [{ url: { type: String, required: true }, publicId: { type: String, required: true } }],
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "VolunteerAccount", required: true, index: true },
    status: { type: String, enum: ["available", "adopted"], default: "available", index: true },
    adoption: {
        name: { type: String, maxlength: 100 },
        phone: { type: String, maxlength: 20 },
        address: { type: String, maxlength: 500 },
        publicNameConsent: { type: Boolean, default: false },
        adoptedAt: Date,
    },
}, { timestamps: true });
puppySchema.index({ status: 1, createdAt: -1 });
const Puppy = mongoose.model("Puppy", puppySchema);

const sequenceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    value: { type: Number, default: 0 },
});
const Sequence = mongoose.model("Sequence", sequenceSchema);

const driveRsvpSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 60 },
    phone: { type: String, required: true },
    guests: { type: Number, default: 1, min: 1, max: 10 },
    eventDate: { type: String, enum: ["2026-12-05", "2026-12-06", "both"], required: true },
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

const puppyPhotosUpload = (req, res, next) => {
    upload.array("photos", 1)(req, res, (error) => {
        if (error) {
            const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
            return res.status(status).json({
                error: error.code === "LIMIT_FILE_SIZE"
                    ? "The puppy photo must be 5 MB or smaller"
                    : error.code === "LIMIT_UNEXPECTED_FILE"
                        ? "Upload no more than one puppy photo"
                        : error.message,
            });
        }
        next();
    });
};

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
        const { name, email, phone, role, time, why, password } = req.body;

        if (!name || !email || !phone || !role || !time || !why || typeof password !== "string") {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({ error: "Password must be at least 12 characters and no more than 72 UTF-8 bytes" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if (!isValidPhone(phone)) {
            return res.status(400).json({ error: "Invalid phone format" });
        }

        const cleanName = sanitizeInput(name);
        const cleanEmail = sanitizeInput(email).toLowerCase();
        const cleanPhone = sanitizeInput(phone);
        if (cleanName.length > 80 || cleanEmail.length > 254 || cleanPhone.length > 20) {
            return res.status(400).json({ error: "Name, email, or phone number exceeds the allowed length" });
        }

        const passwordHash = await bcryptjs.hash(password, 12);
        const submission = await Volunteer.create({
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            passwordHash,
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

const driveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { forwardedHeader: false },
});
const adoptionInterestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { forwardedHeader: false },
});

app.post("/api/drive/rsvp", driveLimiter, async(req, res) => {
    try {
        const { name, phone, eventDate } = req.body;
        const guests = Math.min(10, Math.max(1, parseInt(req.body.guests) || 1));
        if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });
        if (!["2026-12-05", "2026-12-06", "both"].includes(eventDate)) {
            return res.status(400).json({ error: "Choose a valid adoption drive date" });
        }
        if (!isValidPhone(phone)) return res.status(400).json({ error: "Invalid phone format" });

        const cleanPhone = sanitizeInput(phone);
        const exists = await DriveRsvp.exists({ phone: cleanPhone });
        if (exists) return res.status(409).json({ error: "This number is already registered" });

        await DriveRsvp.create({ name: sanitizeInput(name).slice(0, 60), phone: cleanPhone, guests, eventDate });
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
        res.set("Cache-Control", "no-store");
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
   Volunteer Portal Accounts
============================== */

const volunteerAccountLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { forwardedHeader: false },
});

function hashPasswordSetupToken(token) {
    return createHash("sha256").update(token).digest("hex");
}

function getFrontendBaseUrl(req) {
    const configuredUrl = process.env.FRONTEND_URL?.split(",")[0].trim();
    return (configuredUrl || req.get("origin") || "http://localhost:5173").replace(/\/+$/, "");
}

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);
}

async function sendVolunteerPasswordSetupEmail(req, account, token) {
    const setupUrl = `${getFrontendBaseUrl(req)}/volunteer-portal?setupToken=${encodeURIComponent(token)}`;
    const result = await transporter.sendMail({
        from: `"Tails of Bijapur" <${process.env.SMTP_USER}>`,
        to: account.email,
        subject: "Reset your Tails of Bijapur volunteer portal password",
        text: [
            `Hello ${account.name},`,
            "",
            "Use this one-time link to set or reset your volunteer portal password:",
            setupUrl,
            "",
            "This link expires in 24 hours. If you did not request this, you can ignore this email.",
        ].join("\n"),
        html: `<p>Hello ${escapeHtml(account.name)},</p><p>Use the one-time link below to set or reset your volunteer portal password. It expires in 24 hours.</p><p><a href="${setupUrl}">Set or reset your volunteer portal password</a></p><p>If you did not request this, you can ignore this email.</p>`,
    });

    const acceptedRecipient = result.accepted.some(
        (recipient) => recipient.toLowerCase() === account.email.toLowerCase()
    );
    if (!acceptedRecipient) {
        console.error("SMTP did not accept the volunteer password setup recipient", {
            messageId: result.messageId,
            acceptedCount: result.accepted.length,
            rejectedCount: result.rejected.length,
            response: result.response,
        });
        throw new Error("The email provider did not accept the password setup recipient");
    }

    console.info("SMTP accepted the volunteer password setup email", {
        messageId: result.messageId,
        response: result.response,
    });
}

app.post("/api/volunteer-portal/password-link", volunteerAccountLimiter, async(req, res) => {
    try {
        const email = sanitizeInput(req.body.email).toLowerCase();
        if (!isValidEmail(email)) return res.status(400).json({ error: "Enter a valid email address" });

        const account = await VolunteerAccount.findOne({ email, status: "approved" }).select("name email");
        if (account) {
            const token = randomBytes(32).toString("hex");
            const tokenHash = hashPasswordSetupToken(token);
            await VolunteerAccount.updateOne(
                { _id: account._id, status: "approved" },
                { passwordSetupTokenHash: tokenHash, passwordSetupExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
            );
            try {
                await sendVolunteerPasswordSetupEmail(req, account, token);
            } catch (emailError) {
                await VolunteerAccount.updateOne(
                    { _id: account._id, passwordSetupTokenHash: tokenHash },
                    { $unset: { passwordSetupTokenHash: 1, passwordSetupExpiresAt: 1 } }
                );
                throw emailError;
            }
        }
        res.json({ ok: true, message: "If this email belongs to an approved volunteer, a password reset link has been sent. Check your inbox and spam folder." });
    } catch (err) {
        console.error("Volunteer password link error:", err.message);
        res.status(502).json({ error: "We couldn’t send the password link. Please contact the admin." });
    }
});

app.post("/api/volunteer-portal/set-password", volunteerAccountLimiter, async(req, res) => {
    try {
        const token = req.body.token;
        const password = req.body.password;
        if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
            return res.status(400).json({ error: "This password link is invalid or expired. Request a new one." });
        }
        if (typeof password !== "string" || password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({ error: "Password must be at least 12 characters and no more than 72 UTF-8 bytes" });
        }

        const tokenHash = hashPasswordSetupToken(token);
        const account = await VolunteerAccount.findOne({
            status: "approved",
            passwordSetupTokenHash: tokenHash,
            passwordSetupExpiresAt: { $gt: new Date() },
        }).select("_id");
        if (!account) return res.status(400).json({ error: "This password link is invalid or expired. Request a new one." });

        const passwordHash = await bcryptjs.hash(password, 12);
        const updated = await VolunteerAccount.findOneAndUpdate(
            {
                _id: account._id,
                status: "approved",
                passwordSetupTokenHash: tokenHash,
                passwordSetupExpiresAt: { $gt: new Date() },
            },
            {
                $set: { passwordHash },
                $unset: { passwordSetupTokenHash: 1, passwordSetupExpiresAt: 1 },
            },
            { new: true }
        ).select("_id");
        if (!updated) return res.status(400).json({ error: "This password link has already been used or expired. Request a new one." });
        res.json({ ok: true, message: "Password set. You can now sign in." });
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Volunteer password setup error:", err.message);
        }
        res.status(500).json({ error: "Could not set your password. Please try again." });
    }
});

app.post("/api/volunteer-portal/login", volunteerAccountLimiter, async(req, res) => {
    try {
        const email = sanitizeInput(req.body.email).toLowerCase();
        const password = req.body.password;
        if (!email || typeof password !== "string") {
            return res.status(400).json({ error: "Email and password are required" });
        }

        let account = await VolunteerAccount.findOne({ email }).select("+passwordHash");
        if (!account) {
            const application = await Volunteer.findOne({ email, status: "approved" }).select("+passwordHash");
            if (application?.passwordHash) {
                try {
                    account = await VolunteerAccount.findOneAndUpdate(
                        { email },
                        {
                            $setOnInsert: {
                                _id: application._id,
                                name: application.name,
                                email: application.email,
                                phone: application.phone,
                                passwordHash: application.passwordHash,
                                status: "approved",
                            },
                        },
                        { new: true, upsert: true, setDefaultsOnInsert: true }
                    ).select("+passwordHash");
                } catch (provisionError) {
                    if (provisionError.code !== 11000) throw provisionError;
                    account = await VolunteerAccount.findOne({ email }).select("+passwordHash");
                    if (!account) throw provisionError;
                }

                await Volunteer.updateOne(
                    { _id: application._id },
                    { $unset: { passwordHash: 1 } }
                );
            }
        }
        if (!account) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        if (account.status !== "approved") {
            return res.status(403).json({
                error: account.status === "rejected"
                    ? "This volunteer account has not been approved."
                    : "Your account is awaiting admin approval.",
            });
        }
        if (!account.passwordHash) {
            return res.status(403).json({ error: "This account has no password set. Use Forgot your password to request a reset link." });
        }
        if (!(await bcryptjs.compare(password, account.passwordHash))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            { role: "volunteer", volunteerId: account._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );
        res.json({ token, name: account.name });
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Volunteer portal login error:", err.message);
        }
        res.status(500).json({ error: "Sign in failed. Please try again." });
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

function getBearerToken(req) {
    const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null;
    return token || null;
}

function verifyAdmin(req, res, next) {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.role !== "admin") return res.status(403).json({ error: "Admin access required" });
        req.auth = payload;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
}

async function verifyVolunteer(req, res, next) {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.role !== "volunteer" || !mongoose.isValidObjectId(payload.volunteerId)) {
            return res.status(403).json({ error: "Volunteer access required" });
        }
        const account = await VolunteerAccount.findOne({ _id: payload.volunteerId, status: "approved" }).select("_id email");
        if (!account) return res.status(403).json({ error: "Volunteer account is not active" });
        req.volunteerId = account._id;
        req.isVolunteerSuperAdmin = account.email.toLowerCase() === volunteerSuperAdminEmail;
        next();
    } catch (err) {
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        if (process.env.NODE_ENV !== "production") {
            console.error("Volunteer authentication error:", err.message);
        }
        res.status(500).json({ error: "Authentication failed" });
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

        const pendingApplication = await Volunteer.findOne({
          _id: req.params.id,
          status: "pending",
        }).select("+passwordHash");
        if (!pendingApplication) {
          return res.status(404).json({ error: "Pending volunteer application not found" });
        }

        if (status === "rejected") {
          const application = await Volunteer.findOneAndUpdate(
              { _id: pendingApplication._id, status: "pending" },
              { status },
              { new: true, runValidators: true }
            );
          if (!application) {
              return res.status(409).json({ error: "Volunteer application was already updated" });
          }
          await VolunteerAccount.updateOne(
              { email: application.email, status: "pending" },
              { status: "rejected" }
          );
          return res.json(application);
        }

        if (!pendingApplication.passwordHash) {
          return res.status(400).json({
              error: "This application has no password. Ask the applicant to submit a new application and choose a password before approval.",
          });
        }

        const application = await Volunteer.findOneAndUpdate(
          { _id: pendingApplication._id, status: "pending" },
          { status: "approved" },
          { new: true, runValidators: true }
        );
        if (!application) {
          return res.status(409).json({ error: "Volunteer application was already updated" });
        }
        try {
          await VolunteerAccount.findOneAndUpdate(
              { email: application.email },
              {
                  $set: {
                      name: application.name,
                      email: application.email,
                      phone: application.phone,
                      status: "approved",
                      passwordHash: pendingApplication.passwordHash,
                  },
                  $unset: { passwordSetupTokenHash: 1, passwordSetupExpiresAt: 1 },
              },
              { upsert: true, runValidators: true, setDefaultsOnInsert: true }
          );
        } catch (accountError) {
          await Volunteer.updateOne(
              { _id: application._id, status: "approved" },
                { status: "pending" }
            );
            throw accountError;
        }

        try {
            await Volunteer.updateOne(
                { _id: application._id },
                { $unset: { passwordHash: 1 } }
            );
        } catch (cleanupError) {
            console.error("Volunteer application password hash cleanup failed:", cleanupError.message);
        }

        res.json(application);
    } catch (err) {
        console.error("Update volunteer error:", err.message);
        res.status(500).json({ error: "Update failed" });
    }
});

app.get("/api/admin/drive-puppies", verifyAdmin, async(req, res) => {
    try {
        const puppies = await Puppy.find()
            .populate("volunteerId", "name email")
            .sort({ createdAt: -1 })
            .lean();
        res.json(puppies);
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Fetch drive puppy records error:", err.message);
        }
        res.status(500).json({ error: "Failed to fetch puppy records" });
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

app.get("/api/volunteer-portal/puppies", verifyVolunteer, async(req, res) => {
    try {
        const query = req.isVolunteerSuperAdmin ? {} : { volunteerId: req.volunteerId };
        const puppies = await Puppy.find(query)
            .sort({ createdAt: -1 })
            .lean();
        res.json({ puppies, isSuperAdmin: req.isVolunteerSuperAdmin });
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Fetch volunteer puppy records error:", err.message);
        }
        res.status(500).json({ error: "Failed to fetch your puppy records" });
    }
});

app.post("/api/volunteer-portal/puppies", verifyVolunteer, puppyPhotosUpload, async(req, res) => {
    try {
        const name = sanitizeInput(req.body.name);
        const age = sanitizeInput(req.body.age);
        const gender = req.body.gender;
        const fosterName = sanitizeInput(req.body.fosterName);
        const location = sanitizeInput(req.body.location);
        const photos = (req.files || []).map((file) => ({ url: file.path, publicId: file.filename }));

        const parseVaccinations = (input, label) => {
            let dates;
            try {
                dates = JSON.parse(input || "[]");
            } catch {
                throw new Error(`${label} entries must be valid`);
            }
            if (!Array.isArray(dates) || dates.some((date) => typeof date !== "string" || !date)) {
                throw new Error(`${label} entries must each have a date`);
            }
            for (const date of dates) {
                const parsedDate = new Date(`${date}T00:00:00.000Z`);
                if (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
                    Number.isNaN(parsedDate.getTime()) ||
                    parsedDate.toISOString().slice(0, 10) !== date) {
                    throw new Error(`Enter a valid date for each ${label} entry`);
                }
            }
            return dates;
        };
        let dhppiVaccinations;
        let antiRabiesVaccinations;
        try {
            dhppiVaccinations = parseVaccinations(req.body.dhppiVaccinations, "DHPPi");
            antiRabiesVaccinations = parseVaccinations(req.body.antiRabiesVaccinations, "anti-rabies");
        } catch (validationError) {
            return res.status(400).json({ error: validationError.message });
        }

        if (!age || !fosterName || !location || !["female", "male", "unknown"].includes(gender)) {
            return res.status(400).json({ error: "Age, gender, foster name, and location are required" });
        }
        if (!photos.length) return res.status(400).json({ error: "Upload at least one puppy photo" });
        if (photos.length > 1) return res.status(400).json({ error: "Upload no more than one puppy photo" });
        if (name.length > 80 || age.length > 40 || fosterName.length > 100 || location.length > 200) {
            return res.status(400).json({ error: "One or more puppy details are too long" });
        }

        const year = new Date().getFullYear();
        const counter = await Sequence.findOneAndUpdate(
            { name: `puppy-tag-${year}` },
            { $inc: { value: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        const tagNumber = `TOB-${year}-${String(counter.value).padStart(5, "0")}`;
        const puppy = await Puppy.create({
            tagNumber,
            name,
            age,
            gender,
            dhppiVaccinations,
            antiRabiesVaccinations,
            fosterName: fosterName.slice(0, 100),
            location: location.slice(0, 200),
            photos,
            volunteerId: req.volunteerId,
        });
        res.status(201).json(puppy);
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Register puppy error:", err.message);
        }
        res.status(500).json({ error: "Failed to register puppy" });
    }
});

app.patch("/api/volunteer-portal/puppies/:id/adoption", verifyVolunteer, async(req, res) => {
    try {
        const name = sanitizeInput(req.body.name);
        const phone = sanitizeInput(req.body.phone);
        const address = sanitizeInput(req.body.address);
        if (!name || !phone || !address) {
            return res.status(400).json({ error: "Adopter name, phone, and address are required" });
        }
        if (name.length > 100 || address.length > 500 || !isValidPhone(phone)) {
            return res.status(400).json({ error: "Check the adopter details and phone number" });
        }
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "Invalid puppy ID" });
        }

        const adoptionQuery = {
            _id: req.params.id,
            status: "available",
            ...(req.isVolunteerSuperAdmin ? {} : { volunteerId: req.volunteerId }),
        };
        const puppy = await Puppy.findOneAndUpdate(
            adoptionQuery,
            {
                status: "adopted",
                adoption: {
                    name: name.slice(0, 100),
                    phone: phone.slice(0, 20),
                    address: address.slice(0, 500),
                    publicNameConsent: req.body.publicNameConsent === true,
                    adoptedAt: new Date(),
                },
            },
            { new: true, runValidators: true }
        );
        if (!puppy) return res.status(404).json({ error: "Available puppy record not found" });
        res.json(puppy);
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Record puppy adoption error:", err.message);
        }
        res.status(500).json({ error: "Failed to record adoption" });
    }
});

app.get("/api/drive/puppies", async(req, res) => {
    try {
        const [available, adopted, puppies] = await Promise.all([
            Puppy.countDocuments({ status: "available" }),
            Puppy.countDocuments({ status: "adopted" }),
            Puppy.find()
                .select("name photos status adoption.name adoption.publicNameConsent")
                .sort({ updatedAt: -1 })
                .limit(100)
                .lean(),
        ]);
        res.set("Cache-Control", "no-store");
        res.json({
            available,
            adopted,
            puppies: puppies.map((puppy) => ({
                name: puppy.name || "",
                photo: puppy.photos?.[0]?.url || "",
                status: puppy.status,
                adopterFirstName: puppy.adoption?.publicNameConsent
                    ? String(puppy.adoption.name || "").trim().split(/\s+/)[0]
                    : "",
            })),
        });
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.error("Fetch public drive puppy dashboard error:", err.message);
        }
        res.status(500).json({ error: "Live puppy dashboard is temporarily unavailable" });
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

app.use("/api", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
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