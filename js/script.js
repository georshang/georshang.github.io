let PASSWORD = "";
let TELEGRAM_BOT_TOKEN = "";
let TELEGRAM_CHAT_ID = "";

document.addEventListener("DOMContentLoaded", () => {
  fetch("settings/config.json")
    .then(response => response.json())
    .then(config => {
      PASSWORD = config.PASSWORD;
      TELEGRAM_BOT_TOKEN = config.TELEGRAM_BOT_TOKEN;
      TELEGRAM_CHAT_ID = config.TELEGRAM_CHAT_ID;
    })
    .catch(err => {
      console.error("Failed to load config.json:", err);
      alert("Site misconfigured. Please check settings.");
    });
});

function sendTelegramLog(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(ipData => {
      const logMessage = `
🔔 *Access Log*
-----------------------
🕒 Time: ${new Date().toLocaleString()}
🌐 IP: ${ipData.ip}
📍 Location: ${ipData.city}, ${ipData.region}, ${ipData.country_name}
📱 ISP: ${ipData.org}
🖥️ Browser: ${navigator.userAgent}

📩 Event: ${message}
      `.trim();

      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: logMessage,
          parse_mode: "Markdown"
        })
      });
    })
    .catch(err => {
      console.warn("Could not fetch IP info:", err);
    });
}

function checkPassword() {
  const entered = document.getElementById("password").value;
  const honeypot = document.getElementById("honeypot").value;

  if (honeypot) {
    sendTelegramLog("⚠️ Bot suspected (honeypot triggered).");
    return;
  }

  if (entered === PASSWORD) {
    fetch("Msg/message.txt")
      .then(response => response.text())
      .then(message => {
        document.getElementById("login").style.display = "none";
        document.getElementById("messagePage").style.display = "block";
        document.getElementById("message").innerText = message;
        sendTelegramLog("✅ Correct password entered and message displayed.");
      })
      .catch(() => {
        alert("Couldn't load message.");
      });
  } else {
    alert("Wrong password!");
    sendTelegramLog("❌ Wrong password attempt: `" + entered + "`");
  }
}

function sendReply() {
  const reply = document.getElementById("replyBox").value.trim();
  if (!reply) {
    alert("Please type your reply before sending.");
    return;
  }

  const replyMessage = `
💬 *New Reply Received*
-----------------------
🕒 Time: ${new Date().toLocaleString()}
📩 Message:
${reply}
  `.trim();

  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: replyMessage,
      parse_mode: "Markdown"
    })
  });

  alert("Your reply was sent ❤️");
  document.getElementById("replyBox").value = "";
}
