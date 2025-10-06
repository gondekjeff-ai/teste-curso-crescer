import { authenticator } from 'otplib';

export const generateMFASecret = () => {
  return authenticator.generateSecret();
};

export const generateQRCode = (email: string, secret: string) => {
  const issuer = 'OptiStrat';
  const otpauth = authenticator.keyuri(email, issuer, secret);
  return otpauth;
};

export const verifyMFAToken = (token: string, secret: string) => {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    return false;
  }
};
