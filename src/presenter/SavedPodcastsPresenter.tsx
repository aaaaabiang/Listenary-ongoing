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
    // 导航到播客频道页面，而不是直接到播放页面
    // 因为 saved podcast 没有 audioUrl，需要先加载播客的 episodes
    navigate("/podcast-channel", { state: { rssUrl: podcast.rssUrl } });
  };

  return (
    <SavedPodcastsView 
      savedPodcasts={props.model.savedPodcasts} 
      onViewPodcast={handleViewPodcast}
    />
  );
});

export default SavedPodcastsPresenter;
