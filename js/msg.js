window.onload = async function () {
  const messageEl = document.getElementById("message");
  const statusMsg = document.getElementById("status-msg");

  try {
    const response = await fetch("Msg/message.txt");
    const text = await response.text();
    messageEl.textContent = text;
  } catch (err) {
    console.error("Failed to load message:", err);
    messageEl.textContent = "❌ Failed to load message.";
  }

  setupInactivityTimer();
};

async function sendReply() {
  const replyBox = document.getElementById("replyBox");
  const reply = replyBox.value.trim();
  const statusMsg = document.getElementById("status-msg");

  if (!reply) {
    statusMsg.textContent = "⚠️ Please write a message first.";
    statusMsg.style.color = "#ff5f5f";
    return;
  }

  const data = {
    type: "reply",
    time: getIndianTime(),
    message: reply
  };

  const config = await loadConfig();
  try {
    await fetch(`https://api.telegram.org/bot${config.telegram_bot_token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: config.telegram_chat_id, text: formatReply(data) })
    });

    statusMsg.textContent = "✅ Your reply has been sent 💌";
    statusMsg.style.color = "#5fda5f";
    replyBox.value = "";
  } catch (err) {
    console.error("Failed to send reply", err);
    statusMsg.textContent = "❌ Failed to send reply.";
    statusMsg.style.color = "#ff5f5f";
  }
}

function formatReply(data) {
  return `💌 [REPLY]\nTime: ${data.time}\nMessage: ${data.message}`;
}

function getIndianTime() {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false
  });
}

async function loadConfig() {
  const response = await fetch("settings/config.json");
  return await response.json();
}

// ------------------- Inactivity Auto-Logout -------------------

function setupInactivityTimer() {
  let timeout;
  const logout = () => {
    sessionStorage.clear();
    alert("⏰ You were inactive. Session expired.");
    window.location.href = "index.html";
  };

  const resetTimer = () => {
    clearTimeout(timeout);
    timeout = setTimeout(logout, 60 * 1000); // 1 minute
  };

  // Reset timer on user interaction
  ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(evt => {
    document.addEventListener(evt, resetTimer, false);
  });

  resetTimer(); // Start timer initially
}
