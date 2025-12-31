import { getTenantModels } from "../lib/tenantModelsCache.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { validateFaqCreate } from "./validations/validateFaqCreate.js";

export const getAdminFaqTreeService = async (tenantId) => {
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
  let {
    parent_question_id,
    question_text,
    answer_text,
    issue_type,
    escalation_allowed = false,
    priority = 0,
    type,
  } = data;

  const { faqModelDB } = await getTenantModels(tenantId);

  if (parent_question_id) {
    let existingQuestion = await faqModelDB.findOne({ question_id: parent_question_id });
    throwIfTrue(!existingQuestion, "Parent question not found");
  }

  const question_id = `FAQ-${type}-${issue_type}`.toUpperCase();

  const faqPayload = {
    question_id,
    question_text,
    answer_text,
    issue_type,
    type,
    parent_question_id: parent_question_id || null,
    escalation_allowed,
    priority,
    created_by: "admin",
    is_active: true,
  };

  const { isValid, message } = validateFaqCreate(faqPayload);

  throwIfTrue(!isValid, message);

  const faq = await faqModelDB.create(faqPayload);

  return faq;
};
