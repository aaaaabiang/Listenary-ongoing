import {
  addPodcastToSaved as addPodcastToSavedApi,
  removePodcastFromSaved as removePodcastFromSavedApi,
} from "../api/userAPI";

type SavedPodcast = {
  title: string;
  rssUrl: string;
  coverImage?: string;
  description?: string;
};

type ServiceSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

type ServiceFailure = {
  success: false;
  error: string;
};

export async function addPodcastToSaved(
  podcast: SavedPodcast
): Promise<ServiceSuccess<any[]> | ServiceFailure> {
  try {
    const updatedPodcasts = await addPodcastToSavedApi(podcast);
    return {
      success: true,
      data: updatedPodcasts,
      message: "Podcast added to favorites",
    };
  } catch (error: any) {
    const errorMessage =
      error?.message || "Failed to add podcast, please try again";
    return { success: false, error: errorMessage };
  }
}

export async function removePodcastFromSaved(
  title: string
): Promise<ServiceSuccess<any[]> | ServiceFailure> {
  try {
    const updatedPodcasts = await removePodcastFromSavedApi(title);
    return {
      success: true,
      data: updatedPodcasts,
      message: "Podcast removed from favorites",
    };
  } catch (error: any) {
    const errorMessage =
      error?.message || "Failed to delete podcast, please try again";
    return { success: false, error: errorMessage };
  }
}

export const savedPodcastService = {
  addPodcastToSaved,
  removePodcastFromSaved,
};
