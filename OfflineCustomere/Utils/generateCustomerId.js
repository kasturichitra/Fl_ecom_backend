export const generateCustomerId = (() => {
  let counter = 0;

  return () => {
    const timestamp = Date.now();
    counter = (counter + 1) % 1000000;
    const userId = `CUST_${timestamp}${counter}`;
    return userId;
  };
})();
