import { jest } from '@jest/globals';

const createMock = jest.fn();
process.env.OPENROUTER_API_KEY = 'test_key';

jest.unstable_mockModule('openai', () => ({
  default: class OpenAI {
    constructor() {
      this.chat = {
        completions: {
          create: createMock
        }
      };
    }
  }
}));

const { classifyComplaint, classifySocialPost } = await import('../../src/services/aiService.js');

describe('aiService (OpenRouter)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('classifyComplaint - should return valid JSON', async () => {
    createMock.mockResolvedValue({
      choices: [{
        message: {
          content: '{"category": "Roads", "severity": "High"}'
        }
      }]
    });

    const result = await classifyComplaint('test');
    expect(result.category).toBe('Roads');
    expect(result.severity).toBe('High');
  });

  it('classifySocialPost - should handle valid JSON', async () => {
    createMock.mockResolvedValue({
      choices: [{
        message: {
          content: '{"isCivicIssue": true, "category": "Water"}'
        }
      }]
    });

    const result = await classifySocialPost('test');
    expect(result.isCivicIssue).toBe(true);
    expect(result.category).toBe('Water');
  });

  it('classifySocialPost - should handle invalid JSON gracefully', async () => {
    createMock.mockResolvedValue({
      choices: [{
        message: {
          content: 'invalid json'
        }
      }]
    });

    const result = await classifySocialPost('test');
    expect(result.isCivicIssue).toBe(false);
  });
});
