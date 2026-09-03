# GateSure Run Commands

Run all commands from the folder containing `package.json`:

```bash
cd "C:\Users\Swapnil\Documents\VSCODE\GateSure-master\GateSure-master"
```

## 1. Install Dependencies
```bash
npm ci
```

For a first install without a lockfile, use `npm install`.

## 2. Configure Firebase

Copy `.env.local.example` to `.env.local` and set the Firebase web configuration values:

```powershell
Copy-Item .env.local.example .env.local
```

Also set `NEXT_PUBLIC_FACE_DETECTION_THRESHOLD` if you want to change the default `0.6` face-match threshold.

## 3. Start the Development Server
```bash
npm run dev
```

Open the app at:
```text
http://localhost:3000
```

## 4. Build for Production
```bash
npm run build
```

## 5. Start the Production Build
Run this after a successful production build:
```bash
npm run start
```

## 6. Lint the Project
```bash
npm run lint
```

## 7. Run the unit test

```powershell
node --test lib/registration.test.ts
```

## 6. Troubleshooting
- Make sure commands run in the folder containing `package.json`.
- Grant the browser permission to use the camera.
- Use localhost or HTTPS for camera access.
- If face models fail to load, check the browser Network tab and confirm the model URLs are reachable.
- Log in through the home page before opening society portal tabs. Dashboard links preserve the active `society_id`.
- Resident movement is recorded as `Exit`, then `Entry`, and alternates for later movements. Vendors and visitors use `Entry`, then `Exit`.
- If Firebase reports an invalid API key, check `.env.local` and restart the development server.