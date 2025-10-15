import { auth } from '../firebaseApp';

export async function getIdTokenSafe(): Promise<string> {
  await new Promise<void>((resolve) => {
    const unsub = auth.onAuthStateChanged(() => { unsub(); resolve(); });
  });
  const user = auth.currentUser;
  if (!user) return '';
  try { return await user.getIdToken(false); } catch { return ''; }
}