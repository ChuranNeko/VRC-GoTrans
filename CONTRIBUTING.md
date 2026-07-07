# 贡献指南

感谢你对 VRC-GoTrans 的关注！我们欢迎所有形式的贡献。

**[简体中文](#简体中文) | [English](#english) | [日本語](#日本語)**

---

## 简体中文

### 行为准则

参与本项目，请保持友善、尊重和包容。我们致力于为所有人提供一个安全、友好的协作环境。

### 如何贡献

#### 报告 Bug

1. 在 [Issues](https://github.com/ChuranNeko/VRC-GoTrans/issues) 页面搜索，确认问题尚未被报告
2. 创建新 Issue，提供：
   - 清晰的标题和描述
   - 复现步骤
   - 期望行为 vs 实际行为
   - 系统环境（操作系统、版本等）
   - 相关截图或日志

#### 建议新功能

1. 先在 [Issues](https://github.com/ChuranNeko/VRC-GoTrans/issues) 搜索是否已有类似建议
2. 创建新 Issue，说明：
   - 功能描述
   - 使用场景
   - 为什么需要这个功能

#### 提交代码

1. **Fork 仓库**
   ```bash
   gh repo fork ChuranNeko/VRC-GoTrans --clone
   cd VRC-GoTrans
   ```

2. **创建分支**
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **开发**
   - 遵循现有代码风格
   - 添加必要的注释
   - 为新功能编写测试
   - 确保所有测试通过：
     ```bash
     pnpm test
     cargo test
     ```

4. **提交**
   - 使用[约定式提交](https://www.conventionalcommits.org/zh-hans/)格式：
     ```
     feat(translator): 添加百度翻译 API 支持
     fix(osc): 修复连接超时问题
     docs(readme): 更新安装说明
     ```

5. **推送并创建 PR**
   ```bash
   git push origin feat/your-feature-name
   gh pr create --title "feat: 添加百度翻译支持" --body "详细说明..."
   ```

#### 贡献翻译

我们需要更多语言的 UI 翻译！

1. 复制 `src/locales/zh-CN/translation.json` 为新语言文件
2. 翻译所有字段（保持 key 不变）
3. 在 `src/i18n.ts` 中注册新语言
4. 提交 PR

### 开发环境搭建

**前端**
```bash
pnpm install
pnpm dev
```

**后端**
```bash
cd src-tauri
cargo build
cargo run
```

**完整应用**
```bash
pnpm tauri dev
```

### 代码规范

- **前端**：遵循 TypeScript + React 最佳实践
- **后端**：遵循 Rust 惯用写法，运行 `cargo fmt` 和 `cargo clippy`
- **提交消息**：使用约定式提交格式
- **文档**：代码注释用英文，用户文档用对应语言

### Pull Request 检查清单

- [ ] 代码通过编译，无警告
- [ ] 新功能有对应测试
- [ ] 所有测试通过
- [ ] 更新了相关文档
- [ ] 提交消息符合规范
- [ ] PR 描述清晰，说明了改动内容和原因

---

## English

### Code of Conduct

Be kind, respectful, and inclusive. We're committed to providing a safe and welcoming environment for everyone.

### How to Contribute

#### Reporting Bugs

1. Search [Issues](https://github.com/ChuranNeko/VRC-GoTrans/issues) to avoid duplicates
2. Create a new Issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - System environment (OS, version, etc.)
   - Screenshots or logs if applicable

#### Suggesting Features

1. Check [Issues](https://github.com/ChuranNeko/VRC-GoTrans/issues) for similar suggestions
2. Create a new Issue explaining:
   - Feature description
   - Use case
   - Why it's needed

#### Contributing Code

1. **Fork the repository**
   ```bash
   gh repo fork ChuranNeko/VRC-GoTrans --clone
   cd VRC-GoTrans
   ```

2. **Create a branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Develop**
   - Follow existing code style
   - Add necessary comments
   - Write tests for new features
   - Ensure all tests pass:
     ```bash
     pnpm test
     cargo test
     ```

4. **Commit**
   - Use [Conventional Commits](https://www.conventionalcommits.org/) format:
     ```
     feat(translator): add Baidu Translate API support
     fix(osc): fix connection timeout issue
     docs(readme): update installation guide
     ```

5. **Push and create PR**
   ```bash
   git push origin feat/your-feature-name
   gh pr create --title "feat: add Baidu Translate support" --body "Details..."
   ```

#### Translation Contributions

We need UI translations in more languages!

1. Copy `src/locales/en/translation.json` as a new language file
2. Translate all fields (keep keys unchanged)
3. Register the new language in `src/i18n.ts`
4. Submit a PR

### Development Setup

**Frontend**
```bash
pnpm install
pnpm dev
```

**Backend**
```bash
cd src-tauri
cargo build
cargo run
```

**Full App**
```bash
pnpm tauri dev
```

### Code Standards

- **Frontend**: Follow TypeScript + React best practices
- **Backend**: Follow Rust idioms, run `cargo fmt` and `cargo clippy`
- **Commit messages**: Use Conventional Commits format
- **Documentation**: Code comments in English, user docs in respective languages

### Pull Request Checklist

- [ ] Code compiles without warnings
- [ ] New features have corresponding tests
- [ ] All tests pass
- [ ] Relevant documentation updated
- [ ] Commit messages follow conventions
- [ ] PR description clearly explains changes and reasons

---

## 日本語

### 行動規範

親切に、敬意を持って、包括的に。すべての人に安全で歓迎される環境を提供することを目指しています。

### 貢献方法

#### バグ報告

1. [Issues](https://github.com/ChuranNeko/VRC-GoTrans/issues) で重複を確認
2. 新しい Issue を作成し、以下を含める：
   - 明確なタイトルと説明
   - 再現手順
   - 期待される動作 vs 実際の動作
   - システム環境（OS、バージョンなど）
   - スクリーンショットやログ

#### 機能提案

1. [Issues](https://github.com/ChuranNeko/VRC-GoTrans/issues) で類似提案を確認
2. 新しい Issue を作成し、説明：
   - 機能の説明
   - 使用ケース
   - なぜ必要か

#### コード貢献

1. **リポジトリをフォーク**
   ```bash
   gh repo fork ChuranNeko/VRC-GoTrans --clone
   cd VRC-GoTrans
   ```

2. **ブランチを作成**
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **開発**
   - 既存のコードスタイルに従う
   - 必要なコメントを追加
   - 新機能のテストを書く
   - すべてのテストが通過することを確認：
     ```bash
     pnpm test
     cargo test
     ```

4. **コミット**
   - [Conventional Commits](https://www.conventionalcommits.org/) 形式を使用：
     ```
     feat(translator): Baidu翻訳APIサポートを追加
     fix(osc): 接続タイムアウト問題を修正
     docs(readme): インストールガイドを更新
     ```

5. **プッシュしてPRを作成**
   ```bash
   git push origin feat/your-feature-name
   gh pr create --title "feat: Baidu翻訳サポートを追加" --body "詳細..."
   ```

#### 翻訳への貢献

より多くの言語でのUI翻訳が必要です！

1. `src/locales/ja/translation.json` を新しい言語ファイルとしてコピー
2. すべてのフィールドを翻訳（キーは変更しない）
3. `src/i18n.ts` で新しい言語を登録
4. PRを提出

### 開発環境セットアップ

**フロントエンド**
```bash
pnpm install
pnpm dev
```

**バックエンド**
```bash
cd src-tauri
cargo build
cargo run
```

**完全なアプリ**
```bash
pnpm tauri dev
```

### コード規約

- **フロントエンド**：TypeScript + React のベストプラクティスに従う
- **バックエンド**：Rust の慣用的な書き方に従い、`cargo fmt` と `cargo clippy` を実行
- **コミットメッセージ**：Conventional Commits 形式を使用
- **ドキュメント**：コードコメントは英語、ユーザードキュメントは各言語

### Pull Request チェックリスト

- [ ] コードが警告なしでコンパイルされる
- [ ] 新機能に対応するテストがある
- [ ] すべてのテストが通過する
- [ ] 関連ドキュメントが更新されている
- [ ] コミットメッセージが規約に従っている
- [ ] PR の説明が変更内容と理由を明確に説明している

---

## 感謝

你的贡献让 VRC-GoTrans 变得更好！  
Your contributions make VRC-GoTrans better!  
あなたの貢献が VRC-GoTrans をより良くします！

❤️
