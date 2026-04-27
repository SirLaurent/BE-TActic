// 🪖 BE TActic - Gestione Feed

document.addEventListener("DOMContentLoaded", () => {
  const feedContainer = document.getElementById("feedContainer");
  const postContent = document.getElementById("postContent");
  const postType = document.getElementById("postType");
  const publishBtn = document.getElementById("publishBtn");
  const charCount = document.getElementById("charCount");

  // Simula utente loggato (in futuro prenderemo da sessione/cookie)
  const CURRENT_USER = localStorage.getItem("beTactic_user") || "Ospite";

  // Aggiorna contatore caratteri
  postContent.addEventListener("input", () => {
    charCount.textContent = `${postContent.value.length}/500`;
  });

  // Carica feed all'avvio
  loadFeed();

  // Pubblica nuovo post
  publishBtn.addEventListener("click", async () => {
    const content = postContent.value.trim();
    if (!content) return alert("Scrivi qualcosa prima di pubblicare!");

    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: CURRENT_USER,
          content,
          type: postType.value,
        }),
      });

      if (res.ok) {
        postContent.value = "";
        charCount.textContent = "0/500";
        loadFeed(); // Ricarica feed con nuovo post
      } else {
        const err = await res.json();
        alert("❌ " + err.message);
      }
    } catch (e) {
      console.error(e);
      alert("Errore di rete");
    }
  });

  // Event Delegation: gestisce click su like/commenti (anche post futuri)
  feedContainer.addEventListener("click", async (e) => {
    const likeBtn = e.target.closest(".like-btn");
    const commentToggle = e.target.closest(".comment-toggle");
    const commentSubmit = e.target.closest(".comment-submit");

    if (likeBtn) {
      const postId = likeBtn.dataset.id;
      await fetch(`/api/feed/${postId}/like`, { method: "POST" });
      likeBtn.querySelector("span").textContent =
        parseInt(likeBtn.querySelector("span").textContent) + 1;
    }

    if (commentToggle) {
      const section = commentToggle
        .closest(".post-card")
        .querySelector(".comments-section");
      section.classList.toggle("active");
    }

    if (commentSubmit) {
      const card = commentSubmit.closest(".post-card");
      const postId = card.querySelector(".like-btn").dataset.id;
      const input = card.querySelector(".comment-input");
      const text = input.value.trim();
      if (!text) return;

      await fetch(`/api/feed/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: CURRENT_USER, text }),
      });

      input.value = "";
      loadFeed(); // Ricarica per mostrare commento
    }
  });

  // Funzione caricamento feed
  async function loadFeed() {
    try {
      const res = await fetch("/api/feed");
      const posts = await res.json();

      feedContainer.innerHTML = "";
      if (posts.length === 0) {
        feedContainer.innerHTML =
          '<p class="loading-msg">📭 Nessun post ancora. Sii il primo!</p>';
        return;
      }

      posts.forEach((post) => {
        const card = document.createElement("article");
        card.className = "post-card";
        card.innerHTML = `
          <div class="post-meta">
            <span>👤 ${post.author}</span>
            <span class="post-type-badge">${post.type.toUpperCase()}</span>
            <span>🕒 ${new Date(post.createdAt).toLocaleString("it-IT")}</span>
          </div>
          <p class="post-content">${post.content.replace(/\n/g, "<br>")}</p>
          <div class="post-actions-bar">
            <button class="action-btn like-btn" data-id="${post.id}">👍 <span>${post.likes}</span></button>
            <button class="action-btn comment-toggle">💬 Commenti (${post.comments.length})</button>
          </div>
          <div class="comments-section">
            ${post.comments
              .map(
                (c) => `
              <div class="comment">
                <span class="comment-author">${c.author}</span>: ${c.text}
                <span class="comment-time">${new Date(c.createdAt).toLocaleTimeString("it-IT")}</span>
              </div>
            `,
              )
              .join("")}
            <div class="comment-input-wrap">
              <input type="text" class="comment-input" placeholder="Scrivi un commento..." />
              <button class="action-btn comment-submit">Invia</button>
            </div>
          </div>
        `;
        feedContainer.appendChild(card);
      });
    } catch (e) {
      feedContainer.innerHTML =
        '<p style="color:var(--color-error)">❌ Errore caricamento feed</p>';
    }
  }
});
