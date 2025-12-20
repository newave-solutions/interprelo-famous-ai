# Palette's Journal 🎨

Critical UX and accessibility learnings for Interprelo Famous AI.

---

## 2024-12-19 - Icon-Only Buttons Missing ARIA Labels

**Learning:** The AIScenarioPractice component has multiple icon-only buttons (Microphone toggle, Send message, Reset scenario) without aria-label attributes. Screen reader users cannot determine button purpose without text labels.

**Action:** Add descriptive aria-label to all icon-only buttons. For stateful buttons (mic on/off), include current state in label. Always include loading state descriptions for async operations.

**Pattern Found:** This app uses many icon-only buttons across sections - systematic review needed for accessibility compliance.

---
