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

  setData(feed: any, items: any[]) {
    this.feed = feed ?? null;
    this.items = Array.isArray(items) ? items : [];
    this.notifySubscribers();
  }

  getFeedInfo() {
    return this.feed;
  }

  getEpisodes() {
    return this.items;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  notifySubscribers() {
    this.subscribers.forEach((callback) => {
      callback(this);
    });
  }

  clear() {
    this.feed = null;
    this.items = [];
    this.notifySubscribers();
  }
}
