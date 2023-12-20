import { describe, it, expect } from 'vitest';
import { validateTemplate, replaceVariables } from '../../src/utils/OptionUtil';

describe('validateTemplate', () => {
  it('should return true for "release/%version%-%name%"', () => {
    const result = validateTemplate('release/%version%-%name%');
    expect(result).toBe(true);
  });

  it('should return false for "release/version-%name}"', () => {
    const result = validateTemplate('release/version-%name}');
    expect(result).toBe(false);
  });

  it('should return true for "release/%version%-%name%"', () => {
    const result = validateTemplate('release/%version%-%name%}');
    expect(result).toBe(true);
  });

  it('should return false for "release/$version%-%name%"', () => {
    const result = validateTemplate('release/$version%-%name%}');
    expect(result).toBe(false);
  });

  it('should return false for "release/version%"', () => {
    const result = validateTemplate('release/version%');
    expect(result).toBe(false);
  });
})

describe('replaceVariables', () => {
  const globalVariables = {
    name: "test",
    version: "1.2.0",
    time: "2023-12-20",
    type: "feature"
  }

  it('should return release/1.2.0-test for "release/%version%-%name%"', () => {
    const result = replaceVariables('release/%version%-%name%', globalVariables);
    expect(result).toBe("release/1.2.0-test");
  });

  it('should return release/1.2.0-test-2023-12-20 for "release/%version%-%name%-%time%"', () => {
    const result = replaceVariables('release/%version%-%name%-%time%', globalVariables);
    expect(result).toBe("release/1.2.0-test-2023-12-20");
  });

  it('should return release/version-time for "release/version-time"', () => {
    const result = replaceVariables('release/version-time', globalVariables);
    expect(result).toBe("release/version-time");
  });

  it('should return release/1.2.0-time for "release/%version%-time"', () => {
    const result = replaceVariables('release/%version%-time', globalVariables);
    expect(result).toBe("release/1.2.0-time");
  });

  it('should return feature/1.2.0-time for "%type%/%version%-time"', () => {
    const result = replaceVariables('%type%/%version%-time', globalVariables);
    expect(result).toBe("feature/1.2.0-time");
  });

  it('should return feature-1.2.0-time for "%type%-%version%-time"', () => {
    const result = replaceVariables('%type%-%version%-time', globalVariables);
    expect(result).toBe("feature-1.2.0-time");
  });

})