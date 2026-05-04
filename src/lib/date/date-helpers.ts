import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

dayjs.extend(timezone);
dayjs.extend(utc);

export class DateHelpers {
  static getBangkokDayBoundsInUtc(date = new Date()) {
    const nowInBangkok = dayjs.tz(date, 'Asia/Bangkok');
    const start = nowInBangkok.startOf('day').toDate();
    const end = nowInBangkok.endOf('day').toDate();

    return { start, end };
  }

  static getBangkokCurrentDateString(date = new Date()): string {
    return dayjs.tz(date, 'Asia/Bangkok').format('YYYY-MM-DD');
  }
}
