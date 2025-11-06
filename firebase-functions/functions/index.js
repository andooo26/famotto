import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch";

initializeApp();

// シークレットなど定義
const db = getFirestore();
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

// 0時に定期実行
export const generateTodaysTheme = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "Asia/Tokyo",
    secrets: [GEMINI_API_KEY],
  },
  async () => {
    const now = new Date();
    const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "");

    const prompt = `
あなたは家族の会話を促す「今日のお題」生成をすることが目的です。
目的: 家族が会話を始めやすくなる1文の質問を作ること。

出力ルール:
- 出力は1文の質問形式
- 優しい・ポジティブな内容
- 難しい言葉やネガティブな話題を避ける
- 季節や日常、感情をテーマにする
- 写真や動画を添付できるようなお題だとなお良い
- 出力形式: 「今日のお題はxxxxxx？」

今日(${yyyymmdd})にふさわしいお題を1つ作ってください。
`;

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
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

      console.log("お題生成完了");
    } catch (err) {
      console.error("お題生成中にエラーが発生:", err);
    }
  }
);
