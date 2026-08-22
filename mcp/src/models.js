import mongoose from "mongoose";

/*
   These schemas mirror the inline schemas in api/index.js (the live ones).
   They deliberately do NOT follow api/models/Adoption.js, which is dead code
   with a conflicting shape (uppercase statuses, a breed field, age as String).
   If you change a field in api/index.js, change it here too.
*/

export const ADOPTION_STATUSES = ["pending", "approved", "rejected", "adopted"];
export const VOLUNTEER_STATUSES = ["pending", "approved", "rejected"];

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
        enum: ADOPTION_STATUSES,
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
        enum: VOLUNTEER_STATUSES,
        default: "pending",
        index: true,
    },
}, { timestamps: true });

// mongoose.models guard keeps hot-reloading / repeat imports from throwing
// OverwriteModelError.
export const Adoption =
    mongoose.models.Adoption || mongoose.model("Adoption", adoptionSchema);
export const Volunteer =
    mongoose.models.Volunteer || mongoose.model("Volunteer", volunteerSchema);
