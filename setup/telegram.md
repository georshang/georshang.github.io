# 💬 Telegram Bot Setup Guide

This guide helps you set up a Telegram bot to receive logs from your love-site project.
It will notify you when someone:
- Enters the correct password ✅
- Enters the wrong password ❌
- Sends you a reply 💬

## 🛠️ Step 1: Create a Telegram Bot

1. Open Telegram and search for **[@BotFather](https://t.me/BotFather)**.
2. Send the following commands:
   - `/start`
   - `/newbot`
3. Follow the prompts:
   - Set a **name** (e.g., `MyLoveBot`)
   - Set a **username** (must end with `bot`, e.g., `geolove_bot`)
4. BotFather will give you a token:

   ```
   123456789:ABCdefGhIJKlmNoPQRstuvWXyZ
   ```

✅ **Copy this token** — it’s your `BOT_TOKEN`.

## 💬 Step 2: Activate the Bot

1. Open a new chat with your bot using its username (e.g., `@geolove_bot`)
2. Click **Start** or send any message (like `Hi`)  
3. This will activate the bot so it can send you messages

## 🔍 Step 3: Get Your `chat_id`

1. Visit the following URL in your browser (replace `YOUR_BOT_TOKEN` with the one from BotFather):

   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```

2. In the JSON response, look for:

   ```json
   "chat": {
     "id": 987654321,
     "first_name": "YourName",
     ...
   }
   ```

✅ **Copy the `id`** — that’s your `CHAT_ID`.

## ✅ Step 4: Update Your Script

In your `js/script.js` file, set your bot token and chat ID:

```javascript
const TELEGRAM_BOT_TOKEN = '123456789:ABCdefGhIJKlmNoPQRstuvWXyZ';
const TELEGRAM_CHAT_ID = '987654321';
```

## 🧪 Step 5: Test

- Enter a **wrong password** → you should get a ❌ message on Telegram  
- Enter the **correct password** → you should get a ✅ success log  
- Submit a **reply** → the message should arrive via your bot 💬

## 📌 Notes

- Your bot can only message **users who started a chat with it**
- If you want to log to a **Telegram group**:
  1. Add the bot to your group
  2. Send a message in the group
  3. Use `getUpdates` to retrieve the `chat.id` (usually starts with `-`)
- The bot supports text-only messages via the API

---

Happy Logging ❤️