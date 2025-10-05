import { useEffect } from 'react';
import { RssModel } from '../rssModel';

type Props = { model: any }; // [fix]

//测试组件
export const RssPresenter = (props: Props) => {
  useEffect(() => {
    async function extractRssData() {
      try {
        const rssModel = new RssModel();
        //改成只传一个参数
        const { feed, items } = await rssModel.loadFeed("https://feeds.bbci.co.uk/news/rss.xml");

        // URLs仅在后台使用
        console.log("Backend feed info:", feed);

        // 文章信息将用于前端展示
        console.log("Frontend Articles Data:", items);

        // 这里可以存储 items 数据，供后续页面展示使用
      } catch (error) {
        console.error("RSS data extraction failed:", error);
      }
    }

    
    extractRssData();
  }, []);

  // 暂时返回空组件，稍后添加展示逻辑
  return <div>RSS Data Extractor</div>;
}
