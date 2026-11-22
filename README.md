# DynoPrice

DynoPrice is an Expo / React Native pricing-workflow prototype originally created with Bilt.
The `main` branch contains this application. The separate `landing-page` and
`dynoprice-decision-engine-mvp` branches have their own history and deployment context.

## Reproducible development and validation

Use Node.js 22 and the declared npm 10.9.0 with the committed lockfile:

```sh
npm install --global npm@10.9.0
npm ci
npm run expo-check
npm run doctor
npm run lint
npm run typecheck
npm run build
```

`npm run build` exports the web application to `dist/`. Native JavaScript can be checked
without signing or releasing an app:

```sh
EXPO_PLATFORM=native npx expo config --type prebuild
EXPO_PLATFORM=native npx expo export --platform ios --platform android --output-dir dist-native --max-workers 2
```

CI repeats these checks and runs a separate `npm audit --audit-level=high` gate.
The repository does not yet contain automated unit or device tests. JavaScript bundle success
does not establish native binary/device behavior.

Expo, React Native, React and native modules must be upgraded as a compatible SDK set.
Use `npx expo install --fix` after an intentional SDK change, then rerun Doctor and all checks.
Dependabot groups SDK patches and leaves major/minor SDK migrations for coordinated review.
Use a development build or an Expo Go version matching the project's SDK for native previews.

The current compatible set is Expo SDK 58, React Native 0.88.1, React 19.3.0 and
TypeScript 6.0.3. Web export explicitly remains a single-page application in `dist/`.
NativeWind stays on stable v4 with Tailwind CSS v3. Before a native release, rebuild the
development client and check maps, animations, navigation and device layout on iOS and Android:

```sh
EXPO_PLATFORM=native npm run android
EXPO_PLATFORM=native npm run ios
```

The SDK 54 compatibility checkpoint is preserved on
[`fix/expo54-security-checkpoint-2026-11-22`](https://github.com/amirmirmehrkar-git/DynoPrico/tree/fix/expo54-security-checkpoint-2026-11-22).
Its Expo validation passes, but its high-severity audit gate remains red. SDK 58 removes
the vulnerable old Router/Metro dependency chains without forcing incompatible transitive
package versions. See [dependency security status](SECURITY.md#dependency-security-status)
for the remaining upstream advisory.

Read [SECURITY.md](SECURITY.md) for the registry credential incident. Current source changes
cannot revoke historical credentials. CI does not require a private registry credential for
the current public dependency set, and this workflow contains no deployment or release step.
The connected Vercel integration can create a Preview when a feature branch is pushed;
that preview is separate from the `landing-page` production branch.

## Bilt project context

[![Built with Bilt](https://img.shields.io/endpoint?url=https%3A%2F%2Fapp.bilt.me%2Fapi%2Fbadge)](https://bilt.me)

## Project info

**Preview URL**: https://app.bilt.me/project/79607f9b-2cf0-4536-ba9c-813494035e0f/preview

**Project ID**: `79607f9b-2cf0-4536-ba9c-813494035e0f`

## How can I edit this app?

There are several ways of editing your application.

**Use Bilt**

Simply visit your [Bilt Project](https://app.bilt.me/agent/79607f9b-2cf0-4536-ba9c-813494035e0f) and start sending messages. Describe what you want to change, add, or fix in natural language.

Changes made via Bilt are instant - just send a message and your app updates.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can export the source code from Bilt and make changes directly.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Export and clone your Bilt project.
# (Download source from Bilt or connect to your git repo)
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the committed dependency versions.
npm ci

# Step 4: Start the Expo development server.
npx expo start
```

Use a development build or an Expo Go version that matches the installed SDK to preview on your phone.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- React Native
- Expo
- TypeScript
- AsyncStorage (local data persistence)
- Expo Router (navigation)

All generated automatically by Bilt from your natural language instructions.

## How can I test this project?

**Option 1: Instant Preview (Recommended)**

Open the preview URL in your browser: `https://app.bilt.me/project/79607f9b-2cf0-4536-ba9c-813494035e0f/preview`

Scan the QR code with Expo Go ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) on your phone.

**Option 2: Run Locally**

```sh
npm ci
npx expo start
```

Then scan the QR code with Expo Go.

## How can I deploy this project?

Go to your [Bilt Project](https://app.bilt.me/agent/79607f9b-2cf0-4536-ba9c-813494035e0f), after that go to Settings -> App Store.

### Deploy with Bilt

Simply send a message to your Bilt project: "Deploy this app to production"

Bilt will handle the build and provide you with download links or submission-ready builds.

## How can I make changes to my app?

**Via Bilt (Easiest)**

Visit your [Bilt Project](https://app.bilt.me/agent/79607f9b-2cf0-4536-ba9c-813494035e0f) and send a message describing what you want:

- "Add a dark mode toggle"
- "Change the button color to blue"
- "Add a new screen for user settings"
- "Fix the navigation bar spacing"

Bilt understands natural language and updates your app automatically.

**Via Code**

Export the source, make changes in your IDE, and test locally with `npx expo start`.

## Can I use this with the MCP protocol?

Yes! Bilt is available as a remote MCP server at `https://mcp.bilt.me/mcp`.

Connect any MCP-compatible AI agent (Claude Desktop, OpenClaw, etc.) to programmatically build and modify mobile apps.

**Example MCP integration:**

```json
{
  "mcpServers": {
    "bilt": {
      "transport": {
        "type": "sse",
        "url": "https://mcp.bilt.me/mcp/sse",
        "headers": {
          "Authorization": "Bearer YOUR_API_KEY"
        }
      }
    }
  }
}
```

Read more:

- [Bilt MCP Documentation](https://bilt.me/docs)
- [MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.buildingapplications%2Fmcp/versions/latest)

## Need help?

- 📚 [Bilt Documentation](https://bilt.me/docs)
- 💬 [Discord Community](https://discord.gg/3FqNgmSYdZ)
- 🐦 [Twitter Updates](https://twitter.com/biltmeanapp)
- 📧 Email: support@bilt.me

---

<div align="center">

**Built by AI. No code required.** ✨

[Try Bilt](https://bilt.me) • [View Docs](https://bilt.me/docs) • [Docs MCP Server](https://bilt.me/docs/mcp)

</div>
