import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    console.log("Contact form submission:", { name, email, subject, message });
    res.json({ message: "Thank you for your message. We will respond within 24 hours.", success: true });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
