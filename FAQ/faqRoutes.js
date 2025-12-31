import { Router } from "express";

import {
  getAdminFaqTreeController,
  createFaqController,
  //   updateFaqController,
  //   toggleFaqStatusController,
  //   reorderFaqsController,
  //   getRootFaqsController,
  //   getChildFaqsController,
  //   getFaqAnswerController,
} from "./faqController.js";

const router = Router();

// Full tree for admin
router.get("/admin/tree", getAdminFaqTreeController);

// // Create FAQ (root or child)
router.post("/admin", createFaqController);

// // Update FAQ content
// router.put("/admin/:question_id", updateFaqController);

// // Enable / Disable FAQ
// router.patch("/admin/:question_id/toggle", toggleFaqStatusController);

// // Reorder children under same parent
// router.patch("/admin/reorder", reorderFaqsController);

// /* ================= USER ROUTES ================= */

// // Get root FAQs
// router.get("/root", getRootFaqsController);

// // Get children of a FAQ
// router.get("/:question_id/children", getChildFaqsController);

// // Get FAQ answer (leaf)
// router.get("/:question_id", getFaqAnswerController);

export default router;
