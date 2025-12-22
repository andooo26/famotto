"use client";
import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firestoreUtils } from "@/lib/firebaseUtils";
import { useRouter } from "next/navigation";

export default function InvitePage() {
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                alert("ログインしていません");
                router.push("/login");
                return;
            }

            const uid = user.uid;
            const newGroupId = new URLSearchParams(window.location.search).get("id");

            if (!newGroupId) {
                alert("groupId がありません");
                return;
            }

            try {
                // === グループ情報を取得 ==========
                const groupDoc = await firestoreUtils.getDocument("groups", newGroupId) as { id: string; joinRequests?: Record<string, any>; [key: string]: any } | null;
                if (!groupDoc) {
                    alert("グループが存在しません");
                    return;
                }

                // === joinRequests にフィールド追加 ==========
                const joinRequests = groupDoc.joinRequests || {};

                joinRequests[uid] = {
                    uid,
                    requestedAt: new Date(),
                };

                await firestoreUtils.updateDocument("groups", newGroupId, {
                    joinRequests,
                });

                alert("参加申請を送りました！リーダーの承認をお待ちください。");
                router.push("/");
            } catch (err) {
                console.error(err);
                alert("エラーが発生しました");
            }
        });

        return () => unsubscribe();
    }, []);

    return <div className="text-4xl">Now Loading...</div>;
}