const mongoose = require("mongoose");

const adoptionSchema = new mongoose.Schema(
  {
    name: String,
    breed: String,
    age: String,
    description: String,
    imageUrl: String,
    public_id: String,
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    approvedAt: Date,
    rejectedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Adoption", adoptionSchema);
