import { observer } from "mobx-react-lite";
import { SavedPodcastsView } from "../views/SavedPodcastsView";

var SavedPodcastsPresenter = observer(function SavedPodcastsPresenter(props) {
  return (
    <SavedPodcastsView savedPodcasts={props.model.savedPodcasts} />
  );
});

export default SavedPodcastsPresenter; 