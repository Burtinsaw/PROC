# AI Maestro – Copilot Süper Prompt

Tarih: 2025-08-17

Bu belgeyi Visual Studio Code, Copilot veya benzeri asistanlara tek parça halinde vererek, lokal ağırlıklı ajan mimarimizi adım adım uygulatmak için kullanın.

---

## Proje bağlamı ve hedef
- Workspace:
  - `e:\satinalma` (React/Vite frontend)
  - `e:\satinalma-backend` (Node/Express; dev’de SQLite, prod’da Postgres’e geçilecek)
- Amaç: ERP için “AI Maestro” üst katmanı eklemek
  1) Talep: Çok dilli serbest metinden ürün satırlarını JSON (brand, model, article_code, quantity, unit, description, lang, confidence) çıkar; ERP’ye taslak kaydet; UI’da kullanıcı onayı.
  2) Satınalma: Ürün+artikel+marka aramasıyla tedarikçi adayları (link/özet) öner; manuel kontrol listesi.
  3) Finans: Excel → standart raporlar (Python mikroservis önerilir; şema doğrulama, hatalı satır kuyruğu).
  4) Maestro: Kod/DB izleme ve güvenli bakım asistanı (rapor, migration taslakları, runbook) — prod’a yazmadan, PR/migration önerir.

## Donanım/topoloji (VPS yok)
- Lenovo X1 Yoga (merkez): AI Gateway + Ajan/Tool servisleri + Chat UI + izleme panoları; ana lokal LLM = 8B instruct (llama.cpp, GGUF).
- Raspberry Pi 5 16GB + 256GB NVMe: Tek Postgres (prod), edge LLM 3B (offline/degrade), Redis yerine Postgres tabanlı job queue (pg-boss/graphile-worker).
- Orange Pi 5 8GB: Embedding/indeks + hafif LLM worker (opsiyonel).
- WD My Cloud Home 4TB: Yalnızca arşiv/backup (modeller çalışma sırasında yerel SSD/NVMe’den).

## Veritabanı stratejisi (tek DB)
- Tek ana DB: PostgreSQL 16 @ Pi5 NVMe.
- Şemalar:
  - `erp` (RFQ/talep/satınalma)
  - `ai_gateway` (kota, sağlayıcı durumu, audit/policy)
  - `jobs` (pg-boss)
  - `rag` (pgvector)
- Dev’de mevcut SQLite korunabilir; orta aşamada Postgres’e migrasyon.
- Backup: WAL arşivi → NAS (günlük artımlı, haftalık tam), aylık restore provası.

## LLM ve yönlendirme (AI Gateway)
- Sağlayıcı havuzu:
  - Yoga‑LLM (8B, birincil), Pi5‑LLM (3B, offline/degrade), Orange‑LLM (1–3B, opsiyonel), Dış API(ler) (opsiyonel “refine”).
- Politika:
  - Kısa/standart iş → Yoga 8B; kalite düşükse, kota uygunsa API’de “refine”.
  - Uzun/yaratıcı iş → API (varsa), yoksa Yoga; offline → Pi5 → Orange → “taslak/uyarı” etiketi.
  - Devre kesici, exponential backoff, sıraya alma; prompt‑hash TTL cache (disk: Pi NVMe).
- UI: Open WebUI/LibreChat gibi Chat UI, `OPENAI_BASE_URL =` AI Gateway.

## Ajan + ERP Tool’ları (sözleşme)
- Örnek tool’lar:
  - `get_rfq(id)`, `list_rfqs(status,page)`, `create_purchase_request(payload)`
  - `send_linked_email(rfqId,to,subject,body)`
- Hata modları: 401/403, 429, 5xx/timeout, şema doğrulama hataları; retry/backoff, idempotency key.
- Güvenlik: ERP tokenları yalnızca backend’de; PII maskeleme; domain allowlist; kullanıcı/organizasyon rate limit.

## Talep JSON çıkarım (JSON şeması, örnek)
- TalepItem:
  - `brand` (string), `model` (string), `article_code` (string), `quantity` (number), `unit` (string), `description` (string), `lang` (string), `confidence` (0–1), `source_span` (start,end)
- Boru hattı: dil tespiti → normalizasyon → function calling/JSON schema ile çıkarım → heuristic/regex post‑kontrol → ERP ürün master ile eşleştirme (artikel tam eşleşme > fuzzy) → UI onay.

## Satınalma tedarikçi önerisi
- Girdi: `{ brand, article_code, product_name, specs? }`
- Çıktı: `suppliers: [{name, url, snippet, location?, price?}], confidence`.
- Strateji: Arama API → link toplama → lokal özet + alaka skoru → domain filtreleri → 5–10 aday; 48–72 saat cache.

