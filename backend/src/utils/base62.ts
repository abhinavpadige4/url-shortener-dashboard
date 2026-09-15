const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const BASE = CHARSET.length;

export const encodeBase62 = (num: number): string => {
  if (num === 0) return CHARSET[0];
  
  let encoded = '';
  while (num > 0) {
    const remainder = num % BASE;
    encoded = CHARSET[remainder] + encoded;
    num = Math.floor(num / BASE);
  }
  
  return encoded;
};

export const decodeBase62 = (str: string): number => {
  let decoded = 0;
  for (let i = 0; i < str.length; i++) {
    const charIndex = CHARSET.indexOf(str[i]);
    if (charIndex === -1) throw new Error('Invalid base62 character');
    decoded = decoded * BASE + charIndex;
  }
  return decoded;
};

export const generateShortCode = (length: number = 7): string => {
  // Generate a random number and convert to base62
  const randomNum = Math.floor(Math.random() * Math.pow(BASE, length));
  let code = encodeBase62(randomNum);
  
  // Pad with leading zeros if needed
  while (code.length < length) {
    code = '0' + code;
  }
  
  return code;
};