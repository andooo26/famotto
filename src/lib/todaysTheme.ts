import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getTodaysTheme() {
  const now = new Date();
  const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "");

  const ref = doc(db, "todays-theme", yyyymmdd);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data();
  } else {
    return { text: "error", createdAt: null };
  }
}
