import { PROXY_URL } from "./apiConfig";
// Service function to fetch RSS feed data
export const fetchRssFeed = function(url, callback) {
  fetch(PROXY_URL + "?url=" + url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(function(data) {
      callback(null, {
        title: data.title,
        description: data.description,
        items: data.items,
      });
    })
    .catch(function(error) {
      console.error("Error fetching RSS feed:", error);
      callback(error, null);
    });
};

// // Test function for RSS parser
// // Example usage with BBC News RSS feed
// function testRssParser() {
//   // Test with BBC News feed URL
//   const testUrl = "https://feeds.bbci.co.uk/news/rss.xml";

//   fetchRssFeed(testUrl, function(error, feedData) {
//     if (error) {
//       console.error("Test failed:", error);
//       return;
//     }
//     // Log successful test results
//     console.log("Test successful:");
//     console.log("- RSS Feed Title:", feedData.title);
//     console.log("- RSS Feed Description:", feedData.description);
//     console.log("- First Article:", feedData.items[0]);
//   });
// }

// // Run the test
// testRssParser();
