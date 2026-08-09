import { TwitterApi } from 'twitter-api-v2';
import SocialPost from '../models/SocialPost.js';
import { classifySocialPost } from './aiService.js';

const SEARCH_QUERIES = [
  '#AhmedabadMunicipal pothole',
  '#AMCFails',
  'Ahmedabad water supply problem',
  'Ahmedabad garbage not collected',
  '#PotholeAhmedabad',
  'Ahmedabad streetlight broken'
];

let twitterClient;
try {
  if (process.env.X_BEARER_TOKEN) {
    twitterClient = new TwitterApi(process.env.X_BEARER_TOKEN);
  } else {
    console.warn('X_BEARER_TOKEN not found, skipping Twitter client initialization.');
  }
} catch (e) {
  console.warn('X client init failed — scraper disabled');
}

export async function runXScraper() {
  if (!twitterClient) return;

  try {
    for (const query of SEARCH_QUERIES) {
      const result = await twitterClient.v2.search(query, {
        max_results: 10,
        'tweet.fields': ['author_id', 'created_at', 'text'],
        expansions: ['attachments.media_keys'],
        'media.fields': ['url']
      });

      const includes = result.includes || {};
      const mediaList = includes.media || [];

      for (const tweet of result.data?.data || []) {
        const exists = await SocialPost.findOne({ postId: tweet.id });
        if (exists) continue;

        let imageUrl = null;
        if (tweet.attachments && tweet.attachments.media_keys) {
          const mediaKey = tweet.attachments.media_keys[0];
          const mediaItem = mediaList.find(m => m.media_key === mediaKey);
          if (mediaItem && mediaItem.type === 'photo') {
            imageUrl = mediaItem.url;
          }
        }

        const classification = await classifySocialPost(tweet.text);

        await SocialPost.create({
          platform: 'twitter',
          postId: tweet.id,
          text: tweet.text,
          author: tweet.author_id,
          url: `https://twitter.com/i/web/status/${tweet.id}`,
          imageUrl: imageUrl,
          area: classification.area || 'Ahmedabad',
          isCivicIssue: classification.isCivicIssue,
          category: classification.category
        });
      }
    }
    console.log('X scrape complete');
  } catch (err) {
    console.error('X scraper error:', err.message);
  }
}
