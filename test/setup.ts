import { jest } from '@jest/globals';

jest.mock('poker-evaluator', () => ({
  evaluate: jest.fn()
}));

beforeEach(() => {
  jest.clearAllMocks();
});