# Famotto

## アプリ概要
Famottoはファミリー(Familly)のコミュニケーションをもっと(motto)というコンセプトに開発されました。<br>
現代の社会問題である核家族化が進むに連れ親子孫の関係は薄れつつあり、コミュニケーションが少ないです。<br>
そんな問題を解決するWebアプリです。

## 使用技術
### フレームワーク他
- Next.js
- React
- TypeScript
- TailwindCSS

### 利用者認証
- Auth.js
- Firebase Authentication

### バックエンド
- Firebase Firestore Database
- Firebase Storage
- Firebase Functions

## 実行方法
### 開発サーバ
- 下記コマンドで開発サーバを立ち上げる
```
npm run dev
```
- localhost:3000で入ることができます(ポート3000以外は認証段階で弾かれます)

### 本番環境
- 本番環境はVercelにて公開されています(動作も可能)
[https://fam.and0.net](https://fam.and0.net)