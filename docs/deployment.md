# SheStarts Deployment Guide (Vercel & Render)

SheStarts is a lightweight, high-performance Single Page Application (SPA) built without any build tools or external dependencies. Its static architecture enables quick, hassle-free deployment on modern hosting platforms such as **Vercel** and **Render**.

---

# Option 1: Deploy on Vercel

Vercel provides one of the fastest and simplest ways to deploy static web applications with zero configuration.

## Method A: Deploy Using Vercel CLI (No Git Required)

1. Install the Vercel CLI globally:

   ```bash
   npm install -g vercel
   ```

2. Open a terminal and navigate to the project's root directory (`shestarts`).

3. Run the deployment command:

   ```bash
   vercel
   ```

4. Follow the interactive prompts (the default options are recommended).

5. Once the deployment is complete, Vercel will provide a live production URL for your application.

---

## Method B: Deploy via GitHub Integration

1. Push the project to your GitHub repository.
2. Sign in to **Vercel**.
3. Click **Add New → Project**.
4. Select your GitHub repository.
5. Vercel will automatically detect the project as a static website.
6. Leave the default build settings unchanged and click **Deploy**.
7. After deployment, your application will be available through a public Vercel URL.

---

# Option 2: Deploy on Render

Render offers reliable and free static site hosting with automatic deployments from GitHub.

## Deployment Steps

1. Push your project to a GitHub repository.
2. Sign in to the **Render Dashboard**.
3. Click **New → Static Site**.
4. Connect your GitHub repository.
5. Configure the deployment settings as follows:

| Setting               | Value              |
| --------------------- | ------------------ |
| **Build Command**     | Leave blank        |
| **Publish Directory** | `.` (Project Root) |

6. Click **Create Static Site**.
7. Render will automatically deploy the application and provide a public URL. Future commits pushed to the connected GitHub repository will trigger automatic redeployments.

---

## Project Configuration

Since **SheStarts** is a fully static Single Page Application (SPA):

* No build process is required.
* No package installation is necessary.
* No environment variables are required.
* Deployment is completed directly from the project files.

Both **Vercel** and **Render** automatically recognize the project as a static website, enabling a seamless deployment experience with minimal configuration.
