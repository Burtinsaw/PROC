# Frontend Deployment (Vite + React)

## 1. Environment
Create `.env.production`:
```
VITE_APP_API_URL=https://api.example.com/api
VITE_APP_PUBLIC_URL=https://app.example.com
```

## 2. Build
```
npm ci
npm run build
```
Output in `dist/`.

## 3. Serve Options
1. Nginx + Static Files
```
root /var/www/satinalma-frontend/dist;
try_files $uri /index.html;
```
2. Node preview (not for real prod): `npm run preview`
3. Any static host (S3+CloudFront, Netlify, Vercel) – ensure SPA fallback to `index.html`.

## 4. Reverse Proxy (Sample)
If API is on api.example.com and frontend on app.example.com configure CORS backend accordingly.

## 5. Cache Busting
Vite handles hashing automatically.

## 6. Health Check Integration
Frontend pings backend `/api/health` implicitly in status components (if implemented). You can add a simple badge hitting that endpoint.

## 7. Updating
```
git pull
npm ci
npm run build
rsync -av dist/ /var/www/satinalma-frontend/dist/
```

## 8. Troubleshooting
| Issue | Cause | Fix |
| ----- | ----- | --- |
| 404 on refresh | Missing SPA fallback | Add `try_files $uri /index.html` |
| CORS errors | Origin not allowed | Update backend CORS origin list |
| Wrong API URL | Env mismatch | Rebuild after editing `.env.production` |

## 9. Security Tips
- Serve over HTTPS
- Set strict CSP headers (script-src self)
- Use secure cookies for auth tokens if later moved server-side

---
Baseline guide; adapt for Docker/K8s if containerizing.
