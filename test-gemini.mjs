const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=AIzaSyAH9ATLxCRY12qi22PyCkh043iIt5gsCM8`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "Say hello" }] }]
    })
  }
);
const data = await response.json();
console.log(JSON.stringify(data, null, 2));