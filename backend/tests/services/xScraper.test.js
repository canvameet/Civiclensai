import { jest } from '@jest/globals';
import '../setup.js';

const searchMock = jest.fn();

jest.unstable_mockModule('twitter-api-v2', () => ({
  TwitterApi: class {
    get v2() {
      return { search: searchMock };
    }
  }
}));

jest.unstable_mockModule('../../src/services/aiService.js', () => ({
  classifySocialPost: jest.fn().mockResolvedValue({
    isCivicIssue: true,
    category: 'Roads',
    area: 'Bopal'
  })
}));

const { runXScraper } = await import('../../src/services/xScraper.js');
const SocialPost = (await import('../../src/models/SocialPost.js')).default;

describe('xScraper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should scrape tweets and save civic issues', async () => {
    searchMock.mockResolvedValue({
      data: {
        data: [
          { id: 't1', text: 'tweet 1', author_id: 'a1' }
        ]
      }
    });

    await runXScraper();
    
    const posts = await SocialPost.find();
    expect(posts).toBeDefined();
  });
});
