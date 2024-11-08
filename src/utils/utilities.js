// import dayjs from "dayjs";

// export const formatDate = (dateString, format='MM/DD/YYYY') => {
//     return dayjs(dateString).local().format(format);
// }
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Function to format date with timezone handling
export const formatDate = (dateString, format = 'MM/DD/YYYY ', timeZone = 'America/New_York') => {
    return dayjs.utc(dateString).tz(timeZone).format(format);
};
