import { observer } from "mobx-react-lite";
import { createHashRouter, RouterProvider } from "react-router-dom";
import React, { Suspense, lazy } from "react";
// import { HomePagePresenter } from "./presenter/HomePagePresenter";
// // import { Transcription } from "./presenter/TranscrptionPresenter";
// import { WordlistPresenter } from "./presenter/WordlistPresenter";
// import PodcastChannelPresenter from "./presenter/PodcastChannelPresenter";
// import PodcastPlayPresenter from "./presenter/PodcastPlayPresenter";
import LoginPresenter from "./presenter/loginPagePresenter";
// import { RssPresenter } from "./presenter/rssPresenter"; // 测试组件，已移除
// import TestPresenter from "./test/TestPresenter";
// import SavedPodcastsPresenter from "./presenter/SavedPodcastsPresenter";
// import { PodcastSearchPresenter } from "./presenter/PodcastSearchPresenter";
const HomePagePresenter = lazy(() => import("./presenter/HomePagePresenter"));
const PodcastSearchPresenter = lazy(() => import("./presenter/PodcastSearchPresenter"));
const WordlistPresenter = lazy(() => import("./presenter/WordlistPresenter"));
const PodcastChannelPresenter = lazy(() => import("./presenter/PodcastChannelPresenter"));
const PodcastPlayPresenter = lazy(() => import("./presenter/PodcastPlayPresenter"));
// const LoginPresenter = lazy(() => import("./presenter/loginPagePresenter"));
// const RssPresenter = lazy(() => import("./presenter/rssPresenter")); // 测试组件，已移除
const TestPresenter = lazy(() => import("./test/TestPresenter"));
const SavedPodcastsPresenter = lazy(() => import("./presenter/SavedPodcastsPresenter"));


type Props = { model: any };   

// const ReactRoot = observer(function ReactRoot(props: Props) {
//   return (
//     <RouterProvider router={makeRouter(props.model)} />
//     /*RouterProvider comes from react-router-dom*/
//   );
// });

const ReactRoot = observer((props: { model: any }) => {
  return (
    <Suspense fallback={null}>   {/* ← 不再显示 loading 提示 */}
      <RouterProvider router={makeRouter(props.model)} />
    </Suspense>
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
      path: "/search",
      element: <PodcastSearchPresenter model={ReactiveModel} />,
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
    // {
    //   path: "/rss-test",
    //   element: <RssPresenter model={ReactiveModel} />, // 测试路由，已移除
    // },
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
