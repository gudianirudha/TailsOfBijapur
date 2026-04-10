const express = require("express");
const router = express.Router();
const upload = require("../middleware/cloudinaryUpload");
const Adoption = require("../models/Adoption");

router.post("/submit", upload.single("image"), async (req, res) => {
  try {
    const newAdoption = new Adoption({
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
      description: req.body.description,
      imageUrl: req.file.path,      // Cloudinary URL
      public_id: req.file.filename, // Cloudinary public ID
      status: "pending",            // Add status
    });

    await newAdoption.save();

    res.json({ message: "Form submitted successfully", adoption: newAdoption });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/approved", async (req, res) => {
  try {
    const data = await Adoption.find({ status: "approved" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


