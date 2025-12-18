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
    schedule: "0 1 * * *",
    timeZone: "Asia/Tokyo",
    secrets: [GEMINI_API_KEY],
  },
  async () => {
    const now = new Date();
    const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const yyyymmdd = jstNow.toISOString().slice(0,10).replace(/-/g, "");

    const prompt = `
役割: あなたは家族の会話を促す「今日のお題」メーカーです。

目的: 家族間のコミュニケーションを増やすためのWebアプリにおける 
「今日のお題」機能として、投稿する話題に困ったときに使える、 家族が自然に会話を始めたくなるお題を生成します。

出力ルール: 
・日本語で出力すること 
・1文のみ ・質問形式で、文末は体言止めにして「？」で終える（例：〜場面は？） 
・写真や動画を添付しやすい内容にする 
・テーマは毎回変える（季節／小さな出来事／感情／思い出／趣味／家族イベント／食べ物／自然 など） 
・出力はお題のみ（前置きや説明文は不要） 生成のポイント: 
・「思い出」「今日の出来事」「見つけたもの」「小さな発見」などの観点をランダムに組み合わせる 
・毎回異なる観点・テーマを選び、単調さを避ける 
・写真や動画投稿が前提のため、「写真に残した」「動画に撮った」などの直接的な表現は使わない 

出力: 上記ルールに従って、家族が話しやすい「今日のお題」を1つ生成してください。 ;
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

      const nextDay = new Date(jstNow.getTime() + 24 * 60 * 60 * 1000);
      const yyyymmddPlusOne = nextDay.toISOString().slice(0, 10).replace(/-/g, "");
      await db.collection("todays-theme").doc(yyyymmddPlusOne).set({
        text,
        createdAt: now,
      });

      console.log("お題生成完了:", text);
    } catch (err) {
      console.error("エラーが発生:", err);
    }
  }
);
