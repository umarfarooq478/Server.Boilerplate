import * as moment from 'moment';

export const convertUTCDateTimeStringToMomentDate = (
  dateTimeString: string,
  dateTimeFormat: string,
) => {
  const dateTimeMoment = moment.utc(dateTimeString, dateTimeFormat, true);
  if (dateTimeMoment.isValid()) {
    return dateTimeMoment;
  } else {
    return null;
  }
};
export const getCurrentUtcMoment = () => {
  return moment.utc();
};

// convert timestamps to Moment
export const convertTimestampToMoment = (timestamp: number) => {
  return moment.unix(normalizeTimeStamp(timestamp));
};

/**
 * Convert moment date to timestamp
 * @param momentDate The moment date to convert to timestamp
 * @returns The timestamp
 */
export const convertMomentToTimestamp = (momentDate: moment.Moment) => {
  return normalizeTimeStamp(momentDate.unix());
};

/**
 * This function subtracts the given minutes and seconds from the given moment date
 * @param momentDate The moment date to subtract the given minutes and seconds from
 * @param minutes The number of minutes to subtract from the given moment date
 * @param seconds The number of seconds to subtract from the given moment date
 * @returns The moment date after subtracting the given minutes and seconds
 */
export const subtractTimeFromMoment = (
  momentDate: moment.Moment,
  minutes: number,
  seconds = 0,
) => {
  return momentDate.subtract(minutes, 'minutes').subtract(seconds, 'seconds');
};
/**
 * This function adds the given minutes and seconds in the given moment date
 * @param momentDate The moment date to add the given minutes and seconds to
 * @param minutes The number of minutes to add in the given moment date
 * @param seconds The number of seconds to add in the given moment date
 * @returns The moment date after adding the given minutes and seconds
 */
export const addTimeInMoment = (
  momentDate: moment.Moment,
  minutes: number,
  seconds = 0,
) => {
  return momentDate.add(minutes, 'minutes').subtract(seconds, 'seconds');
};

/**
 * This function normalizes the given timestamp to UTC and to the nearest second. (10 digits instead of 13)
 * @param timestamp The timestamp to normalize
 * @returns
 */
export const normalizeTimeStamp = (timestamp: number) => {
  // If the timestamp is in milliseconds, convert it to seconds
  let timestampInNearestSecond = timestamp;
  if (timestamp > 9999999999) {
    timestampInNearestSecond = Math.floor(timestamp / 1000);
  }
  return moment.unix(timestampInNearestSecond).utc().unix();
};

/**
 *
 * @param timestamp The timestamp to unnormalize
 * @returns 13 digit timestamp
 */
export const unNormalizeTimeStamp = (timestamp: number) => {
  // if the timestamp is in seconds, convert it to milliseconds
  let timestampInNearestMilliSecond = timestamp;
  if (timestamp.toString().length < 13) {
    timestampInNearestMilliSecond = Number(
      timestamp.toString().padEnd(13, '0'),
    );
  }
  return timestampInNearestMilliSecond;
};

/**
 * This function finds the difference between two moments in the given unit of time. It is equivalent to moment 2 - moment 1
 * @param moment1 This is the first moment (That comes before moment2)
 * @param moment2 Second moment (That comes after moment1)
 * @param unit The unit of time to find the difference in. (Eg: 'minutes', 'seconds')
 * @returns The difference between the two moments in the given unit of time
 */
export const findDifferenceBetweenTwoMoments = (
  moment1: moment.Moment,
  moment2: moment.Moment,
  unit: moment.unitOfTime.Diff,
) => {
  return moment2.diff(moment1, unit);
};
