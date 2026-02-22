import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const matches = xml.matchAll(itemRegex);
  
  for (const match of matches) {
    const itemXml = match[1];
    
    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/);
    const link = linkMatch ? linkMatch[1].trim() : '';
    
    const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s);
    let description = descMatch ? descMatch[1].trim() : '';
    description = description.replace(/<[^>]*>/g, '').substring(0, 200);
    
    const contentMatch = itemXml.match(/<content:encoded>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/content:encoded>/s);
    const content = contentMatch ? contentMatch[1].trim() : description;
    
    const dateMatch = itemXml.match(/<pubDate>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/pubDate>/);
    const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
    
    const imageMatch = itemXml.match(/<media:content[^>]*url="([^"]*)"/) || 
                      itemXml.match(/<enclosure[^>]*url="([^"]*)"/) ||
                      itemXml.match(/<media:thumbnail[^>]*url="([^"]*)"/);
    const image = imageMatch ? imageMatch[1] : null;
    
    if (title && link) {
      items.push({ title, link, description, pubDate, image: image || undefined, content });
    }
  }
  
  return items;
}

async function fetchAndParseRSS(feedUrl: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)' },
    });
    
    if (!response.ok) return [];
    
    const xml = await response.text();
    return parseRSS(xml);
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const allFeedResults = await Promise.all(RSS_FEEDS.map(feed => fetchAndParseRSS(feed)));
    const allItems = allFeedResults.flat();

    const sortedItems = allItems
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 50);

    let inserted = 0;
    let updated = 0;

    for (const item of sortedItems) {
      const { data: existing } = await supabase
        .from('news')
        .select('id, title')
        .eq('image_url', item.link)
        .single();

      const newsData = {
        title: item.title,
        content: item.content || item.description,
        excerpt: item.description,
        image_url: item.link,
        published: true,
      };

      if (existing) {
        const { error } = await supabase.from('news').update(newsData).eq('id', existing.id);
        if (!error) updated++;
      } else {
        const { error } = await supabase.from('news').insert([newsData]);
        if (!error) inserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Fetched and processed ${sortedItems.length} tech news articles`,
        stats: { total: sortedItems.length, inserted, updated },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
