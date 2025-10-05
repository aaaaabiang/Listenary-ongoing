import { observer } from "mobx-react-lite";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { HomePagePresenter } from "./presenter/HomePagePresenter";
// import { Transcription } from "./presenter/TranscrptionPresenter";
import { WordlistPresenter } from "./presenter/WordlistPresenter";
import PodcastChannelPresenter from "./presenter/PodcastChannelPresenter";
import PodcastPlayPresenter from "./presenter/PodcastPlayPresenter";
import LoginPresenter from "./presenter/loginPagePresenter.jsx";
import { RssPresenter } from "./presenter/rssPresenter";
import TestPresenter from "./test/TestPresenter";
import SavedPodcastsPresenter from "./presenter/SavedPodcastsPresenter";

type Props = { model: any };   

const ReactRoot = observer(function ReactRoot(props: Props) { // [fix]
  return (
    <RouterProvider router={makeRouter(props.model)} />
    /*RouterProvider comes from react-router-dom*/
  );
});

export { ReactRoot };

export function makeRouter(ReactiveModel: any) { // [fix]
  return createHashRouter([
    {
      path: "/",
      element: <HomePagePresenter model={ReactiveModel} />,
    },
    {
      path: "/wordlist",
      element: <WordlistPresenter model={ReactiveModel} />,
    },
    // {
    //   path: "/Transcription",
    //   element: <Transcription model={ReactiveModel} />,
    // },
    {
      path: "/login",
      element: <LoginPresenter model={ReactiveModel} />,
    },
    {
      path: "/podcast-channel",
      element: <PodcastChannelPresenter model={ReactiveModel} />,
    },
    {
      path: "/podcast-play",
      element: <PodcastPlayPresenter model={ReactiveModel} />,
    },
    {
      path: "/rss-test",
      element: <RssPresenter model={ReactiveModel} />, // ✅ 添加这一行参数
    },
    {
      path: "/test",
      element: <TestPresenter />,
    },
    {
      path: "/saved-podcasts",
      element: <SavedPodcastsPresenter model={ReactiveModel} />,
    },
  ]);
}
