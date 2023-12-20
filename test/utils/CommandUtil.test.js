import { describe, it, expect } from 'vitest';
import { switchMasterCommand, checkoutCommand } from '../../src/utils/CommandUtil';

describe('switchMasterCommand', () => {
  it('should generate the correct command for switching to master', () => {
    const mainBranch = 'main';
    const result = switchMasterCommand(mainBranch);

    expect(result).toBe(`git switch ${mainBranch}`);
  });
});

describe('checkoutCommand', () => {
  it('should generate the correct command for creating and switching to a new branch', () => {
    const branchName = 'feature-branch';
    const result = checkoutCommand(branchName);

    expect(result).toBe(`git checkout -b ${branchName}`);
  });

});

