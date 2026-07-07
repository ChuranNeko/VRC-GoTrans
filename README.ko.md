# VRC-GoTrans

**[简体中文](README.zh-CN.md) | [English](README.md) | [日本語](README.ja.md) | [한국어](README.ko.md)**

---

<div align="center">
  <img src="public/logo.svg" width="128" height="128" alt="VRC-GoTrans Logo">
  <h3>VRChat 실시간 번역 도우미</h3>
  <p>즉시 번역으로 가상 현실의 언어 장벽을 허물다</p>
</div>

---

## ✨ 주요 기능

- 🌐 **다국어 번역** —— Tencent HY-MT1.5 오프라인 구동, 38개 언어 지원; 온라인 API 연동 가능
- 💬 **VRChat 연동** —— OSC를 통해 번역 결과를 게임 내 채팅박스로 전송
- 🔒 **프라이버시 우선** —— 로컬 번역은 100% 오프라인, 데이터가 기기 밖으로 나가지 않습니다
- ⚡ **저지연** —— CPU 모드에서 건당 0.3~0.5초 (모델 로드 약 1.5초)
- 🎨 **모던 UI** —— React + Radix UI로 깔끔하고 사용하기 쉬운 인터페이스
- 🌍 **다국어 인터페이스** —— 简体中文 / English / 日本語 / 한국어
- 🚧 **음성 인식** —— faster-whisper 통합 개발 중

## 🚀 빠른 시작

### 요구 사항

- Windows 10/11 (macOS/Linux 지원 예정)
- RAM 4GB 이상
- 모델용 디스크 공간 약 2GB

### 설치

**방법 1: 릴리스 다운로드 (권장)**

[Releases](https://github.com/ChuranNeko/VRC-GoTrans/releases)에서 최신 설치 프로그램을 다운로드하세요.

**방법 2: 소스에서 빌드**

```bash
git clone https://github.com/ChuranNeko/VRC-GoTrans.git
cd VRC-GoTrans
pnpm install
pnpm tauri dev      # 개발 모드
pnpm tauri build    # 프로덕션 빌드
```

### 첫 실행

1. 인터페이스 언어 선택
2. HY-MT 모델 파일 위치 지정 —— `~/.vrc-gotrans/models/`로 이동됩니다
3. OSC 설정 (기본 포트: 9000)
4. 완료! VRChat에서 번역을 시작하세요

> Python 사이드카(번역 엔진)는 첫 실행 시 `uv`로 자동 설정되며, 구성 가능한 미러를 통해 Python 3.11 + 종속성을 다운로드합니다.

## 📖 작동 방식

```
텍스트 입력 (음성 인식 faster-whisper —— 개발 중)
    ↓
HY-MT1.5 / 온라인 API (텍스트 → 번역)   Python 사이드카 경유
    ↓
OSC (rosc, Rust) → VRChat 채팅박스
```

## 🛠️ 기술 스택

**프론트엔드**
- React 19 + TypeScript
- Radix UI Themes + Vite
- i18next (UI: zh-Hans / en / ja / ko)

**셸**
- Tauri 2 (Rust)
- rosc (OSC 프로토콜)
- Tokio (비동기 런타임)

**AI 사이드카** (Python, uv 관리, 3.11 고정)
- llama-cpp-python —— HY-MT GGUF를 로드하여 로컬 번역
- faster-whisper —— 음성 인식 (개발 중)

**AI 모델**
- 번역: [Tencent HY-MT1.5-1.8B](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF) (Q4_K_M, 약 1.1GB GGUF)
- 음성 인식: OpenAI Whisper (개발 중)

## 🌍 지원 언어

번역은 38개 언어를 지원합니다:
English, 简体中文, 繁體中文, 日本語, 한국어, 粵語, Français, Deutsch, Español, Português, Italiano, Русский, Українська, العربية, हिन्दी, ไทย, Tiếng Việt, Bahasa Indonesia… 그리고 더 많은 언어.

## 📋 설정

모든 데이터는 `~/.vrc-gotrans/` 하나에 있습니다 (Windows/macOS/Linux 공통):
- `config.json` —— 설정
- `models/` —— GGUF 모델 파일
- `logs/` —— 애플리케이션 로그
- `cache/` —— 런타임 캐시

## 🤝 기여

기여를 환영합니다! Fork → 기능 브랜치 → PR.

### 번역 기여

UI를 더 많은 언어로 번역하는 것을 도와주세요! 번역 파일은 `src/locales/`에 있습니다. locale 구조는 `zh-Hans.ts`에서 파생(`TranslationShape`)되며, 키가 누락되면 TypeScript 빌드가 실패하여 즉시 발견됩니다.

## 📝 라이선스

Copyright (C) 2026 ChuranNeko. 본 프로젝트는 [GNU AGPL-3.0-or-later](LICENSE) 라이선스로 배포됩니다.

## 🙏 감사의 말

- [Tencent HY-MT1.5](https://huggingface.co/tencent/HY-MT1.5-1.8B-GGUF) —— 번역 모델
- [VRChat OSC](https://docs.vrchat.com/docs/osc-overview)
- [llama.cpp](https://github.com/ggerganov/llama.cpp) —— 모델 추론
- [Tauri](https://tauri.app/) —— 데스크톱 앱 프레임워크
- [uv](https://docs.astral.sh/uv/) —— Python 패키지 관리자

## 📧 연락처

- 작성자: ChuranNeko
- 이메일: churanneko@outlook.com
- 문제 보고: [GitHub Issues](https://github.com/ChuranNeko/VRC-GoTrans/issues)

---

<div align="center">
  VRChat 커뮤니티를 위해 ❤️ 를 담아
</div>
