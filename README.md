# UniFi Voucher Manager

UVM is a modern, touch-friendly web application for managing WiFi vouchers on UniFi controllers.
Perfect for businesses, cafes, hotels, and home networks that need to provide guest WiFi access.

![WiFi Voucher Manager](./assets/view.png)

<!-- vim-markdown-toc GFM -->

- [✨ Features](#-features)
  - [🎫 Voucher Management & WiFi QR Code](#-voucher-management--wifi-qr-code)
  - [Kiosk Display](#kiosk-display)
  - [🔐 Authentication & Authorization](#-authentication--authorization)
  - [🌐 Internationalization](#-internationalization)
  - [🎨 Modern Interface](#-modern-interface)
  - [🔧 Technical Features](#-technical-features)
- [🚀 Quick Start](#-quick-start)
  - [Using Docker Compose (Recommended)](#using-docker-compose-recommended)
  - [Without Docker](#without-docker)
- [⚙️ Configuration](#-configuration)
  - [Getting UniFi API Credentials](#getting-unifi-api-credentials)
  - [Microsoft Entra ID (Office 365) Setup](#microsoft-entra-id-office-365-setup)
  - [Rolling Vouchers and Kiosk Page](#rolling-vouchers-and-kiosk-page)
    - [How Rolling Vouchers Work](#how-rolling-vouchers-work)
  - [Environment Variables](#environment-variables)
- [🐛 Troubleshooting](#-troubleshooting)
  - [Common Issues](#common-issues)
  - [Getting Help](#getting-help)

<!-- vim-markdown-toc -->

## ✨ Features

### 🎫 Voucher Management & WiFi QR Code

- **Quick Create** - Generate guest vouchers with three preset durations (1 Day, 1 Week, 1 Year)
- **Custom Create** - Full control over voucher parameters:
  - Custom name
  - Duration (minutes to days)
  - Guest count limits
  - Data usage limits
  - Upload/download speed limits
- **Browse Vouchers** - Browse and search existing vouchers by name
- **Hide used-up vouchers** - Vouchers whose guest limit has been reached are hidden by default and marked visually when shown; keeps the list focused on what's still usable
- **Bulk Operations** - Select and delete multiple vouchers at once
- **Print Vouchers** - Print vouchers in either list or grid format; thermal printers friendly
- **Auto-cleanup** - Remove expired vouchers with a single click
- **QR Code** - Easily connect guests to your network
- **Rolling Vouchers** - Automatically generate a voucher for the next guest when the current one gets used

### Kiosk Display

The kiosk page (`/kiosk`) provides a guest-friendly interface displaying:

- **QR Code**: For easy network connection (if configured in [Environment Variables](#environment-variables))
- **Current Voucher**: The active rolling voucher code
- **Real-time Updates**: Automatically refreshes when the rolling voucher changes

### 🔐 Authentication & Authorization

- **Microsoft Entra ID (Office 365) login** - OAuth 2.0 / OIDC sign-in via Auth.js v5
- **Group-based access control** - Only members of a configurable Entra ID group are allowed in; everyone else is rejected before a session is created
- **Session-protected routes** - `/`, `/print` and the backend API require a valid session; `/welcome` and `/kiosk` stay public for guest flows
- **Secure by design** - Client secrets stay in the Next.js server process, session cookies are HttpOnly + encrypted via JWE

### 🌐 Internationalization

- **German and English** - Full UI translation including dates, validation errors and notifications
- **Per-user language toggle** - Circle-flag switcher in the header; choice is persisted in `localStorage`
- **German is the default** - SSR-deterministic, no browser language sniffing

### 🎨 Modern Interface

- **Touch-Friendly** – Optimized for tablet, mobile, and desktop
- **Dark/Light Mode** – Follows system preference, with manual override
- **Responsive Design** - Works seamlessly across all screen sizes
- **Smooth Animations** – Semantic transitions for polished UX
- **Real-time Notifications** - Instant feedback for all operations

### 🔧 Technical Features

- **Docker Ready** - Easy deployment with Docker Compose and included healthcheck
- **Single `.env` file for configuration** - `.env.example` documents every key; `.env` is gitignored
- **UniFi Integration** - Direct API connection to UniFi controllers
- **Secure Architecture** - Next.js (TypeScript + Tailwind CSS) frontend with an Axum-based Rust backend that handles all UniFi Controller communication, keeping credentials isolated from the user-facing UI

## 🚀 Quick Start

### Using Docker Compose (Recommended)

The repository is set up to build the image locally from the included `Dockerfile`. No upstream registry is contacted.

1. **Clone the repository**
   ```bash
   git clone https://github.com/etiennecollin/unifi-voucher-manager
   cd unifi-voucher-manager
   ```
2. **Create your configuration**
   ```bash
   cp .env.example .env
   # then edit .env and fill in the required values
   ```
   See [Environment Variables](#environment-variables) below for what each key does. Also complete the [Microsoft Entra ID (Office 365) Setup](#microsoft-entra-id-office-365-setup) before first launch — without those credentials nobody can sign in.
3. **Build and start the application**
   ```bash
   docker compose up -d --build
   ```
   Compose builds the image once, tags it as `unifi-voucher-manager:local`, and reuses it on subsequent runs. Use `--build` again after code changes.
4. **Access the interface**
   - Open your browser to `http://localhost:3000`.
   - Sign in with a Microsoft account that belongs to the admin group configured via `ADMIN_GROUP_ID`.

### Without Docker

1. **Install the dependencies**
   - `rust >= 1.88.0`
   - `nodejs >= 24.3.0`
   - `npm >= 11.4.2`
   - On Windows additionally: Visual Studio Build Tools (C++ workload), CMake and NASM — required by the Rust TLS crate (`aws-lc-sys`).
2. **Clone the repository**
   ```bash
   git clone https://github.com/etiennecollin/unifi-voucher-manager
   ```
3. **Configure your environment**
   ```bash
   cp .env.example .env
   # then edit .env and fill in the required values
   ```
   The Auth.js variables (`AUTH_SECRET`, `AUTH_MICROSOFT_ENTRA_ID_*`, `ADMIN_GROUP_ID`) also need to be visible to the Next.js server — create a `frontend/.env.local` with the same Auth keys, or export them in the shell that runs `npm run dev`.
4. **Start the backend and frontend in separate terminals**

   ```bash
   # Backend — reads env from the repo-root .env via the dotenv feature
   cd backend && cargo run --release --features dotenv

   # Frontend (development)
   cd frontend && npm install && npm run dev

   # Frontend (release)
   cd frontend && npm ci && npm run build && npm run start
   ```

5. **Access the interface**
   - Open your browser to `http://localhost:3000`.

## ⚙️ Configuration

### Getting UniFi API Credentials

1. **Access your UniFi Controller**
2. **Navigate to Settings -> Control Plane -> Integration**
3. **Create a new API key** by giving it a name and an expiration.
4. **Find your Site ID** in the controller URL or on [unifi.ui.com](https://unifi.ui.com)

### Microsoft Entra ID (Office 365) Setup

UVM requires a Microsoft Entra ID app registration and a group that defines who is allowed to sign in.

1. **Create the app registration**
   - Go to **Azure Portal → Entra ID → App registrations → New registration**.
   - Supported account types: single-tenant (recommended).
   - **Redirect URI** (Web): `http://localhost:3000/api/auth/callback/microsoft-entra-id` for local development and `https://<your-domain>/api/auth/callback/microsoft-entra-id` for production. Both can be added.
2. **Create a client secret**
   - **Certificates & secrets → Client secrets → New client secret**.
   - Copy the **Value** (not the Secret ID) immediately — it is only shown once.
3. **Enable the `groups` optional claim on the ID token**
   - **Token configuration → Add optional claim → ID → `groups`**.
   - In the dialog, choose **Group ID** and save. Without this step the ID token has no `groups` array and every login will be rejected.
4. **Find the admin group's Object ID**
   - **Entra ID → Groups → `<your admin group>` → Overview → Object ID**.
   - Only members of this group will be allowed to sign in; everyone else is rejected after Microsoft authentication, before a session is created.
5. **Collect the values and put them into `.env`**
   - `AUTH_MICROSOFT_ENTRA_ID_ID` ← Application (client) ID from the app registration overview
   - `AUTH_MICROSOFT_ENTRA_ID_SECRET` ← the client-secret **Value** from step 2
   - `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID` ← Directory (tenant) ID from the app registration overview
   - `ADMIN_GROUP_ID` ← Object ID from step 4
   - `AUTH_SECRET` ← generate with `openssl rand -base64 32`

> [!CAUTION]
> If `ADMIN_GROUP_ID` is left empty, **every** authenticated Entra ID user in your tenant can sign in (a warning is logged at startup). Set this before exposing UVM to a real audience.

> [!NOTE]
> Entra ID sends the `groups` claim as a plain array only when the user belongs to at most ~200 groups. Larger memberships produce a `hasgroups: true` placeholder that UVM does not handle — users affected by this would need a Microsoft Graph lookup, which is not implemented.

### Rolling Vouchers and Kiosk Page

Rolling vouchers provide a seamless way to automatically generate guest network access codes. When one voucher is used, a new one is automatically created for the next guest.

> [!IMPORTANT]
> **Setup Required**
>
> For rolling vouchers to work properly, you **must** configure your UniFi Hotspot:
>
> 1. Go to your UniFi Controller -> Insights -> Hotspot
> 2. Set the **Success Landing Page** to: `https://your-uvm-domain.com/welcome`, the `/welcome` page of UVM
>
> Without this configuration, vouchers **will not** automatically roll when guests connect.

> [!CAUTION]
> To restrict UVM access to the guest subnetwork users while still allowing access to `/welcome` page, set the `GUEST_SUBNETWORK` environment variable. This makes sure guests do not have access to other UVM pages, such as the voucher management interface (the root `/` page).
>
> Without this configuration, guests **will be able** to access the voucher management interface of UVM. This means they will be able to both create and delete vouchers by themselves.

#### How Rolling Vouchers Work

1. **Initial Setup**: Rolling vouchers are generated automatically when needed
2. **Guest Connection**: When a guest connects to your network, they're redirected to the `/welcome` page
3. **Automatic Rolling**: The welcome page triggers the creation of a new voucher for the next guest
   - Rolling vouchers are created with special naming conventions to distinguish them from manually created vouchers, making them easy to identify in your voucher management interface
4. **IP-Based Uniqueness**: Each IP address can only generate one voucher per session (prevents abuse from page reloads)
5. **Daily Maintenance**: To prevent clutter, expired rolling vouchers are automatically deleted at midnight (based on your configured `TIMEZONE` in [Environment Variables](#environment-variables))

### Environment Variables

Make sure to configure the required variables. The optional variables generally have default values that you should not have to change.

> [!TIP]
>
> - To configure the WiFi QR code, you are required to configure the `WIFI_SSID` and `WIFI_PASSWORD` variables.
> - For proper timezone, make sure to set the `TIMEZONE` variable.

> [!IMPORTANT]
> Make sure to expand this section and read what the environment variables are doing. Some variables are **required**, they are placed at the top of the list.

- **`UNIFI_CONTROLLER_URL`: `string`** (_Required_)
  - **Description**: URL to your UniFi controller with protocol (`http://` or `https://`).
  - **Example**: `https://unifi.example.com` or `https://192.168.8.1:443`
- **`UNIFI_API_KEY`: `string`** (_Required_)
  - **Description**: API Key for your UniFi controller.
  - **Example**: `abc123...`
- **`AUTH_SECRET`: `string`** (_Required_)
  - **Description**: Cryptographic key used by Auth.js to sign and encrypt session cookies, CSRF tokens and OAuth state. Must be at least 32 bytes of random data. Changing it invalidates every existing session.
  - **Example**: output of `openssl rand -base64 32`
- **`AUTH_MICROSOFT_ENTRA_ID_ID`: `string`** (_Required_)
  - **Description**: Application (client) ID from the Entra ID app registration. See [Microsoft Entra ID (Office 365) Setup](#microsoft-entra-id-office-365-setup).
  - **Example**: `a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **`AUTH_MICROSOFT_ENTRA_ID_SECRET`: `string`** (_Required_)
  - **Description**: Client-secret **Value** (not the Secret ID) from the app registration.
  - **Example**: `Abc~1xy...` (~40 characters)
- **`AUTH_MICROSOFT_ENTRA_ID_TENANT_ID`: `string`** (_Required_)
  - **Description**: Directory (tenant) ID from the app registration.
  - **Example**: `e5f6a7b8-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **`ADMIN_GROUP_ID`: `string`** (_Required_)
  - **Description**: Object ID of the Entra ID group whose members are allowed to sign in. Users outside this group are rejected after Microsoft authentication, before a session is created. If left empty, every authenticated user in the tenant is allowed in (a warning is logged at startup).
  - **Example**: `c9d0e1f2-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

> [!WARNING]
> Improperly setting the `UNIFI_HAS_VALID_CERT` variable **will** prevent UVM from communicating with the UniFi controller.

- **`UNIFI_HAS_VALID_CERT`: `bool`** (_Optional_)
  - **Description**: Whether your UniFi controller uses a valid SSL certificate. This should normally be set to `true`, especially if you access the controller through a reverse proxy or another setup that provides trusted certificates (e.g., Let's Encrypt). **If you connect directly to the controller’s IP address (which usually serves a self-signed certificate), you may need to set this to `false`.**
  - **Example**: `true` (default)
- **`UNIFI_SITE_ID`: `string`** (_Optional_)
  - **Description**: Site ID of your UniFi controller. Using the value `default`, the backend will try to fetch the ID of the default site.
  - **Example**: `default` (default)

> [!CAUTION]
> To restrict UVM access to the guest subnetwork users while still allowing access to `/welcome` page, set the `GUEST_SUBNETWORK` variable. This makes sure guests do not have access to other UVM pages, such as the voucher management interface (the root `/` page).
>
> Without this configuration, guests **will be able** to access the voucher management interface of UVM. This means they will be able to both create and delete vouchers by themselves.

- **`GUEST_SUBNETWORK`: `IPv4 CIDR`** (_Optional_)
  - **Description**: Restrict guest subnetwork access to UVM while still permitting access to the `/welcome` page, which users are redirected to from the UniFi captive portal. For more details, see [Rolling Vouchers and Kiosk Page](#rolling-vouchers-and-kiosk-page).
  - **Example**: `10.0.5.0/24`
- **`FRONTEND_BIND_HOST`: `IPv4`** (_Optional_)
  - **Description**: Address on which the frontend server binds.
  - **Example**: `0.0.0.0` (default)
- **`FRONTEND_BIND_PORT`: `u16`** (_Optional_)
  - **Description**: Port on which the frontend server binds.
  - **Example**: `3000` (default)
- **`FRONTEND_TO_BACKEND_URL`: `URL`** (_Optional_)
  - **Description**: URL where the frontend will make its API requests to the backend.
  - **Example**: `http://127.0.0.1` (default)
- **`BACKEND_BIND_HOST`: `IPv4`** (_Optional_)
  - **Description**: Address on which the server binds.
  - **Example**: `127.0.0.1` (default)
- **`BACKEND_BIND_PORT`: `u16`** (_Optional_)
  - **Description**: Port on which the backend server binds.
  - **Example**: `8080` (default)
- **`BACKEND_LOG_LEVEL`: `trace|debug|info|warn|error`** (_Optional_)
  - **Description**: Log level of the Rust backend.
  - **Example**: `info`(default)
- **`TIMEZONE`: [`timezone identifier`](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)** (_Optional_)
  - **Description**: [Timezone identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List) used to format dates and time.
  - **Example**: `UTC` (default)
- **`ROLLING_VOUCHER_DURATION_MINUTES`: `minutes`** (_Optional_)
  - **Description**: Number of minutes a rolling voucher will be valid for once activated.
  - **Example**: `480` (default)
- **`WIFI_SSID`: `string`** (_Optional_)
  - **Description**: WiFi SSID used for the QR code. (required for QR code to be generated)
  - **Example**: `My WiFi SSID`
- **`WIFI_PASSWORD`: `string`** (_Optional_)
  - **Description**: WiFi password used for the QR code. If the WiFi network does not have a password, set to an empty string `""`. (required for QR code to be generated)
  - **Example**: `My WiFi Password`
- **`WIFI_TYPE`: `WPA|WEP|nopass`** (_Optional_)
  - **Description**: WiFi security type used. Defaults to `WPA` if a password is provided and `nopass` otherwise.
  - **Example**: `WPA`
- **`WIFI_HIDDEN`: `bool`** (_Optional_)
  - **Description**: Whether the WiFi SSID is hidden or broadcasted.
  - **Example**: `false` (default)
- **`AUTH_TRUST_HOST`: `bool`** (_Optional_)
  - **Description**: Tells Auth.js to trust `X-Forwarded-*` headers set by a reverse proxy in front of UVM. Required when running behind a proxy that terminates TLS; the Dockerfile sets this to `true` by default.
  - **Example**: `true` (default in Docker)
- **`AUTH_URL`: `URL`** (_Optional_)
  - **Description**: Override the public base URL of the app when `AUTH_TRUST_HOST` alone isn't enough — usually when the URL the container sees differs significantly from the one the browser uses. Leave unset for typical reverse-proxy setups.
  - **Example**: `https://uvm.example.com`

## 🐛 Troubleshooting

### Common Issues

- **Vouchers not appearing or connection issue to UniFi controller**
  - Verify `UNIFI_CONTROLLER_URL` is correct and accessible
  - Verify `UNIFI_SITE_ID` matches your controller's site
  - Verify `UNIFI_HAS_VALID_CERT` is correct (depending on whether your `UNIFI_CONTROLLER_URL` has a valid SSL certificate or not)
  - Check if the UniFi controller is running and reachable (DNS issues?)
  - Ensure API key is valid
  - Ensure the site has the hotspot/guest portal enabled
- **Application won't start**
  - Check all environment variables are set
  - Verify Docker container has network access to UniFi controller
  - Check logs: `docker logs unifi-voucher-manager`
- **The WiFi QR code button is missing from the header**
  - The button is hidden when `WIFI_SSID` / `WIFI_PASSWORD` are not configured. Set both in `.env` to make it appear.
- **Sign-in always fails with "access denied" / redirect loop**
  - Verify the user is a member of the group whose Object ID is in `ADMIN_GROUP_ID`.
  - Check that the `groups` optional claim is enabled on the **ID token** (not only the access token) in the app registration's Token configuration.
  - Watch the frontend logs — Auth.js logs a warning like `Sign-in rejected: user ... is not in ADMIN_GROUP_ID`.
- **Sign-in fails with `AADSTS7000215: Invalid client secret`**
  - The client secret has expired or `AUTH_MICROSOFT_ENTRA_ID_SECRET` contains the Secret ID instead of the Value. Create a new secret, copy the Value (shown once!), update `.env` and restart the container.
- **"Invalid redirect URI" from Microsoft**
  - The redirect URI in the Entra ID app registration must exactly match what Auth.js sends, including scheme and port. For local dev: `http://localhost:3000/api/auth/callback/microsoft-entra-id`. Add the production URL separately.

### Getting Help

- Check the [Issues](https://github.com/etiennecollin/unifi-voucher-manager/issues) page
- Create a new issue with detailed information about your problem
- Include relevant logs and environment details (redact sensitive information)
  - Run the container/backend with `BACKEND_LOG_LEVEL="debug"`
  - Include Docker logs: `docker logs unifi-voucher-manager`
  - Include browser logs: generally by hitting `F12` and going to the 'console' tab of your browser

---

**⭐ If this project helped you, please consider giving it a star!**
