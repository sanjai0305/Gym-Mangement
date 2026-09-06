export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return phone.length >= 7;
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};
