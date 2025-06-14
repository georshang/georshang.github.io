let BOT_TOKEN = '7520005562:AAETRfAuXhZXOQhuBQXL1pbT4PEGWE_7exk';  // Replace with actual bot token
let USER_ID = 6138777908;  // Replace with your girlfriend's chat ID
let lastMessageId = 0;
let messageDisplayedTime = Math.floor(Date.now() / 1000);
let hardcodedShown = false;
let initial_msg = '💬 hi baby';  // Default fallback in case file fails

// ✅ Load initial_msg from message.txt
fetch('Msg/message.txt')
  .then((res) => res.text())
  .then((text) => {
    initial_msg = `💬 ${text.trim()}`;
    console.log('Loaded initial message:', initial_msg);
  })
  .catch((err) => {
    console.error('Error loading initial message.txt:', err);
  });

function getTelegramURL(method) {
  return `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
}

// ✅ Send reply to Telegram
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
      }
    })
    .catch((err) => console.error('Send error:', err));
}

// ✅ Fetch new messages and show in UI
async function fetchTelegramMessages() {
  try {
    const res = await fetch(getTelegramURL('getUpdates'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offset: lastMessageId + 1 })
    });

    const data = await res.json();
    console.log('Telegram raw response:', data);

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
        document.getElementById('live-replies').scrollTop =
          document.getElementById('live-replies').scrollHeight;

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
      document.getElementById('live-replies').scrollTop =
        document.getElementById('live-replies').scrollHeight;
      hardcodedShown = true;

      console.log('✅ Fallback message shown:', initial_msg);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

setInterval(fetchTelegramMessages, 1000);
