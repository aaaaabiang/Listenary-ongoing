import { observer } from "mobx-react-lite";
import { SavedPodcastsView } from "../views/SavedPodcastsView";

// 新增：给 props 一个最小类型 
type Props = { model: any };   

var SavedPodcastsPresenter = observer(function SavedPodcastsPresenter(
  props: Props                            
) {
  return (
    <SavedPodcastsView savedPodcasts={props.model.savedPodcasts} />
  );
});

export default SavedPodcastsPresenter; 