import { useEffect } from 'react';
import { RssModel } from '../rssModel';

//测试组件
export const RssPresenter = () => {
  useEffect(() => {
    function extractRssData() {
      const rssModel = new RssModel();
      
      rssModel.loadFeed('https://feeds.bbci.co.uk/news/rss.xml', (error, data) => {
        if (error) {
          console.error('RSS data extraction failed:', error);
          return;
        }
        
        // URLs仅在后台使用
        console.log('Backend URLs:', data.urls);
        
        // 文章信息将用于前端展示
        console.log('Frontend Articles Data:', data.articles);
        
        // 这里可以存储articles数据，供后续页面展示使用
      });
    }
    
    extractRssData();
  }, []);

  // 暂时返回空组件，稍后添加展示逻辑
  return <div>RSS Data Extractor</div>;
}
