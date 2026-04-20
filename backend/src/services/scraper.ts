import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapedContent {
  title: string;
  text: string;
  url: string;
}

/**
 * Basic web scraper to extract text from a URL.
 */
export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'DocWise/1.0 (Web Scraping Service)',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Remove script and style elements
    $('script, style, iframe, nav, footer, header').remove();

    const title = $('title').text().trim() || url;
    
    // Attempt to get main content, fall back to body
    let content = $('main').text();
    if (!content || content.trim().length < 200) {
      content = $('article').text();
    }
    if (!content || content.trim().length < 200) {
      content = $('body').text();
    }

    // Basic text cleanup
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
    console.error(`Scraping failed for ${url}:`, error.message);
    throw new Error(`Failed to scrape URL: ${error.message}`);
  }
}
