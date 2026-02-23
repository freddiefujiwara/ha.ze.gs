# ha.ze.gs

Vue 3 + Vite ベースのホームコントロール UI です。最終成果物は `vite-plugin-singlefile` により、インライン化された単一ファイル `dist/index.html` として出力されます。

## 技術スタック
- Framework: Vue 3 (Composition API)
- Build Tool: Vite
- Single-file build: `vite-plugin-singlefile`
- Test Tool: Vitest (`jsdom`)
- Language: JavaScript (TypeScript 不使用)

## プロジェクト構成
- `index.html`: Vite エントリ（`#app` に Vue をマウント）
- `src/main.js`: Vue アプリ起動とスタイル読み込み
- `src/App.vue`: UI テンプレート
- `src/*.js`: 既存ロジックモジュール（API 呼び出し、ステータス反映、URL 生成など）
- `src/styles.css`: スタイル
- `vite.config.js`: Vue + single-file 出力設定
- `tests/*.test.js`: Vitest テスト

## 開発
```bash
npm install
npm run dev
```

## テスト
```bash
npm test
```

## ビルド（シングルファイル）
```bash
npm run build
```

出力:
- `dist/index.html`（CSS/JS がインライン化された単一ファイル）

## 既存コードを移植する手順（ガイド）
1. `src/index.html` の UI マークアップを `src/App.vue` の `<template>` へ移動する。
2. DOM 依存ロジック（`src/app.js` / `src/logic.js`）はそのまま ES Modules として維持し、Vue の `onMounted` で起動する。
3. 旧ビルドスクリプト（`build.js`）依存を外し、`vite build` に統一する。
4. 既存テストが DOM 構造に依存する場合、ID 属性や `data-*` 属性を維持して互換性を確保する。

## 移行時の注意点
- **アセット参照**: 単一ファイル化時は、外部ファイル参照（`<img src="...">` 等）が残ると完全な 1 ファイルにならないため、必要に応じて Data URL 化またはインライン化を行う。
- **動的 import**: single-file 化との相性が悪いケースがあるため、分割前提の実装は避ける。
- **外部通信**: API エンドポイントや YouTube など外部 URL は当然インライン化されないため、実行環境から到達可能であることを確認する。
- **初期化タイミング**: Vue マウント後に DOM 参照ロジックを起動する（`onMounted`）。

## Deploy
CI では `npm test` と `npm run build` を実行し、`dist/` を配信対象にします。
