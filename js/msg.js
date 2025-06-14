let BOT_TOKEN = '';
let USER_ID = '';
let lastMessageId = 0;
let messageDisplayedTime = Math.floor(Date.now() / 1000);
let hardcodedShown = false;
let initial_msg = '💬 hi baby';  // fallback message
let inactivityTimeoutId = null;

// ✅ Load config and initialize
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const config = await loadConfig();
    BOT_TOKEN = config.telegram_bot_token;
    USER_ID = parseInt(config.telegram_chat_id);

    // ✅ Load initial message from file
    try {
      const res = await fetch('Msg/message.txt');
      const text = await res.text();
      initial_msg = `💬 ${text.trim()}`;
      console.log('Loaded initial message:', initial_msg);
    } catch (e) {
      console.warn('Failed to load message.txt:', e);
    }

    // ✅ Start polling Telegram messages
    setInterval(fetchTelegramMessages, 1000);

    // ✅ Start inactivity timer
    // setupInactivityTimer();

  } catch (err) {
    console.error('❌ Failed to initialize msg.js:', err);
    alert("Something went wrong while loading the page. Redirecting...");
    window.location.href = "index.html"; // Optional: redirect on failure
  }
});

// ✅ Load settings from config
async function loadConfig() {
  const response = await fetch("settings/config.json");
  if (!response.ok) throw new Error("⚠️ Config load failed");
  return await response.json();
}

// ✅ Build Telegram API URL
function getTelegramURL(method) {
  return `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
}

// ✅ Send message to Telegram
function sendReply() {
  const reply = document.getElementById('replyBox').value.trim();
  if (!reply) return;

  fetch(getTelegramURL('sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: USER_ID, text: reply })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        document.getElementById('replyBox').value = '';
        const bubble = document.createElement('div');
        bubble.className = 'bubble yours';
        bubble.textContent = `🧡 ${reply}`;
        document.getElementById('live-replies').appendChild(bubble);
        scrollToBottom();
      }
    })
    .catch((err) => console.error('Send error:', err));
}

// ✅ Fetch messages from Telegram
async function fetchTelegramMessages() {
  try {
    const res = await fetch(getTelegramURL('getUpdates'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offset: lastMessageId + 1 })
    });

    const data = await res.json();
    if (!data.ok || !data.result) return;

    let messageShown = false;

    for (const update of data.result) {
      const m = update.message;
      if (!m || !m.text) continue;

      if (m.chat && m.chat.id === USER_ID && m.date > messageDisplayedTime) {
        lastMessageId = m.message_id;
        messageDisplayedTime = m.date;

        const bubble = document.createElement('div');
        bubble.className = 'bubble hers';
        bubble.textContent = `💬 ${m.text}`;
        document.getElementById('live-replies').appendChild(bubble);
        scrollToBottom();

        console.log('✅ Message shown in UI:', m.text);
        messageShown = true;
      }
    }

    // ✅ Show fallback message only once
    if (!messageShown && !hardcodedShown) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble hers';
      bubble.textContent = initial_msg;
      document.getElementById('live-replies').appendChild(bubble);
      scrollToBottom();
      hardcodedShown = true;

      console.log('✅ Fallback message shown:', initial_msg);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

// ✅ Scroll to bottom of chat
function scrollToBottom() {
  const chatBox = document.getElementById('live-replies');
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ✅ Inactivity logout logic
// function setupInactivityTimer() {
//   const logout = () => {
//     sessionStorage.clear();
//     alert("⏰ You were inactive. Session expired.");
//     window.location.href = "index.html";
//   };

//   const resetTimer = () => {
//     clearTimeout(inactivityTimeoutId);
//     inactivityTimeoutId = setTimeout(logout, 2 * 60 * 1000); // 2 minutes
//   };

//   // Add user activity listeners once
//   if (!window._inactivityListenerAttached) {
//     ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(evt => {
//       document.addEventListener(evt, resetTimer, false);
//     });
//     window._inactivityListenerAttached = true;
//   }

//   resetTimer(); // Start initial timer
// }
