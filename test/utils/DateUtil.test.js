import { describe, it, expect } from 'vitest';
import { getCurrentTime, padZero } from '../../src/utils/DateUtil';

describe('getCurrentTime', () => {
  it('should return the current date in the format "YYYY-MM-DD"', () => {
    const result = getCurrentTime();

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = padZero(currentDate.getMonth() + 1);
    const currentDay = padZero(currentDate.getDate());
    const expectedDateString = `${currentYear}-${currentMonth}-${currentDay}`;

    expect(result).toBe(expectedDateString);
  });
});
