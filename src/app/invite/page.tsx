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

        if (!newGroupId) return;

        try {
            // == users/{uid} を取得 ==========================
            const userDoc = await firestoreUtils.getDocument("users", uid);
            if (!userDoc) {
            alert("ユーザーが存在しません");
            return;
            }

            const oldGroupId = userDoc.groupId;

            // == oldGroupId の脱退 ==========================
            if (oldGroupId && oldGroupId !== newGroupId) {
            const oldGroup = await firestoreUtils.getDocument("groups", oldGroupId);

            if (oldGroup) {
                // Set を使って確実に削除
                const setMembers = new Set(oldGroup.members || []);
                setMembers.delete(uid);

                const updatedMembers = Array.from(setMembers);

                if (updatedMembers.length === 0) {
                // メンバーゼロ → グループ削除
                await firestoreUtils.deleteDocument("groups", oldGroupId);
                console.log(`グループ ${oldGroupId} を削除しました（0人）`);
                } else {
                // メンバー更新のみ
                await firestoreUtils.updateDocument("groups", oldGroupId, {
                    members: updatedMembers,
                });
                }
            }
            }

            // == newGroupId の参加 ==========================
            const newGroup = await firestoreUtils.getDocument("groups", newGroupId);
            if (!newGroup) {
            alert("参加先のグループが存在しません");
            return;
            }

            // Set を使って重複なく追加
            const newSet = new Set(newGroup.members || []);
            newSet.add(uid);

            await firestoreUtils.updateDocument("groups", newGroupId, {
            members: Array.from(newSet),
            });

            // == user の groupId を更新 =====================
            await firestoreUtils.updateDocument("users", uid, {
            groupId: newGroupId,
            updatedAt: new Date(),
            });

            alert("グループに参加しました！");
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