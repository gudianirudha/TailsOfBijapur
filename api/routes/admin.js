router.get("/pending", async (req, res) => {
  try {
    const data = await Adoption.find({ status: "PENDING" }); // uppercase
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/approve/:id", async (req, res) => {
  try {
    await Adoption.findByIdAndUpdate(req.params.id, {
      status: "APPROVED",
      approvedAt: new Date(),
    });

    res.json({ message: "Approved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/reject/:id", async (req, res) => {
  try {
    await Adoption.findByIdAndUpdate(req.params.id, {
      status: "REJECTED",
      rejectedAt: new Date(),
    });

    res.json({ message: "Rejected successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
