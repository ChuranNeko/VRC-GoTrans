# VRC-GoTrans

**[简体中文](README.zh-CN.md) | [English](README.md) | [日本語](README.ja.md) | [한국어](README.ko.md)**

---

<div align="center">
  <img src="public/logo.svg" width="128" height="128" alt="VRC-GoTrans Logo">
  <h3>VRChat 向けリアルタイム翻訳アシスタント</h3>
  <p>即時翻訳で、バーチャルリアリティの言語の壁を打ち破る</p>
</div>

---

## ✨ 主な機能

- 🌐 **多言語翻訳** —— Tencent HY-MT1.5（オフライン、38 言語）またはオンライン API を利用
- 💬 **VRChat 連携** —— OSC 経由で翻訳をゲーム内チャットボックスへ送信
- 🔒 **プライバシー重視** —— ローカル翻訳は 100% オフライン、データは端末外に出ません
- ⚡ **低遅延** —— CPU で 1 件あたり 0.3〜0.5 秒（モデル読み込み約 1.5 秒）
- 🎨 **モダンな UI** —— React + Radix UI によるシンプルで使いやすいインターフェース
- 🌍 **多言語 UI** —— 简体中文 / English / 日本語 / 한국어
- 🚧 **音声認識** —— faster-whisper 統合は開発中

## 🚀 クイックスタート

### 動作環境

- Windows 10/11（macOS/Linux は対応予定）
- 4GB 以上の RAM
- モデル用に約 2GB のディスク容量

### インストール

**方法 1：リリース版をダウンロード（推奨）**

[Releases](https://github.com/ChuranNeko/VRC-GoTrans/releases) から最新のインストーラーをダウンロードしてください。

**方法 2：ソースからビルド**

```bash
git clone https://github.com/ChuranNeko/VRC-GoTrans.git
cd VRC-GoTrans
pnpm install
pnpm tauri dev      # 開発モード
pnpm tauri build    # 本番ビルド
```

### 初回起動

1. UI 言語を選択
2. HY-MT モデルファイルを指定 —— `~/.vrc-gotrans/models/` に移動されます
3. OSC 設定を構成（デフォルトポート：9000）
4. 完了！VRChat で翻訳を始めましょう

> Python サイドカー（翻訳エンジン）は初回起動時に `uv` で自動セットアップされ、設定可能なミラー経由で Python 3.11 + 依存関係をダウンロードします。

## 📖 仕組み

```
テキスト入力（音声認識 faster-whisper —— 開発中）
    ↓
HY-MT1.5 / オンライン API（テキスト → 翻訳）   Python サイドカー経由
    ↓
OSC（rosc、Rust）→ VRChat チャットボックス
```

## 🛠️ 技術スタック

**フロントエンド**
- React 19 + TypeScript
- Radix UI Themes + Vite
- i18next（UI：zh-Hans / en / ja / ko）

**シェル**
- Tauri 2（Rust）
- rosc（OSC プロトコル）
- Tokio（非同期ランタイム）

**AI サイドカー**（Python、uv 管理、3.11 に固定）
- llama-cpp-python —— HY-MT GGUF を読み込みローカル翻訳
- faster-whisper —— 音声認識（開発中）

**AI モデル**
- 翻訳：[Tencent HY-MT1.5-1.8B](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF)（Q4_K_M、約 1.1GB GGUF）
- 音声認識：OpenAI Whisper（開発中）

## 🌍 対応言語

翻訳は 38 言語に対応、以下を含みます：
English、简体中文、繁體中文、日本語、한국어、粵語、Français、Deutsch、Español、Português、Italiano、Русский、Українська、العربية、हिन्दी、ไทย、Tiếng Việt、Bahasa Indonesia……その他多数。

## 📋 設定

すべてのデータは `~/.vrc-gotrans/` に集約（Windows/macOS/Linux 共通）：
- `config.json` —— 設定
- `models/` —— GGUF モデルファイル
- `logs/` —— アプリケーションログ
- `cache/` —— ランタイムキャッシュ

## 🤝 コントリビュート

コントリビュートを歓迎します！Fork → 機能ブランチ → PR。

### 翻訳への貢献

UI をより多くの言語へ翻訳する手助けをしてください！翻訳ファイルは `src/locales/` にあります。locale 構造は `zh-Hans.ts` から派生（`TranslationShape`）しており、キー不足は TypeScript ビルドで即座に検出されます。

## 📝 ライセンス

Copyright (C) 2026 ChuranNeko. 本プロジェクトは [GNU AGPL-3.0-or-later](LICENSE) の下で公開されています。

## 🙏 謝辞

- [Tencent HY-MT1.5](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF) —— 翻訳モデル
- [VRChat OSC](https://docs.vrchat.com/docs/osc-overview)
- [llama.cpp](https://github.com/ggerganov/llama.cpp) —— モデル推論
- [Tauri](https://tauri.app/) —— デスクトップアプリフレームワーク
- [uv](https://docs.astral.sh/uv/) —— Python パッケージマネージャー

## 📧 連絡先

- 作者：ChuranNeko
- メール：churanneko@outlook.com
- 問題報告：[GitHub Issues](https://github.com/ChuranNeko/VRC-GoTrans/issues)

---

<div align="center">
  VRChat コミュニティのために ❤️ を込めて
</div>
