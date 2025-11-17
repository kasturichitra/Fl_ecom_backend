export default function throwIfTrue(condition, message) {
  if (condition) {
    console.error(`Condition  check failed: ${message}`);
    throw new Error(message);
  }
}
