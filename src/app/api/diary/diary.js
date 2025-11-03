import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, "diary"));
    const diaries = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return new Response(JSON.stringify(diaries), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching diaries:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch diaries" }), {
      status: 500,
    });
  }
}
