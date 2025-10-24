import { observer } from "mobx-react-lite";
import { createHashRouter, RouterProvider } from "react-router-dom";
import React, { Suspense, lazy, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
  // 全局错误过滤器 - 静默处理COOP错误
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('Cross-Origin-Opener-Policy')) {
        // 静默处理COOP错误，不显示在控制台
        return;
      }
      originalError.apply(console, args);
    };
    
    // 清理函数
    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <AuthProvider>
      <Suspense fallback={null}>   {/* ← 不再显示 loading 提示 */}
        <RouterProvider router={makeRouter(props.model)} />
      </Suspense>
    </AuthProvider>
  );
});

export { ReactRoot };

export function makeRouter(ReactiveModel: any) { // [fix]
  return createHashRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <HomePagePresenter model={ReactiveModel} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/search",
      element: (
        <ProtectedRoute>
          <PodcastSearchPresenter model={ReactiveModel} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/wordlist",
      element: (
        <ProtectedRoute>
          <WordlistPresenter model={ReactiveModel} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/login",
      element: <LoginPresenter model={ReactiveModel} />,
    },
    {
      path: "/podcast-channel",
      element: (
        <ProtectedRoute>
          <PodcastChannelPresenter model={ReactiveModel} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/podcast-play",
      element: (
        <ProtectedRoute>
          <PodcastPlayPresenter model={ReactiveModel} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/test",
      element: <TestPresenter />,
    },
    {
      path: "/saved-podcasts",
      element: (
        <ProtectedRoute>
          <SavedPodcastsPresenter model={ReactiveModel} />
        </ProtectedRoute>
      ),
    },
  ]);
}
