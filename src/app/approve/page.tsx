"use client";
import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firestoreUtils } from "@/lib/firebaseUtils";
import { useRouter } from "next/navigation";

export default function ApprovePage() {
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        const unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) {
            alert("ログインしてください");
            router.push("/login");
            return;
        }

        const leaderUid = user.uid;
        const params = new URLSearchParams(window.location.search);
        const groupId = params.get("groupId");
        const requestUid = params.get("uid");

        if (!groupId || !requestUid) {
            alert("URLが不正です");
            router.push("/");
            return;
        }

        try {
            //グループ取得
            const group = await firestoreUtils.getDocument("groups", groupId);
            if (!group) {
                alert("グループが存在しません");
                router.push("/");
                return;
            }
            
            //管理者チェック
            if (group.members?.[0] !== leaderUid) {
                alert("権限がありません");
                router.push("/");
                return;
            }

            //申請ユーザー取得が存在するか
            const userDoc = await firestoreUtils.getDocument("users", requestUid);
            if (!userDoc) {
                alert("ユーザーが存在しません");
                router.push("/");
                return;
            }

            //参加申請が存在するか
            const joinRequests = await firestoreUtils.getDocument("joinrequests", requestUid);
            if (!joinRequests) {
                alert("参加申請が存在しません");
                router.push("/");
                return;
            }
        
            const oldGroupId = userDoc.groupId;

            //旧グループから削除
            if (oldGroupId && oldGroupId !== groupId) {
            const oldGroup = await firestoreUtils.getDocument("groups", oldGroupId);
                if (oldGroup) {
                    const set = new Set(oldGroup.members || []);
                    set.delete(requestUid);
                    const updatedMembers = Array.from(set);
                    if (updatedMembers.length === 0) {
                        await firestoreUtils.deleteDocument("groups", oldGroupId);
                    console.log("旧グループ削除:", oldGroupId);
                    } else {
                        await firestoreUtils.updateDocument("groups", oldGroupId, {
                            members: updatedMembers,
                        });
                    }
                }
            }

            //新グループに追加
            const newSet = new Set(group.members || []);
            newSet.add(requestUid);
            await firestoreUtils.updateDocument("groups", groupId, {
                members: Array.from(newSet),
                joinRequests: {},
            });

            //users/{uid}更新
            await firestoreUtils.updateDocument("users", requestUid, {
                groupId,
                updatedAt: new Date(),
            });
            alert("承認しました");
            router.push("/");
        } catch (e) {
            console.error(e);
            alert("エラーが発生しました");
        }
        });
        return () => unsub();
    }, []);
    return <div className="text-3xl">承認処理中です...</div>;
}
