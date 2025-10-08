// src/modules/rss/test/runFetchTest.ts
import { fetchFeedFromUrl } from "../service";

async function main() {
  const testUrl = process.argv[2] || "https://feeds.bbci.co.uk/news/rss.xml";
  console.log("Testing fetchFeedFromUrl with:", testUrl);

  try {
    const { feedMeta, items } = await fetchFeedFromUrl(testUrl, 10);
    console.log("=== Feed Meta ===");
    console.log(feedMeta);
    console.log("=== Items (first 5) ===");
    console.log(items.slice(0, 5).map(it => ({
      guid: it.guid,
      title: it.title,
      link: it.link,
      pubDate: it.pubDate ? it.pubDate.toISOString() : null,
      hasEnclosure: !!it.enclosure,
      itunes: it.itunes
    })));
    console.log(`Total items parsed: ${items.length}`);
    process.exit(0);
  } catch (err:any) {
    console.error("Error during fetchFeedFromUrl:", err?.message ?? err);
    process.exit(2);
  }
}

main();
