import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const hashData = async (data: string) => {
  return await bcrypt.hash(data, 10);
};

export const generateNewRandomId = () => {
  return uuidv4();
};

export const printExpirationInfoForJWTToken = (payload: any) => {
  const { iat: creationTime, exp: expTime } = payload;
  const currDateTime = new Date().getTime() / 1000;
  const validityPeriod = (expTime - creationTime) / 3600 / 24;
  const daysremainingInExpiration = (expTime - currDateTime) / 3600 / 24;
  const daysSinceCreation = (currDateTime - creationTime) / 3600 / 24;
  console.log('Validity Period', validityPeriod);
  console.log('Number of days left in Expiration ', daysremainingInExpiration);
  console.log('Number of days since created ', daysSinceCreation);
};
