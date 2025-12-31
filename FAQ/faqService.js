import { getTenantModels } from "../lib/tenantModelsCache.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { validateFaqCreate } from "./validations/validateFaqCreate.js";
import { validateFaqUpdate } from "./validations/validateFaqUpdate.js";

export const getAdminFaqTreeService = async (tenantId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  
  const { faqModelDB } = await getTenantModels(tenantId);

  const faqs = await faqModelDB.find({}).sort({ priority: 1 }).lean();

  const map = {};
  faqs.forEach(
    (f) =>
      (map[f.question_id] = {
        ...f,
        children: [],
      })
  );

  const tree = [];
  faqs.forEach((faq) => {
    if (faq.parent_question_id) {
      map[faq.parent_question_id]?.children.push(map[faq.question_id]);
    } else {
      tree.push(map[faq.question_id]);
    }
  });

  return tree;
};

export const createFaqService = async (tenantId, data) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const {
    parent_question_id = null,
    question_text,
    answer_text,
    issue_type,
    escalation_allowed = false,
    priority = 0,
    type,
    sub_category = null,
    escalation_label = "Still need help?",
    keywords = [],
  } = data;

  const { faqModelDB } = await getTenantModels(tenantId);

  /* -------------------------------------------------------------------------- */
  /*                         1️⃣ BASIC PARENT EXISTENCE CHECK                   */
  /* -------------------------------------------------------------------------- */
  let parentFaq = null;

  if (parent_question_id) {
    parentFaq = await faqModelDB.findOne({ question_id: parent_question_id });
    throwIfTrue(!parentFaq, "Parent question not found");
  }

  /* -------------------------------------------------------------------------- */
  /*                         2️⃣ PREPARE PAYLOAD FOR VALIDATION                  */
  /* -------------------------------------------------------------------------- */
  const faqPayloadForValidation = {
    question_text,
    answer_text,
    issue_type,
    type,
    parent_question_id,
    escalation_allowed,
    priority,
    sub_category,
    keywords,
  };

  /* -------------------------------------------------------------------------- */
  /*                         3️⃣ VALIDATE USING JOI                              */
  /* -------------------------------------------------------------------------- */
  const { isValid, message } = validateFaqCreate(faqPayloadForValidation);

  throwIfTrue(!isValid, message);

  /* -------------------------------------------------------------------------- */
  /*                         4️⃣ GENERATE QUESTION ID                            */
  /* -------------------------------------------------------------------------- */
  const question_id = `FAQ-${issue_type}-${type}-${Date.now()}`.toUpperCase();

  /* -------------------------------------------------------------------------- */
  /*                         5️⃣ FINAL DB PAYLOAD                                */
  /* -------------------------------------------------------------------------- */
  const faqPayload = {
    question_id,
    question_text,
    answer_text,
    issue_type,
    sub_category,
    type,
    parent_question_id,
    escalation_allowed: type === "leaf" ? escalation_allowed : false,
    escalation_label,
    priority,
    keywords,
    created_by: "admin",
    is_active: true,
  };

  /* -------------------------------------------------------------------------- */
  /*                         6️⃣ CREATE FAQ                                      */
  /* -------------------------------------------------------------------------- */
  const faq = await faqModelDB.create(faqPayload);

  /* -------------------------------------------------------------------------- */
  /*                         7️⃣ LINK TO PARENT (TREE INTEGRITY)                 */
  /* -------------------------------------------------------------------------- */
  if (parent_question_id) {
    await faqModelDB.updateOne({ question_id: parent_question_id }, { $push: { next_questions: question_id } });
  }

  return faq;
};

export const updateFaqService = async (tenantId, faqId, data) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!faqId, "FAQ ID is required");

  const { faqModelDB } = await getTenantModels(tenantId);

  const faq = await faqModelDB.findOne({ question_id: faqId });
  throwIfTrue(!faq, "FAQ not found");

  const allowedUpdates = ["question_text", "answer_text", "escalation_allowed", "priority"];

  allowedUpdates.forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      faq[key] = data[key];
    }
  });

  const validationJSON = allowedUpdates.reduce((acc, key) => ({ ...acc, [key]: faq[key] }), {});

  const { isValid, message } = validateFaqUpdate(validationJSON, faq);
  throwIfTrue(!isValid, message);

  const updatedFaq = await faq.save();

  return updatedFaq;
};

export const toggleFaqStatusService = async (tenantId, question_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!question_id, "FAQ ID is required");

  const { faqModelDB } = await getTenantModels(tenantId);

  const faq = await faqModelDB.findOne({ question_id });
  throwIfTrue(!faq, "FAQ not found");

  faq.is_active = !faq.is_active;

  const updatedFaq = await faq.save();

  return updatedFaq;
}