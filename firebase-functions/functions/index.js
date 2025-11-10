import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch";

initializeApp();

const db = getFirestore();
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

export const generateTodaysTheme = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "Asia/Tokyo",
    secrets: [GEMINI_API_KEY],
  },
  async () => {
    const now = new Date();
    const yyyymmdd = now.toISOString().slice(0,10).replace(/-/g, "");

    const prompt = `
あなたは家族の会話を促す「今日のお題」生成をすることが目的です。
目的: 家族が会話を始めやすくなる1文の質問を作ること。

出力ルール:
- 出力は必ず日本語でお願いします。
- また日本人に向けた文章やテーマを心がけてください。
- 出力は1文の質問形式
- 優しい・ポジティブな内容
- 難しい言葉やネガティブな話題を避ける
- 季節、日常、感情、思い出、食べ物、趣味、家族イベントなどをテーマにする
- 写真や動画を添付できるようなお題も歓迎
- 出力形式: 「今日のお題はxxxxxx？」

出力のトーン例:
- 季節を感じる（例: 「今日のお題は、秋の味覚といえば何？」）
- 思い出を語る（例: 「今日のお題は、子どもの頃の好きだった遊びは？」）
- 感情を共有する（例: 「今日のお題は、最近うれしかったことは？」）
- 家族でワイワイ（例: 「今日のお題は、一緒に行きたい場所はどこ？」）
- 写真に合う（例: 「今日のお題は、今見つけた小さな幸せを写真で撮るとしたら？」）

今日(${yyyymmdd})にふさわしいお題を1つ作ってください。
`;

    try {
      const modelId = "gemini-2.5-flash-lite";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY.value(),
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
        "今日のお題はxxxxxxx";

      await db.collection("todays-theme").doc(yyyymmdd).set({
        text,
        createdAt: now,
      });

      console.log("お題生成完了:", text);
    } catch (err) {
      console.error("エラーが発生:", err);
    }
  }
);
