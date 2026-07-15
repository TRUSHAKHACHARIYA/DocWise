import axios from 'axios';
import * as cheerio from 'cheerio';
import { validateUrlSafety } from '../utils/ssrf';
import { logger } from '../utils/logger';

interface ScrapedContent {
  title: string;
  text: string;
  url: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {
    await validateUrlSafety(url);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'DocWise/1.0 (Web Scraping Service)',
      },
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });

    const finalUrl = response.request?.res?.responseUrl || url;
    if (finalUrl !== url) {
      await validateUrlSafety(finalUrl);
    }

    const $ = cheerio.load(response.data);

    $('script, style, iframe, nav, footer, header').remove();

    const title = $('title').text().trim() || url;
    
    let content = $('main').text();
    if (!content || content.trim().length < 200) {
      content = $('article').text();
    }
    if (!content || content.trim().length < 200) {
      content = $('body').text();
    }

    const cleanContent = content
      .replace(/\s\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    return {
      title,
      text: cleanContent,
      url,
    };
  } catch (error: any) {
    logger.error(`Scraping failed for ${url}`, { error: error.message });
    throw new Error(`Failed to scrape URL: ${error.message}`);
  }
}
