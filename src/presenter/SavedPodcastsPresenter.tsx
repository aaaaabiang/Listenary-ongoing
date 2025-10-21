import { observer } from "mobx-react-lite";
import { SavedPodcastsView } from "../views/SavedPodcastsView";
import { useNavigate } from "react-router-dom";

// 新增：给 props 一个最小类型
type Props = { model: any };

const SavedPodcastsPresenter = observer(function SavedPodcastsPresenter(
  props: Props
) {
  const navigate = useNavigate();

  const handleViewPodcast = (podcast: any) => {
    // 设置当前播客信息到 model
    props.model.setCurrentEpisode(podcast);
    props.model.setAudioUrl(podcast.enclosure?.url || podcast.audioUrl);
    
    // 导航到播放页面
    navigate("/podcast-play");
  };

  return (
    <SavedPodcastsView 
      savedPodcasts={props.model.savedPodcasts} 
      onViewPodcast={handleViewPodcast}
    />
  );
});

export default SavedPodcastsPresenter;
