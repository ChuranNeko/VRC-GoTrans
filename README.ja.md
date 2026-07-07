# VRC-GoTrans

**[简体中文](README.zh-CN.md) | [English](README.md) | [日本語](README.ja.md)**

---

<div align="center">
  <img src="src/assets/logo.svg" width="128" height="128" alt="VRC-GoTrans Logo">
  <h3>VRChat 向けリアルタイム翻訳アシスタント</h3>
  <p>即時の音声相互翻訳で、バーチャルリアリティの言語の壁を打ち破る</p>
</div>

---

## ✨ 主な機能

- 🎤 **音声認識** —— ローカル Whisper STT によるプライバシー保護型の音声認識
- 🌐 **多言語翻訳** —— Tencent HY-MT1.5（オフライン）またはオンライン API を利用
- 💬 **VRChat 連携** —— OSC 経由で翻訳をゲーム内チャットボックスへ直接送信
- 🔒 **プライバシー重視** —— すべての処理を 100% オフラインで実行可能、データは端末外に出ません
- ⚡ **低遅延** —— 最適化されたパイプラインでほぼリアルタイムの翻訳
- 🎨 **モダンな UI** —— React + Radix UI によるシンプルで使いやすいインターフェース

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
# リポジトリをクローン
git clone https://github.com/ChuranNeko/VRC-GoTrans.git
cd VRC-GoTrans

# 依存関係をインストール
pnpm install

# 開発モードで実行
pnpm tauri dev

# 本番用ビルド
pnpm tauri build
```

### 初回起動

1. 好みの UI 言語を選択
2. 翻訳エンジンを選択（オンライン API またはローカルモデル）
3. 音声認識エンジンを選択（オンラインまたはローカル Whisper）
4. OSC 設定を構成（デフォルトポート：9000）
5. 完了！VRChat で翻訳を始めましょう

## 📖 仕組み

```
マイク入力
    ↓
Whisper STT（音声 → テキスト）
    ↓
HY-MT1.5 / オンライン API（テキスト → 翻訳）
    ↓
OSC プロトコル → VRChat チャットボックス
```

## 🛠️ 技術スタック

**フロントエンド**
- React 19 + TypeScript 5.8
- Radix UI Themes 3.3
- Vite 8.1
- i18next（多言語対応）

**バックエンド**
- Tauri 2（Rust）
- llama.cpp（モデル推論）
- Tokio（非同期ランタイム）
- rosc（OSC プロトコル）

**AI モデル**
- 翻訳：[Tencent HY-MT1.5-1.8B](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF)（1.1GB GGUF）
- 音声認識：OpenAI Whisper（base モデル、約 150MB）

## 🌍 対応言語

翻訳は 33 以上の言語に対応、以下を含みます：
- English（英語）
- 中文（中国語）
- 日本語
- 한국어（韓国語）
- Français（フランス語）
- Deutsch（ドイツ語）
- Español（スペイン語）
- Русский（ロシア語）
- その他多数……

## 📋 設定

設定ファイルの場所：
- Windows：`%APPDATA%\VRC-GoTrans\config.json`
- macOS：`~/Library/Application Support/VRC-GoTrans/config.json`
- Linux：`~/.config/VRC-GoTrans/config.json`

## 🤝 コントリビュート

コントリビュートを歓迎します！まず[コントリビューションガイドライン](CONTRIBUTING.md)をお読みください。

### 開発の流れ

1. リポジトリを Fork
2. 機能ブランチを作成：`git checkout -b feat/your-feature`
3. 変更をコミット：`git commit -m "feat: add your feature"`
4. ブランチにプッシュ：`git push origin feat/your-feature`
5. Pull Request を作成

### 翻訳への貢献

UI をより多くの言語へ翻訳する手助けをしてください！翻訳ファイルは `src/locales/` にあります。

## 📝 ライセンス

本プロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🙏 謝辞

- [VRChat OSC ドキュメント](https://docs.vrchat.com/docs/osc-overview)
- [Tencent HY-MT1.5](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF) —— 翻訳モデル
- [OpenAI Whisper](https://github.com/openai/whisper) —— 音声認識
- [llama.cpp](https://github.com/ggerganov/llama.cpp) —— 高速モデル推論
- [Tauri](https://tauri.app/) —— デスクトップアプリフレームワーク

## 📧 連絡先

- 作者：ChuranNeko
- 問題報告：[GitHub Issues](https://github.com/ChuranNeko/VRC-GoTrans/issues)

---

<div align="center">
  VRChat コミュニティのために ❤️ を込めて
</div>
