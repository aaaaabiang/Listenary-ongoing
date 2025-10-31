import { DictionaryAPI } from "../api/dictionaryAPI";

type DictionaryResult = any;

type DictionarySuccess = {
  success: true;
  data: DictionaryResult;
};

type DictionaryFailure = {
  success: false;
  error: string;
};

export async function lookupWord(
  word: string
): Promise<DictionarySuccess | DictionaryFailure> {
  try {
    const result = await DictionaryAPI.getWord(word);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Dictionary lookup failed:", error);
    return { success: false, error: error?.message || "Lookup failed" };
  }
}

export const dictionaryService = {
  lookupWord,
};
