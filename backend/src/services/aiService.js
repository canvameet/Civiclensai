import OpenAI from 'openai';
import fs from 'fs';
import axios from 'axios';

let openai = null;

try {
  if (process.env.OPENROUTER_API_KEY) {
    openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY
    });
  } else {
    console.warn('OPENROUTER_API_KEY not found, skipping AI init.');
  }
} catch (e) {
  console.warn('OpenRouter init failed — AI disabled');
}

// Helper to fetch remote image and convert to Base64 data URI
async function fetchImageToBase64(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  } catch (e) {
    console.warn('Failed to fetch image for AI verification:', e.message);
    return null;
  }
}

// Helper to read local image and convert to Base64 data URI
function readLocalImageToBase64(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${data.toString('base64')}`;
  } catch (e) {
    console.warn('Failed to read local image for AI:', e.message);
    return null;
  }
}

export async function classifyComplaint(rawText, imagePathOrUrl = null, recentComplaints = []) {
  if (!openai) {
    return {
      category: 'Uncategorized',
      severity: 'Low',
      department: 'General',
      summary: rawText,
      routingExplanation: 'AI disabled'
    };
  }

  const prompt = `You are an AI for a civic management system. Analyze this complaint.
If an image is provided, verify that the image matches the complaint text and visually confirms the issue.

Return ONLY valid JSON matching this schema:
{
  "category": "Roads, Water, Sanitation, Electricity, or Other",
  "severity": "Low, Medium, High, or Critical",
  "severityReason": "String",
  "department": "String (e.g., Road & Building Dept)",
  "routingExplanation": "String",
  "summary": "String",
  "duplicateIndex": number (if it matches one of the recent complaints below, put its index (0-indexed). Otherwise -1),
  "similarityReason": "String"
}

Complaint Text: "${rawText}"
Recent Complaints: ${JSON.stringify(recentComplaints)}
`;

  try {
    const contentArray = [
      { type: "text", text: prompt }
    ];

    if (imagePathOrUrl) {
      let base64Image = null;
      if (imagePathOrUrl.startsWith('http')) {
        base64Image = await fetchImageToBase64(imagePathOrUrl);
      } else {
        base64Image = readLocalImageToBase64(imagePathOrUrl);
      }
      
      if (base64Image) {
        contentArray.push({
          type: "image_url",
          image_url: {
            url: base64Image
          }
        });
      }
    }

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", // A cheap, fast vision model on OpenRouter
      messages: [
        { role: "user", content: contentArray }
      ],
      response_format: { type: "json_object" }
    });

    const responseText = response.choices[0].message.content;
    return JSON.parse(responseText);
  } catch (err) {
    console.error('[OpenRouter Classification Error]:', err.message);
    throw err;
  }
}

export async function classifySocialPost(postText, imageUrl = null) {
  if (!openai) {
    return { isCivicIssue: true, category: 'General', area: 'Unknown' };
  }

  const prompt = `Analyze this social media post. Determine if it's a valid civic complaint.
If an image is provided, verify it visually depicts the issue.

Return ONLY valid JSON:
{
  "isCivicIssue": boolean,
  "category": "String (e.g. Roads, Water) or null",
  "area": "String (Extract location if mentioned) or null"
}
Post: "${postText}"`;

  try {
    const contentArray = [
      { type: "text", text: prompt }
    ];
    
    if (imageUrl) {
      const base64Image = await fetchImageToBase64(imageUrl);
      if (base64Image) {
        contentArray.push({
          type: "image_url",
          image_url: { url: base64Image }
        });
      }
    }

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "user", content: contentArray }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error('[OpenRouter Social Post Error]:', err.message);
    return { isCivicIssue: false };
  }
}
