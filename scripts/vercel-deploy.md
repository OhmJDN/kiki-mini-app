# Vercel Deployment Instructions

Since you wanted to deploy this via Vercel MCP / CLI, here are the exact steps to deploy the frontend to Vercel right from your terminal.

## Prerequisites
You must have the Vercel CLI installed. If you don't have it, run this command in your terminal:
```bash
npm i -g vercel
```

## How to Deploy

1. Open your terminal in the `KIKI Project` directory.
2. Run the deployment command:
```bash
vercel
```
3. Follow the interactive prompts:
   - **Set up and deploy?** -> Press `Y` (Yes)
   - **Which scope do you want to deploy to?** -> Select your personal Vercel account.
   - **Link to existing project?** -> Press `N` (No)
   - **What's your project's name?** -> Press Enter to accept `kiki-project` (or type a new name).
   - **In which directory is your code located?** -> Press Enter to accept `./`
   - **Want to modify these settings?** -> Press `N` (No)

4. Vercel will build and upload your project. Once finished, it will provide a **Preview URL**.
5. To deploy this to **Production**, run:
```bash
vercel --prod
```

Your Landing Page is now live!
