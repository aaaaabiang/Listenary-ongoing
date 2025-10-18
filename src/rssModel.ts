// RSS 解析改为使用本地后端 API
import { apiRequest } from './config/apiConfig';

// function formatDuration(duration) {
//   if (!duration) return "Unknown";

//   if (typeof duration === "number") {
//     const m = Math.floor(duration / 60);
//     const s = duration % 60;
//     return `${m}:${s.toString().padStart(2, "0")}`;
//   }

//   if (typeof duration === "string") {
//     if (/^\d+$/.test(duration)) {
//       // Pure number of seconds
//       return formatDuration(Number(duration));
//     }
//     if (
//       /^\d{1,2}:\d{2}$/.test(duration) ||
//       /^\d{1,2}:\d{2}:\d{2}$/.test(duration)
//     ) {
//       // Already in standard format
//       return duration;
//     }
//   }

//   return "Unknown";
// }

export class RssModel {
  
  // [fix] 明确声明成员字段类型
  feed: any = null;
  items: any[] = [];
  subscribers: Array<(model: RssModel) => void> = [];

  constructor() {
    this.feed = null;
    this.items = [];
    this.subscribers = [];
    // this.parser = new Parser({
    //   customFields: {
    //     feed: ["image", "language", "copyright"],
    //     item: [
    //       "itunes:duration",
    //       "itunes:image",
    //       "itunes:episode",
    //       "itunes:season",
    //       "itunes:summary",
    //       "enclosure",
    //     ],
    //   },
    // });
  }

  async loadFeed(url) {
    try {
      // 调用本地后端 RSS API
      const response = await apiRequest(
        `/api/rss/fetch?url=${encodeURIComponent(url)}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.status}`);
      }
      const data = await response.json();

      // 后端返回 { feedMeta, items }，映射为前端需要的格式
      this.feed = data.feedMeta || data.feed;
      this.items = data.items || [];

      // this.feed = {
      //   title: data.title,
      //   description: data.description,
      //   image: data.image,
      //   link: data.link,
      // };

      // this.items = data.items.map(function(item) {
      //   return {
      //     title: item.title,
      //     description: item.contentSnippet || item.description,
      //     pubDate: item.pubDate || item.isoDate,
      //     // duration: item.itunes?.duration, // Duration cannot be displayed
      //     duration: formatDuration(item.itunes?.duration),
      //     episode: item.itunes?.episode,
      //     season: item.itunes?.season,
      //     image: item.itunes?.image || data.image,
      //     guid: item.guid,
      //     link: item.link,
      //     enclosure: item.enclosure,
      //   };
      // });

      this.notifySubscribers();

      // 返回统一的格式给上层调用者
      return { 
        feed: this.feed,   // 已经从 feedMeta 映射过了
        items: this.items 
      };
    } catch (error) {
      console.error("Error loading RSS feed:", error);
      throw error;
    }
  }

  getFeedInfo() {
    return this.feed;
  }

  getEpisodes() {
    return this.items;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return function () {
      this.subscribers = this.subscribers.filter(function (cb) {
        return cb !== callback;
      });
    };
  }

  notifySubscribers() {
    this.subscribers.forEach(function (callback) {
      callback(this);
    });
  }
}
