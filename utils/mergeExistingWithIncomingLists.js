// utils/mergeItems.js

/**
 * Merges existing items with incoming items based on a shared key.
 * - Updates values of matching items
 * - Adds missing items
 * - Does NOT remove items unless you enable the optional block
 *
 * @param {Array} existingItems
 * @param {Array} incomingItems
 * @param {String} keyField - the property name used as the identifier (e.g. "id" or "code")
 * @param {String} valueField - the property name whose value should be updated (e.g. "value")
 * @returns {Array} mergedItems
 */
export function mergeExistingWithIncomingLists(
  existingItems = [],
  incomingItems = [],
  keyField = "key",
  valueField = "value"
) {
  if (!Array.isArray(incomingItems)) return existingItems;

  const existingMap = new Map(
    existingItems.map(item => [item[keyField], item[valueField]])
  );

  const updatedItems = [...existingItems];

  incomingItems.forEach(item => {
    const key = item[keyField];
    const value = item[valueField];

    if (existingMap.has(key)) {
      const index = updatedItems.findIndex(i => i[keyField] === key);
      updatedItems[index][valueField] = value;
    } else {
      updatedItems.push({ [keyField]: key, [valueField]: value });
    }
  });

  // -------------------------------------
  // OPTIONAL FEATURE — delete items that are not present in incomingItems
  // -------------------------------------

  // const incomingKeys = new Set(incomingItems.map(i => i[keyField]));
  // const filteredItems = updatedItems.filter(i => incomingKeys.has(i[keyField]));
  // return filteredItems;

  return updatedItems;
}