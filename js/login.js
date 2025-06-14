document.addEventListener("DOMContentLoaded", async () => {
  try {
    const config = await loadConfig();
    window._appConfig = config;

    const pathname = window.location.pathname;
    const passwordInput = document.getElementById("password");
    const errorMsgEl = document.getElementById("error-msg");

    if (passwordInput && errorMsgEl) {
      passwordInput.addEventListener("input", () => {
        errorMsgEl.textContent = "";
      });
    }

    if (pathname.endsWith("msg.html")) {
      validateSession();
    } else {
      logVisit();
    }
  } catch (e) {
    console.error("❌ Failed to load config:", e);
    alert("⚠️ Failed to load configuration. Please try again later.");
  }
});

// ------------------ Load Config ------------------

async function loadConfig() {
  const response = await fetch("settings/config.json");
  if (!response.ok) throw new Error("Config load failed");
  return await response.json();
}

// ------------------ Login & Auth ------------------

async function checkPassword() {
  const pwd = document.getElementById("password").value;
  const honeypot = document.getElementById("honeypot").value;
  const errorMsgEl = document.getElementById("error-msg");
  const config = window._appConfig;

  if (honeypot !== "") return;

  const passwordList = Array.isArray(config.password)
    ? config.password.map(item => (typeof item === "string" ? item : item[0]))
    : [config.password];

  const isCorrect = passwordList.includes(pwd);

  const logData = {
    type: "password_attempt",
    time: getIndianTime(),
    password_entered: pwd,
    correct: isCorrect
  };

  await logToTelegram(logData);

  if (isCorrect) {
    sessionStorage.setItem("authenticated", "yes");
    window.location.href = "msg.html";
  } else {
    errorMsgEl.textContent = "💔 Incorrect password. Try again.";
  }
}

// ------------------ Session Handling ------------------

function validateSession() {
  const auth = sessionStorage.getItem("authenticated");

  if (!auth) {
    alert("⏰ Session expired. Please login again.");
    redirectToLogin();
    return;
  }
}

function redirectToLogin() {
  window.location.href = "index.html";
}

// ------------------ Telegram Logging ------------------

async function logToTelegram(data) {
  const config = window._appConfig;
  let text = "";

  switch (data.type) {
    case "page_visit":
      text = `🔔 [PAGE VISIT]\nTime: ${data.time}\nIP: ${data.ip}\nLocation: ${data.location}\nUA: ${data.ua}`;
      break;
    case "password_attempt":
      text = `🔐 [PASSWORD ATTEMPT]\nTime: ${data.time}\nPassword: ${data.password_entered}\nStatus: ${data.correct ? "✅ Correct" : "❌ Wrong"}`;
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

// ------------------ Visit Logging ------------------

async function logVisit() {
  try {
    const info = await fetch(`https://ipinfo.io/json?token=${window._appConfig.ipinfo_token}`).then(r => r.json());
    const logData = {
      type: "page_visit",
      time: getIndianTime(),
      ip: info.ip,
      location: `${info.city}, ${info.region}, ${info.country}`,
      ua: navigator.userAgent
    };
    await logToTelegram(logData);
  } catch (err) {
    console.error("Visit log failed", err);
  }
}

// ------------------ Utility ------------------

function getIndianTime() {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false
  });
}
