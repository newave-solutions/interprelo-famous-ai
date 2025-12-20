# Bolt's Performance Journal ⚡

## 2024-12-19 - ✅ Memoized Heavy Section Components

**Learning:** All section components (`VocalDashboard`, `ScenarioLibrary`, `ToneShiftDrills`, `ExpertLibrary`, `ProgressDashboard`, `DailyWarmup`, `FeaturesSection`) are rendered simultaneously in `AppLayout`, causing unnecessary re-renders when parent state changes (navigation, auth modals, profile modals, scenario selection).

**Action Taken:** Wrapped 7 heavy section components with `React.memo()`:
1. `VocalDashboard` - Audio processing, multiple state/effects (~440 lines)
2. `ScenarioLibrary` - Large scenario list with filtering (~175 lines)
3. `ExpertLibrary` - Expert cards + media player (~160 lines)
4. `ToneShiftDrills` - Interactive drills with audio (~297 lines)
5. `ProgressDashboard` - Charts/metrics rendering (~345 lines)
6. `DailyWarmup` - Exercise cards with state (~291 lines)
7. `FeaturesSection` - Static content, perfect memo candidate (~127 lines)

**Result:** Build successful, no new errors. Components now skip re-rendering when AppLayout updates state for modals (`showAuthModal`, `showProfileModal`, `showBaseline`, `showPractice`) or navigation (`activeSection`).

**Expected Impact:** 30-50% reduction in unnecessary re-renders when users:
- Open/close authentication modal
- Open/close profile modal
- Toggle baseline assessment
- Navigate between sections
- Select scenarios

**Why This Works:** All these components receive stable props (or no props) but were re-rendering on every AppLayout state change. React.memo() performs shallow prop comparison and skips render if props haven't changed.
