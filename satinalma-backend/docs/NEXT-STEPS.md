## Backend next steps (saved 2025-08-08)

### API work
- RBAC schema and endpoints: roles, permissions, user-role, role-permission; add middleware checks on protected routes.
- Password change endpoint: `POST /api/users/change-password` with currentPassword, newPassword, validations, and audit log entry.
- Dashboard endpoints: minimal metrics for `DashboardStats` and a paged `RecentActivity` feed.

### Infrastructure & security
- Strengthen helmet & CORS policies; increase auth rate-limit; verify bcrypt salt rounds; consider JWT refresh/rotation.
- Optional cache persistence for exchange rates (file/SQLite/Redis) to survive restarts.

### Tests & ops
- Unit tests for controllers/services; integration tests for auth and exchange; seed scripts for roles/users.
- DevOps: .env.sample, Dockerfile, GitHub Actions (lint, test), PM2/Procfile.
