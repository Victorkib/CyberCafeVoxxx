import crypto from 'crypto';

/**
 * Generates a secure temporary password
 * @param {number} length - Length of the password (default: 12)
 * @returns {string} A secure temporary password
 */
export const generateTempPassword = (length = 12) => {
  // Define character sets
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Combine all characters
  const allChars = uppercase + lowercase + numbers + symbols;
  
  // Ensure at least one character from each set
  let password = '';
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += numbers[crypto.randomInt(numbers.length)];
  password += symbols[crypto.randomInt(symbols.length)];
  
  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }
  
  // Shuffle the password
  return password
    .split('')
    .sort(() => crypto.randomInt(-1, 2))
    .join('');
}; 