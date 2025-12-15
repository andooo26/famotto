import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
// import fetch from "node-fetch";

import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import nodemailer from "nodemailer";
// import * as admin from "firebase-admin";  
// if (!admin.apps.length) {
//   admin.initializeApp();
// }

// initializeApp();
const app = initializeApp();

// const db = admin.firestore();
const db = getFirestore(app);
const auth = getAuth(app);

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
役割:
あなたは家族の会話を優しく促す「今日のお題」メーカーです。

目的:
家族が自然に会話を始めたくなる、1文の質問形式のお題を毎回ユニークに生成します。

出力ルール:

日本語で出力すること

1文の質問形式

優しい・ポジティブ・安心できるトーン

テーマは毎回変える（季節、日常、感情、思い出、趣味、家族イベント、食べ物、自然、写真向けなど）

固定文言や定型パターンを避け、毎回少し違う角度の質問にする

写真や動画を添付しやすい内容も混ぜてよい

出力はお題のみ（例：「今日の空をひと言で表すなら？」）

生成のポイント:

「思い出」「未来」「感情」「今日の出来事」「見つけたもの」「小さな発見」などの観点をランダムに組み合わせる

季節性（例：梅雨、春の陽気、冬の寒さ、夏の音）を適度に織り交ぜる

抽象と具体をバランスよく

毎回違うテーマを選び、単調さを避ける

出力:
上記ルールに従って、家族が話しやすい「今日のお題」を1つ生成してください。
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






export const sendJoinRequestMail = onDocumentUpdated(
  "groups/{groupId}",
  async (event) => {

    console.log("functions開始")
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const beforeReq = before.joinRequests || {};
    const afterReq = after.joinRequests || {};


     // ✅ joinRequests 自体が変わってなければ即 return
    if (Object.keys(beforeReq).length === Object.keys(afterReq).length) {
      return;
    }

    // 新しく追加された uid を検出
    const addedUids = Object.keys(afterReq).filter(
      (uid) => !beforeReq[uid]
    );
    if (addedUids.length === 0) return;

    const requestUid = addedUids[0];

    // 🌟 ① users/{uid} からユーザーネーム取得
    // const userSnap = await admin
    //   .firestore()
    //   .collection("users")
    //   .doc(requestUid)
    //   .get();
    const userSnap = await db
      .collection("users")
      .doc(requestUid)
      .get();

    const userName =
      userSnap.exists ? userSnap.data()?.name ?? "不明なユーザー" : "不明なユーザー";

    // 管理者 uid（members[0]）
    const leaderUid = after.members?.[0];
    if (!leaderUid) return;

    // 管理者のメール取得
    // const leader = await admin.auth().getUser(leaderUid);
    const leader = await auth.getUser(leaderUid);
    const leaderEmail = leader.email;
    if (!leaderEmail) return;

    // メール送信設定
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_ACCOUNT,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const approveUrl =
      `localhost:3000/approve?groupId=${event.params.groupId}&uid=${requestUid}`;

    await transporter.sendMail({
      from: process.env.MAIL_ACCOUNT,
      to: leaderEmail,
      subject: "グループ参加申請が届いたよ",
      text: `
      ${userName} さんがグループ参加を希望しています！

      ▼ 承認はこちら
      ${approveUrl}`,
    });

    console.log("承認メール送信完了", {
      groupId: event.params.groupId,
      requestUid,
      userName,
    });
  }
);
