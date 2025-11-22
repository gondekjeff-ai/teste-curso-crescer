import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RSS Feeds de sites de tecnologia
const RSS_FEEDS = [
  'https://feeds.feedburner.com/tecmundo',
  'https://olhardigital.com.br/feed/',
  'https://canaltech.com.br/rss/',
  'https://techcrunch.com/feed/',
  'https://www.wired.com/feed/rss',
];

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image?: string;
  content?: string;
}

// Parse RSS XML to JSON
function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  
  // Simple XML parsing for RSS items
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const matches = xml.matchAll(itemRegex);
  
  for (const match of matches) {
    const itemXml = match[1];
    
    // Extract title
    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // Extract link
    const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/);
    const link = linkMatch ? linkMatch[1].trim() : '';
    
    // Extract description
    const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s);
    let description = descMatch ? descMatch[1].trim() : '';
    
    // Clean HTML from description and limit length
    description = description.replace(/<[^>]*>/g, '').substring(0, 200);
    
    // Extract content:encoded if available
    const contentMatch = itemXml.match(/<content:encoded>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/content:encoded>/s);
    let content = contentMatch ? contentMatch[1].trim() : description;
    
    // Extract pubDate
    const dateMatch = itemXml.match(/<pubDate>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/pubDate>/);
    const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
    
    // Extract image
    const imageMatch = itemXml.match(/<media:content[^>]*url="([^"]*)"/) || 
                      itemXml.match(/<enclosure[^>]*url="([^"]*)"/) ||
                      itemXml.match(/<media:thumbnail[^>]*url="([^"]*)"/);
    const image = imageMatch ? imageMatch[1] : null;
    
    if (title && link) {
      items.push({
        title,
        link,
        description,
        pubDate,
        image: image || undefined,
        content
      });
    }
  }
  
  return items;
}

async function fetchAndParseRSS(feedUrl: string): Promise<RSSItem[]> {
  try {
    console.log(`Fetching RSS feed: ${feedUrl}`);
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch ${feedUrl}: ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    const items = parseRSS(xml);
    console.log(`Parsed ${items.length} items from ${feedUrl}`);
    return items;
  } catch (error) {
    console.error(`Error fetching RSS feed ${feedUrl}:`, error);
    return [];
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting tech news fetch from RSS feeds');

    // Fetch all RSS feeds in parallel
    const allFeedPromises = RSS_FEEDS.map(feed => fetchAndParseRSS(feed));
    const allFeedResults = await Promise.all(allFeedPromises);
    
    // Flatten all items
    const allItems = allFeedResults.flat();
    console.log(`Total items fetched: ${allItems.length}`);

    // Sort by date (newest first) and take top 50
    const sortedItems = allItems
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 50);

    // Insert or update news in database
    let inserted = 0;
    let updated = 0;

    for (const item of sortedItems) {
      // Check if news already exists by link
      const { data: existing } = await supabase
        .from('news')
        .select('id, title')
        .eq('image_url', item.link)
        .single();

      const newsData = {
        title: item.title,
        content: item.content || item.description,
        excerpt: item.description,
        image_url: item.link, // Using link as unique identifier
        published: true,
      };

      if (existing) {
        // Update existing news
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', existing.id);

        if (!error) {
          updated++;
        } else {
          console.error('Error updating news:', error);
        }
      } else {
        // Insert new news
        const { error } = await supabase
          .from('news')
          .insert([newsData]);

        if (!error) {
          inserted++;
        } else {
          console.error('Error inserting news:', error);
        }
      }
    }

    console.log(`Processed ${sortedItems.length} items: ${inserted} inserted, ${updated} updated`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Fetched and processed ${sortedItems.length} tech news articles`,
        stats: {
          total: sortedItems.length,
          inserted,
          updated,
        },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in fetch-tech-news function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
