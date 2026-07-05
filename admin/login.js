const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      message.style.color = "green";
      message.textContent = "Login réussi...";

      // تعديل هنا: حفظ المفتاح باسم adminToken ليتوافق مع لوحة التحكم
      localStorage.setItem("adminToken", data.token);

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);

    } else {
      message.style.color = "red";
      message.textContent = data.message;
    }

  } catch (err) {
    message.style.color = "red";
    message.textContent = "Erreur serveur";
  }
});