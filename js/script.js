document.addEventListener("DOMContentLoaded", async () => {
  const config = await loadConfig();
  window._appConfig = config;

  if (window.location.pathname.endsWith("msg.html")) {
    if (sessionStorage.getItem("authenticated") !== "yes") {
      window.location.href = "index.html";
      return;
    } else {
      showMessage(); // Only show message if session is valid
    }
  } else {
    logVisit();          // Only log visit for login page
    attachLinkLogger();  // Attach click listener
  }
});

// Load config.json
async function loadConfig() {
  const response = await fetch("settings/config.json");
  return await response.json();
}

// Log when user visits the login page
async function logVisit() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const info = await res.json();

    const logData = {
      type: "page_visit",
      time: new Date().toISOString(),
      ip: info.ip,
      location: `${info.city}, ${info.region}, ${info.country_name}`,
      ua: navigator.userAgent
    };

    await logToTelegram(logData);
  } catch (err) {
    console.error("Visit log failed", err);
  }
}

// Check password input
async function checkPassword() {
  const pwd = document.getElementById("password").value;
  const honeypot = document.getElementById("honeypot").value;
  const config = window._appConfig;

  if (honeypot !== "") return;

  const isCorrect = pwd === config.password;

  const logData = {
    type: "password_attempt",
    time: new Date().toISOString(),
    password_entered: pwd,
    correct: isCorrect
  };

  await logToTelegram(logData);

  if (isCorrect) {
    sessionStorage.setItem("authenticated", "yes");
    window.location.href = "msg.html";
  } else {
    alert("Incorrect password 💔");
  }
}

// Show message after password success
async function showMessage() {
  try {
    const response = await fetch("Msg/message.txt");
    const message = await response.text();
    const messageEl = document.getElementById("message");
    if (messageEl) {
      messageEl.textContent = message;
    }
  } catch (err) {
    console.error("Failed to load message", err);
  }
}

// Send reply to Telegram
async function sendReply() {
  const reply = document.getElementById("replyBox").value;

  const data = {
    type: "reply",
    time: new Date().toISOString(),
    message: reply
  };

  await logToTelegram(data);
  alert("Reply sent 💌");
}

// Attach event listener to all links
function attachLinkLogger() {
  document.body.addEventListener("click", async (e) => {
    if (e.target.tagName === "A") {
      const data = {
        type: "link_click",
        time: new Date().toISOString(),
        href: e.target.href,
        text: e.target.innerText
      };
      await logToTelegram(data);
    }
  });
}

// Log data to Telegram bot
async function logToTelegram(data) {
  const config = window._appConfig;

  let text = "";

  switch (data.type) {
    case "page_visit":
      text =
        `🔔 [PAGE VISIT]\n` +
        `Time: ${data.time}\n` +
        `IP: ${data.ip}\n` +
        `Location: ${data.location}\n` +
        `UserAgent: ${data.ua}`;
      break;

    case "password_attempt":
      text =
        `🔐 [PASSWORD ATTEMPT]\n` +
        `Time: ${data.time}\n` +
        `Entered: ${data.password_entered}\n` +
        `Status: ${data.correct ? "✅ Correct" : "❌ Wrong"}`;
      break;

    case "reply":
      text =
        `💌 [REPLY]\n` +
        `Time: ${data.time}\n` +
        `Reply: ${data.message}`;
      break;

    case "link_click":
      text =
        `🔗 [LINK CLICK]\n` +
        `Time: ${data.time}\n` +
        `Link: ${data.href}\nText: ${data.text}`;
      break;

    default:
      text = JSON.stringify(data, null, 2);
  }

  try {
    await fetch(`https://api.telegram.org/bot${config.telegram_bot_token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: config.telegram_chat_id, text })
    });
  } catch (err) {
    console.error("Telegram log failed", err);
  }
}
