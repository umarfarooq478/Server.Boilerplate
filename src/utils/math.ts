/**
 * Normalizes a numeric array to a given range
 * @param arr The array to normalize
 * @param min The minimum value to normalize to
 * @param max The maximum value to normalize to
 */
export const normalizeNumericArray = (arr: number[], min = 0, max = 1) => {
  const minArr = Math.min(...arr);
  const maxArr = Math.max(...arr);
  const rangeArr = maxArr - minArr;
  const range = max - min;
  return arr.map((val) => {
    return ((val - minArr) / rangeArr) * range + min;
  });
};
