<div align="center">
  <img width="1200" height="475" alt="TripBridge Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  
  # 🚀 TripBridge
  
  ### *Your All-in-One AI Travel Companion, Social Hub, and Real-Time Group Planner*

  [![React](https://img.shields.io/badge/React-19.0.0-cyan?logo=react&logoColor=cyan)](#)
  [![Vite](https://img.shields.io/badge/Vite-6.2.0-purple?logo=vite&logoColor=purple)](#)
  [![Firebase](https://img.shields.io/badge/Firebase-12.11.0-orange?logo=firebase&logoColor=orange)](#)
  [![Capacitor](https://img.shields.io/badge/Capacitor-8.2.0-blue?logo=capacitor)](#)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind--v4-4.1.14-06B6D4?style=flat&logo=tailwindcss)](#)
  [![Gemini AI](https://img.shields.io/badge/Gemini_API-Server_Side-FF007F?logo=google&logoColor=white)](#)

  **Explore the App in Google AI Studio:**  
  👉 [https://ai.studio/apps/0ea9706e-6762-4ed5-adb3-ae6d3611f08b](https://ai.studio/apps/0ea9706e-6762-4ed5-adb3-ae6d3611f08b)
</div>

---

## 📖 Table of Contents
- [✨ Key Features](#-key-features)
  - [🤖 AI Travel Assistant](#-ai-travel-assistant)
  - [📞 Real-Time Rich Chats & Global Video/Audio Calls](#-real-time-rich-chats--global-videoaudio-calls)
  - [🗺️ Collaborative Trip Organizing](#-collaborative-trip-organizing)
  - [💳 Split & Track Shared Travel Expenses](#-split-track-shared-travel-expenses)
  - [🔒 Encrypted Travel Document Vault](#-encrypted-travel-document-vault)
  - [📣 Social Travel Feed & Buddy Finder](#-social-travel-feed--buddy-finder)
- [🏗️ Technical Stack](#️-technical-stack)
- [🧩 Application & Database Architecture](#-application--database-architecture)
- [🛠️ Local Installation & Development](#%EF%B8%8F-local-installation--development)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Installation steps](#2-installation-steps)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Build, Dev and Start Commands](#4-build-dev-and-start-commands)
- [📱 Native Mobile Deployment (Capacitor)](#-native-mobile-deployment-capacitor)
- [🔒 Firestore Security Profile](#-firestore-security-profile)

---

## ✨ Key Features

### 🤖 AI Travel Assistant
*   **Unified Travel Itinerary Planner:** Enter a destination, duration, budget, and travel preferences to receive an incredibly rich, personalized travel plan packed with day-by-day sightseeing guidelines, regional suggestions, and dining points.
*   **Expert Travel Planner:** Run complex prompts or location questions against our tailored AI travel engine.
*   **Gemma AI Playground:** Create direct conversational prompts or play around with prompt variables in an intuitive visual terminal playground, powered server-side by safe Gemini API proxy endpoints.

### 📞 Real-Time Rich Chats & Global Video/Audio Calls
*   **Threaded Rooms:** Every trip is a community. Communicate with other travelers instantly in secure, live direct chats and trip-group channels.
*   **Custom Communication Modules:** Build direct community interaction with fast poll creators, polling votes, interactive emoji collections, and attachment share lists inside active chats.
*   **WebRTC Audio/Video Calls (Jitsi Integration):** Start an instant high-definition, low-latency audio or video meeting on demand.
*   **🚨 Global Call Observer Overlay System:** Users never miss a meeting setup. No matter what screen they are interacting with (Dashboard, Feed, Profile, or Settings), the background engine monitors database call updates:
    *   Triggers beautiful responsive **Global Pop-up Incoming Call Overlays** complete with red glowing indicator highlights and dynamic controls.
    *   Flashes real-time **Bell Ringing `sonner` toasts** pointing to incoming calls, allowing users to hit **Join Now** or **Ignore** instantly.

### 🗺️ Collaborative Trip Organizing
*   **Discover Public Trips:** Scan open trips created by experienced travel organizers, read detail descriptions, check rosters, and join directly.
*   **Travel Companion Matcher:** Profile compatibility scoring engines analyze your travel preferences (backpacking vibes, luxury, food tours, budget levels) to pair and match you with ideal companion groups.
*   **Secure Invitations:** Easy-to-use invite codes allow sharing links with friends to bring them directly into your group.

### 💳 Split & Track Shared Travel Expenses
*   **Expansive Transaction Ledger:** Log trip expenses inside group directories, label classifications (dining, travel tickets, lodging), and attach dates of transactions.
*   **Debt Split Engine:** Intuitively auto-calculates total balances, split proportions among approved trip members, and maps exact net payments to settle.

### 🔒 Encrypted Travel Document Vault
*   **Offline Document Vault:** Store passport copies, airline flight PDFs, hotel reservations, or local guide papers directly on hand.
*   **Camera Integration:** High-fidelity Capacitor components allow mobile user devices to snap physical copies of itineraries or tickets directly and back them up to secure databases.

### 📣 Social Travel Feed & Buddy Finder
*   **Live Travel Feed:** Share trip moments, scenic image media postings, and recommendations. Seek recommendations or drop comments underneath travel community posts.
*   **Buddy Filter Finder:** Locate specific travelers or guides within your targeted location areas with high-precision query variables.

---

## 🏗️ Technical Stack

| Category | Technologies | Description |
| :--- | :--- | :--- |
| **Frontend Runtime** | **React 19, TypeScript, Vite** | Ultrafast Next-Gen asset builds, strict typing declarations, and high-performance render cycles. |
| **Database & Auth** | **Firebase Admin & Firebase Firestore** | Secure server-side identity, instantaneous real-time document listening, and robust collection synchronization. |
| **Video Infrastructure** | **Jitsi React Meet SDK** | Secure WebRTC calling without complex browser frame constraints or pre-join delays. |
| **Responsive Styles**| **Tailwind CSS v4** | Clean utility styles, elegant responsive design sheets, adaptive fluid gutters, and dark palette templates. |
| **Native Wrappers** | **Capacitor, Capacitor Plugins**| Direct bridges converting the web app into native Android app binaries. |
| **Declarative Motions**| **Motion (Framer Motion)** | Fluid state overlays, slide-up notification widgets, and visual transitions. |
| **Proxy API Server** | **Express.js & tsx** | Handles server-side API routing and hides critical keys (Gemini tokens, secure credentials) from public browsers. |

---

## 🧩 Application & Database Architecture

TripBridge relies on a unified, relational-logical Firestore database model schema combined with clean full-stack security rules.

```
          ┌──────────────────────────────────────────────┐
          │               React 19 SPA                   │
          └──────────────────────┬───────────────────────┘
                                 │
                     (Real-Time Listening / Signals)
                                 │
             ┌───────────────────▼───────────────────┐
             │       Firebase Firestore Backend      │
             └───────────────────┬───────────────────┘
                                 │
       ┌─────────────────────────┼─────────────────────────┐
       ▼                         ▼                         ▼
┌──────────────┐         ┌──────────────┐         ┌────────────────┐
│    /users    │         │    /trips    │         │   /channels    │
│ Profiles/Auth│         │ Collaborative│         │ Direct Messages│
└──────────────┘         │ Travel Groups│         │& In-chat Status│
                         └──────┬───────┘         └────────────────┘
                                │
                                ▼
                       ┌────────────────┐
                       │  /active_call  │
                       │ Live signaling │
                       └────────────────┘
```

Detailed database designs for direct collections, subcollections, structural triggers, and metadata schemas reside in [DATABASE_DESIGN.md](./DATABASE_DESIGN.md).

---

## 🛠️ Local Installation & Development

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your workspace computer system (version 18+ is recommended).

### 2. Physical Setup Step-by-Step
Clone this directory and navigate into the root directory:
```bash
git clone <your-repository-url>
cd tripbridge
```
Install all developer and core dependencies:
```bash
npm install
```

### 3. Configure Environment Variables
Copy our sample variables structure to `.env`:
```bash
cp .env.example .env
```
Open up your generated `.env` file and insert your respective values:
*   `GEMINI_API_KEY`: Required server side to proxy AI Unified Trip Planner and Gemma playground chat completions.
*   `FIREBASE_SERVICE_ACCOUNT`: Used by the backend Express layer for database queries, administrative profiles, and permission validations.

```env
# Example Env Setup
GEMINI_API_KEY=your_actual_google_gen_ai_api_key
PORT=3000
NODE_ENV=development
```

### 4. Build, Dev and Start Commands

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run dev` | **Start Dev Cluster** | Runs our proxy backend server and injects the frontend Vite Hot Module server. accessible on [http://localhost:3000](http://localhost:3000). |
| `npm run lint` | **Run Code Check** | Compiles TypeScript checks (`tsc --noEmit`) to verify strict typing rules. |
| `npm run build` | **Generate Production Build** | Compiles Vite client bundles and compiles TypeScript custom server assets via `esbuild` to CJS. |
| `npm run start`| **Launch Final Standalone App**| Serves static assets on the express proxy, ready for container run. |

---

## 📱 Native Mobile Deployment (Capacitor)

TripBridge has a full Capacitor structural package setup to compile natively into Android files.

To sync web code changes to your mobile platforms:
```bash
npm run mobile:sync
```

To boot Android Studio to view and compile layout frames directly:
```bash
npm run mobile:open
```

To run a fast command-line build producing optimized debug `.apk` files inside container directories:
```bash
npm run mobile:build
```

---

## 🔒 Firestore Security Profile

TripBridge applies strict verification rules defined inside the central [firestore.rules](./firestore.rules) file. Trip plans, document vaults, expense ledgers, and live call signaling blocks cannot be altered or hijacked by malicious non-members. 

-   Only authorized users can verify, update, or read relevant information.
-   Direct user-to-user channels require active participant matching.
-   Video call setups require trip workspace authorization or participant registration in Firestore before starting signaling.

---

<div align="center">
  <b>Plan your next great destination with security, automation, and real-time support. Created with 💙 on TripBridge.</b>
</div>
