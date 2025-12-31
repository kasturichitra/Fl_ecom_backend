import { getTenantModels } from "../lib/tenantModelsCache.js";

export const getAdminFaqTreeService = async (tenantId) => {
  const { faqModelDB } = await getTenantModels(tenantId);

  const faqs = await faqModelDB.find({}).sort({ priority: -1 }).lean();

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
    if(faq.parent_question_id) {
        map[faq.parent_question_id]?.children.push(map[faq.question_id]);
    } else {
        tree.push(map[faq.question_id]);
    }
  })

  return tree; 
};
