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

describe('padZero', () => {
  it('input 8 should return 08', () => {
    const result = padZero(8)
    expect(result).toBe("08");
  });

  it('input 11 should return 11', () => {
    const result = padZero(11)
    expect(result).toEqual("11");
  });
});

