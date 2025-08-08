## Next steps roadmap (saved 2025-08-08)

This file captures the prioritized tasks to continue from in the morning.

### Immediate next (morning)
- Tighten exchange chip spacing: code→value gap 4px → 2–3px and lock the value.
- Finalize sparkline stroke width around 0.9–1.0; keep 2px right end pad and rounded caps.

### Frontend (satinalma)
- RBAC route protection: enforce `PermissionGuard` on pages/routes; wire allowed routes via permissions.
- Password change flow: hook `PasswordChangeScreen` to backend endpoint; add client-side validation and success/error toasts.
- Dashboard data wiring: connect `DashboardStats` and `RecentActivity` to new API endpoints; add loading skeletons.
- Error/UX consistency: unify axios interceptors for global toasts and retry/backoff; ensure 429 doesn’t logout.
- Tests: unit tests for utils; integration tests for auth/exchange; light E2E for login and dashboard smoke.
- Performance: code-splitting for heavy routes; icon tree-shaking.
- Quality: ESLint/Prettier rules, Husky pre-commit; README updates as features land.

Notes
- Current chip layout decisions: label pl/pr = 2px, code→value = 4px (to be reduced), sparkline right offset = 2px, overflow hidden, rounded caps.
