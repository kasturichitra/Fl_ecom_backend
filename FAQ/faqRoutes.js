import { Router } from "express";

import {
  getAdminFaqTreeController,
  createFaqController,
  updateFaqController,
  toggleFaqStatusController,
  reorderFaqController,
  getRootFaqController,
  getChildFaqController,
  //   getChildFaqsController,
  //   getFaqAnswerController,
} from "./faqController.js";

const router = Router();

// Full tree for admin
router.get("/admin/tree", getAdminFaqTreeController);

// // Create FAQ (root or child)
router.post("/admin", createFaqController);

// // Update FAQ content
router.put("/admin/:id", updateFaqController);

// // Enable / Disable FAQ
router.patch("/admin/toggle/:id", toggleFaqStatusController);

// // Reorder children under same parent
router.patch("/admin/reorder", reorderFaqController);

// /* ================= USER ROUTES ================= */

// // Get root FAQs
router.get("/root", getRootFaqController);

// // Get children of a FAQ
router.get("/child/:id", getChildFaqController);

// // Get FAQ answer (leaf)
// router.get("/:question_id", getFaqAnswerController);

export default router;
