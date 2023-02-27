const valueToHex = (c: number) => {
  const hexValue = c.toString(16);
  return ('0' + hexValue).slice(-2);
};

export const rgbToHex = (r: number, g: number, b: number) => {
  return valueToHex(r) + valueToHex(g) + valueToHex(b);
};