## Finans (Excel → rapor)
- Python mikroservis (pandas/openpyxl + Great Expectations):
  - Şablon tespiti → dönüşüm → şema doğrulama → başarısız satırlar için düzeltme kuyruğu.
- Çıktı: standardize tablolar/raporlar → ERP rapor tablolarına veya BI’a.

## Maestro (kod/DB izleme ve bakım asistanı)
- İlke: “Öner ve hazırla”; prod DB’ye yazma yok. PR/migration taslakları üret; staging’de dry‑run; onayla prod’a uygula.
- Komut paleti (UI’den tetik):
  - Kod sağlığı (lint/typecheck/test) → rapor + PR
  - Bağımlılık güvenliği (SCA) → yükseltme planı + PR
  - DB sağlık (bloat/locks/EXPLAIN) → index/migration önerisi
  - Migration hazırlığı (DDL + rollback + etki analizi)
  - Backup/restore tatbikat raporu
  - ERP uçtan uca duman testi
- İzleme: Prometheus/Grafana; metrikler (gecikme, hata, token/saat, cache hit, queue durumu, Postgres/pgvector/pg_stat_statements).

## Güvenlik/uygulama kuralları
- Sırlar: .env / .env.local; repo’ya koyma.
- PII/sır maskeleme (prompt öncesi), response denetimi.
- Prod değişiklikleri: bakım penceresi, advisory lock; iki aşamalı onay.
- Ağ: LAN’da statik IP’ler (llm‑yoga, llm‑pi5, llm‑orange); kablolu bağlantı; Yoga’da reverse proxy (Nginx/Caddy).

## Kalite kapıları ve çalışma şekli
- Her anlamlı değişiklikte:
  - Build, Lint/Typecheck, Unit test, küçük smoke test.
  - VS Code Tasks (örnek): `backend:dev`, `backend:test once`, `frontend:dev`, `frontend:test (all)`, `frontend:build`.
- Windows PowerShell komutlarını doğru üret (tek satırda `;` ile zincirlenebilir).
- Değişiklikler küçük PR’lara bölünsün; public API değişiyorsa test ve dokümantasyon güncellensin.

## Aşamalı uygulama planı
- Aşama 1 (MVP):
  - AI Gateway skeleton (OpenAI uyumlu `/v1/chat/completions` proxy).
  - Talep JSON çıkarım + UI onay akışı (basit şema ve düşük güven uyarıları).
  - Tedarikçi link önerisinin temel versiyonu (arama → link listesi).
  - İzleme için temel metrikler ve audit log.
- Aşama 2:
  - Postgres@Pi5’e geçiş (pgvector, pg-boss), cache/devre kesici/sıraya alma.
  - Finans dönüşüm mikroservisi (Python).
  - Maestro: Read‑only raporlama ve PR/migration taslak üretimi.
- Aşama 3:
  - Opsiyonel API “refine”, AB test/kalite eşiği, tam dashboard, korumalı otomasyon (onaylı migration uygula), eGPU/mini GPU sunucu (opsiyonel).

## Beklenen davranış (Copilot’tan)
- Önce repo/çalışma alanını analiz et; yalnızca gereken dosyaları düzenle; küçük ve odaklı PR öner.
- Varsayılan: kod yazma adımına geçmeden önce (özellikle DB/şema) kısa onay iste (tek cümle).
- Gizli anahtar/erişim bilgisi isteme; yoksa `.env` örneği oluştur.
- Büyük işler: önce sözleşme/şema (inputs/outputs, hata modları, DoD) yaz; sonra test; ardından implementasyon.
- Dış ağ erişimi gerekirse belirt; mümkünse yerel simülasyon/test ile doğrula.
- Hata/engellerde net rapor: kök neden, 2–3 çözüm yolu, önerilen yol.

## Sınırlar ve kabuller
- GPU yok kabulüyle CPU‑only; 8B GGUF (Yoga), 3B GGUF (Pi5).
- Dış API’ler opsiyonel; varsa kota/failover politikasıyla yalnızca “refine” için.
- NAS canlı DB için kullanılmaz; yalnızca backup/snapshot.
- Yol isimlerinde özel karakterler sorun çıkarabilir; model/cache yolları için ASCII dizinler tercih et.

## “Hazırım” işaretleri
- AI Gateway için route iskeleti ve `.env` örnekleri yerinde.
- Talep JSON şeması ve extractor sözleşmesi yazıldı.
- İzleme metrikleri ve minimal dashboard açıldı.
- Postgres geçişi için migration planı/dokümanı hazır.

## Kullanım
- Bu dosyayı Copilot/chat oturumuna yapıştırın veya link verin.
- PDF’e aktarmak için: VS Code Command Palette → “Markdown: Export as PDF” (veya Markdown PDF eklentisi). Word’e aktarmak için Markdown’ı Word’de açabilir veya önce PDF oluşturup Word’e dönüştürebilirsiniz.
