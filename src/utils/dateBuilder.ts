export const dateBuilder = () => {
  const currentDate = new Date();
  let month: any = currentDate.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  let dateOfMonth: any = currentDate.getDate();
  if (dateOfMonth < 10) {
    dateOfMonth = '0' + dateOfMonth;
  }
  const year = currentDate.getFullYear();
  const formattedDate = dateOfMonth + '/' + month + '/' + year;
  return formattedDate;
};

export const constructDateFromUTCDateTime = (
  dateString: string,
  timeString: string,
) => {
  // date string is in the format DD/MM/YYYY and timestrinmg follows the 24 hr format hh:mm
  const newDate = new Date();
  const [day, month, year] = dateString.split('/').slice(0, 3);
  const [hour, minutes] = timeString.split(':').slice(0, 2);
  newDate.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
  newDate.setUTCHours(Number(hour), Number(minutes), 0, 0);
  return newDate;
};

export const floorMomentDateTime = (dateTime: any, floorBy = 'minute') => {
  return dateTime.startOf(floorBy);
};

export const ceilMomentDateTime = (dateTime: any, ceilBy = 'minute') => {
  return dateTime.subtract(1, 'millisecond').add(1, ceilBy).startOf(ceilBy);
};
