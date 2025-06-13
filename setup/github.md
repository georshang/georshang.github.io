# 🌐 GitHub Pages Deployment Guide

This guide explains how to host your **glassic love website** using **GitHub Pages** — for free!

---

## ✅ Step 1: Prepare Your Folder

Your folder should be structured like this:

my-love-site/
├── index.html
├── css/
│ └── style.css
├── js/
│ └── script.js
├── Msg/
│ └── message.txt
├── settings/
│ └── config.json
└── setup/
├── telegram.md
└── github-pages.md


---

## 🔃 Step 2: Initialize Git Repo

Inside your `my-love-site` directory:

```bash
git init
git add .
git commit -m "Initial commit"

```

## ☁️ Step 3: Create GitHub Repository

Go to https://github.com

Create a new repository (public or private)

DO NOT initialize with README, .gitignore, or license

## 🚀 Step 4: Push Your Code

In terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 🌍 Step 5: Enable GitHub Pages

Go to your repository on GitHub

Click Settings → Pages

Under "Source", select:

Branch: main

Folder: / (root)

Click Save

Your site will be live at:

```bash
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

## 🧪 Step 6: Test the Site

Visit the URL

Enter your password

Check Telegram logs

Reply with a message

## 📌 Notes
GitHub Pages can’t run PHP or server-side code, so all logic must be done in JavaScript

Make sure your settings/config.json is included and public

Avoid exposing sensitive secrets in config.json (Telegram tokens can be rotated)

Enjoy your romantic web app ❤️



Let me know if you want me to also generate this file later when download tools are re-enabled.