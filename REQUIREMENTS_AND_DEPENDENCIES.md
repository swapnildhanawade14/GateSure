# GateSure Requirements and Dependencies

## 1. Project Overview
GateSure is a Next.js application for residential society gate management. It supports:
- resident registration
- face capture and recognition
- guard dashboard for entry and exit validation
- analytics dashboard
- Firebase-backed data storage

## 2. Core Requirements
### Software
- Node.js 20 or later
- npm 10 or later
- Git
- A modern browser such as Chrome or Edge

### Environment
- Windows, macOS, or Linux development machine
- Internet access for installing packages and accessing model URLs
- Localhost access for browser camera permissions

### Firebase Setup
- Firebase project with Firestore enabled
- Firebase web configuration values for:
  - apiKey
  - authDomain
  - projectId
  - storageBucket
  - messagingSenderId
  - appId

### Browser Requirements
- Camera access enabled
- HTTPS or localhost environment for secure media access
- Permissions granted for microphone/camera when prompted

## 3. Project Dependencies
The app uses the following dependencies from the project package:

### Runtime dependencies
- next: 16.3.3
- react: 19.2.8
- react-dom: 19.2.8
- firebase: ^12.18.0
- face-api.js: ^0.22.2
- html5-qrcode: ^2.3.8
- qrcode.react: ^4.2.0
- axios: ^1.20.0
- recharts: ^3.10.1

### Development dependencies
- typescript: ^5
- eslint: ^9
- eslint-config-next: 16.3.3
- @types/node: ^20
- @types/react: ^19
- @types/react-dom: ^19
- tailwindcss: ^4
- @tailwindcss/postcss: ^4

## 4. Project Structure
- app/
- components/
- lib/
- public/
- package.json
- tsconfig.json
- next.config.ts

## 5. Installation Steps
1. Open a terminal in this project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and fill in your Firebase project values.
4. Start the development server:
   ```bash
   npm run dev
   ```

## 6. Sensitive configuration and secrets
- Never commit `.env`, `.env.local`, API keys, database credentials, passwords, tokens, or private certificates.
- Keep all real secrets in local environment files, secure secret managers, or deployment platform secret stores.
- The repository includes `.gitignore` rules to prevent accidental commits of `node_modules`, `.env*`, and certificate files.
- Only commit example placeholders, not actual credential values.

## 7. Notes
- Run project commands from the GateSure project folder, which contains `package.json`.
- Camera access works only on localhost or HTTPS.
- Grant browser camera permission when prompted.
- Face recognition model URLs must resolve correctly or face detection will fail.
- Firebase Authentication and Firestore must be enabled for authenticated and tenant-scoped data flows.
- Resident records require a face capture before registration; entry and exit photos are stored as image data in Firestore.
- Keep `.env.local` private. The Firebase web configuration is client-visible, but server-only secrets must never be exposed to browser code.

## 8. Production Build
```bash
npm run build
```

## 9. Production Start
```bash
npm run start
```

## 10. Tests

The repository currently includes a Node test for resident/vendor QR registration:

```bash
node --test lib/registration.test.ts
```