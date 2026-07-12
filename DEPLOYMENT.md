# Deploying website-vertex to a DigitalOcean Droplet

This app is a **Next.js 16** server app (Prisma + MongoDB Atlas, NextAuth, Razorpay,
Cloudinary, Nodemailer, Upstash, PostHog). It runs in Docker behind **Caddy**, which
handles HTTPS automatically via Let's Encrypt.

```
Internet ──443──▶ Caddy (TLS) ──▶ app container (Next.js :3000) ──▶ MongoDB Atlas
```

---

## 1. Create the droplet

1. DigitalOcean → **Create → Droplet**.
2. Image: **Ubuntu 24.04 LTS**.
3. Size: Basic / Regular — **2 GB RAM minimum** (the Docker build needs headroom; a
   1 GB droplet can OOM during `next build` — add swap if you use 1 GB, see step 4).
4. Add your **SSH key**.
5. Create, then note the **public IPv4** address.

SSH in:

```bash
ssh root@YOUR_DROPLET_IP
```

## 2. Point the domain at the droplet

At your `dsce.club` DNS provider (or DigitalOcean → Networking → Domains), create an **A record**:

| Type | Host     | Value            |
|------|----------|------------------|
| A    | `vertex` | `YOUR_DROPLET_IP`|

This maps `vertex.dsce.club` to the droplet. (The Caddyfile serves exactly the host in
`DOMAIN`; if you also want a `www.vertex.dsce.club` alias, add both an A record for it
AND that hostname to the Caddyfile — by default it is not served.)
Wait for it to resolve before step 6 — Caddy can't issue a cert until DNS points here:

```bash
dig +short vertex.dsce.club   # should print YOUR_DROPLET_IP
```

## 3. Install Docker + firewall

```bash
# Docker Engine + compose plugin
curl -fsSL https://get.docker.com | sh

# Firewall: allow SSH + web only
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

## 4. (Only if 1 GB droplet) add swap

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile
mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 5. Get the code + configure env

```bash
git clone https://github.com/vertexclub/website-vertex.git
cd website-vertex

cp .env.example .env
nano .env          # fill in EVERY value — see notes below
```

Key `.env` notes:
- `DOMAIN` / `LETSENCRYPT_EMAIL` — used by Caddy for the cert.
- `NEXTAUTH_URL=https://YOUR_DOMAIN` (must match exactly, https).
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`.
- `DATABASE_URL` — your existing MongoDB Atlas SRV string. In Atlas → Network Access,
  **allow the droplet's IP** (or 0.0.0.0/0 for any).
- `NEXT_PUBLIC_*` — these are compiled into the frontend at build time, so they must be
  set before you build. Changing them later requires a rebuild.

## 6. Build & start

```bash
docker compose up -d --build
```

Caddy will fetch a TLS cert on first request (give it ~30s). Then:

```bash
curl -I https://YOUR_DOMAIN      # expect HTTP/2 200
docker compose ps                # both services "running"
docker compose logs -f app       # app logs
docker compose logs -f caddy     # cert issuance / proxy logs
```

## 7. Update external service callbacks (point them off Vercel)

- **Google OAuth** (console.cloud.google.com → Credentials → your OAuth client):
  add Authorized redirect URI `https://YOUR_DOMAIN/api/auth/callback/google`.
- **Razorpay dashboard** → Webhooks: update the webhook URL to
  `https://YOUR_DOMAIN/api/webhook/razorpay` (secret = `RAZORPAY_WEBHOOK_SECRET`).
- Anywhere else the old Vercel URL is hardcoded/whitelisted.

## 8. Deploying updates later

```bash
cd ~/website-vertex
git pull
docker compose up -d --build      # rebuild + restart with zero-ish downtime
docker image prune -f             # clean old layers
```

---

## Cutover from Vercel

1. Bring this droplet fully up and test it via its IP / a temporary hostname first.
2. Update the DNS A records to the droplet (step 2). DNS TTL controls how fast traffic moves.
3. Once traffic is served from the droplet and verified, remove/pause the Vercel project
   (or leave its domain unassigned) so nothing points back to it.

## Troubleshooting

- **Cert won't issue**: DNS not resolving to the droplet yet, or ports 80/443 blocked.
  Check `docker compose logs caddy`.
- **`next build` fails accessing the DB**: if a page prerenders against Prisma at build
  time, add the needed secrets as build args in `docker-compose.yml` (mirror the
  `NEXT_PUBLIC_*` pattern). Most routes here are dynamic, so this is unlikely.
- **Prisma engine error at runtime**: confirm the image has `openssl` (it does via the
  base stage) and that `node_modules/.prisma` was copied (it is, in the runner stage).
- **502 from Caddy**: the app container crashed — `docker compose logs app`.
