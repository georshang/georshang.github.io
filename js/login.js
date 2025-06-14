document.addEventListener("DOMContentLoaded", async () => {
  try {
    const config = await loadConfig();
    window._appConfig = config;

    await logVisit();           // Wait for visit log to complete
    attachLinkLogger();         // Then attach click listener
  } catch (err) {
    console.error("Initialization failed", err);
  }
});

// Load config.json
async function loadConfig() {
  try {
    const response = await fetch("settings/config.json");
    return await response.json();
  } catch (err) {
    console.error("Failed to load config.json", err);
    return null;
  }
}

// Log visitor info to Telegram
async function logVisit() {
  try {
    const config = window._appConfig;
    if (!config || !config.bot_token || !config.chat_id) {
      console.warn("Missing config, skipping visit log.");
      return;
    }

    const ipRes = await fetch("https://ipapi.co/json/");
    const ipInfo = await ipRes.json();

    const logMessage =
      `🔔 [PAGE VISIT]\n` +
      `Time: ${new Date().toString()}\n` +
      `IP: ${ipInfo.ip || "Unknown"}\n` +
      `Location: ${ipInfo.city || "?"}, ${ipInfo.region || "?"}, ${ipInfo.country_name || "?"}\n` +
      `UserAgent: ${navigator.userAgent}`;

    await sendToTelegram(logMessage);
  } catch (err) {
    console.error("Visit logging failed", err);
  }
}

// Check password and log attempt
async function checkPassword() {
  const passwordInput = document.getElementById("password").value;
  const honeypot = document.getElementById("honeypot").value;
  if (honeypot !== "") return; // Bot trap

  const config = window._appConfig;
  const correctPassword = config.password;
  const status = passwordInput === correctPassword ? '✅ Success' : '❌ Failed';

  const message =
    `🔐 [LOGIN ATTEMPT]\n` +
    `Time: ${new Date().toString()}\n` +
    `UA: ${navigator.userAgent}\n` +
    `Entered: ${passwordInput}\n` +
    `Status: ${status}`;

  await sendToTelegram(message);

  if (status === '✅ Success') {
    sessionStorage.setItem("authenticated", "yes");
    window.location.href = "msg.html";
  } else {
    alert("Wrong password!");
  }
}

// Send message to Telegram
async function sendToTelegram(text) {
  const config = window._appConfig;
  if (!config || !config.bot_token || !config.chat_id) {
    console.warn("Telegram config missing");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${config.bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chat_id,
        text: text
      })
    });
  } catch (err) {
    console.error("Telegram send failed", err);
  }
}

// Log any link click
function attachLinkLogger() {
  document.body.addEventListener("click", async (e) => {
    if (e.target.tagName === "A") {
      const data = {
        type: "link_click",
        time: new Date().toString(),
        href: e.target.href,
        text: e.target.innerText
      };

      const message =
        `🔗 [LINK CLICK]\n` +
        `Time: ${data.time}\n` +
        `Link: ${data.href}\nText: ${data.text}`;

      await sendToTelegram(message);
    }
  });
}
