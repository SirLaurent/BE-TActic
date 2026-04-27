// 🪖 BE TActic - Gestione Squadre

document.addEventListener("DOMContentLoaded", () => {
  const CURRENT_USER = localStorage.getItem("beTactic_user") || "Ospite";

  // Carica dati all'avvio
  loadTeams();
  loadMyTeam();

  // Crea squadra
  document
    .getElementById("createTeamForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("teamName").value.trim();
      const desc = document.getElementById("teamDesc").value.trim();
      const max = document.getElementById("teamMax").value;

      try {
        const res = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creator: CURRENT_USER,
            name,
            description: desc,
            maxMembers: max,
          }),
        });

        if (res.ok) {
          alert("✅ Squadra creata con successo!");
          e.target.reset();
          loadTeams();
          loadMyTeam();
        } else {
          const err = await res.json();
          alert("❌ " + err.message);
        }
      } catch (e) {
        alert("Errore di rete");
      }
    });

  async function loadTeams() {
    try {
      const res = await fetch("/api/teams");
      const teams = await res.json();
      const container = document.getElementById("teamsListContainer");

      if (teams.length === 0) {
        container.innerHTML =
          '<p style="color:var(--color-text-muted)">Nessuna squadra creata. Sii il primo!</p>';
        return;
      }

      container.innerHTML = teams
        .map(
          (t) => `
        <div class="team-card">
          <div class="team-info">
            <h4>${t.name}</h4>
            <p>${t.membersCount}/${t.maxMembers} membri</p>
          </div>
          <button class="join-btn" data-name="${t.name}" ${t.membersCount >= t.maxMembers ? "disabled" : ""}>
            ${t.membersCount >= t.maxMembers ? "🔒 Piena" : "🤝 Unisciti"}
          </button>
        </div>
      `,
        )
        .join("");

      // Event delegation per join
      container.querySelectorAll(".join-btn:not([disabled])").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!confirm(`Vuoi unirti a ${btn.dataset.name}?`)) return;
          try {
            const res = await fetch(`/api/teams/${btn.dataset.name}/join`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nickname: CURRENT_USER }),
            });
            if (res.ok) {
              alert("✅ Unit alla squadra!");
              loadTeams();
              loadMyTeam();
            } else {
              const err = await res.json();
              alert("❌ " + err.message);
            }
          } catch {
            alert("Errore di rete");
          }
        });
      });
    } catch {
      document.getElementById("teamsListContainer").innerHTML =
        '<p style="color:var(--color-error)">❌ Errore caricamento</p>';
    }
  }

  async function loadMyTeam() {
    if (CURRENT_USER === "Ospite") return;
    try {
      const res = await fetch(`/api/teams/user/${CURRENT_USER}`);
      if (!res.ok) {
        document.getElementById("myTeamSection").classList.add("hidden");
        return;
      }
      const team = await res.json();
      document.getElementById("myTeamSection").classList.remove("hidden");

      const membersHtml = team.members
        .map((m) => {
          const roleClass = `role-${m.role.toLowerCase()}`;
          return `<span class="${roleClass}">${m.nickname}</span> (${m.role})`;
        })
        .join(" • ");

      document.getElementById("myTeamInfo").innerHTML = `
        <h3 style="color:var(--color-primary)">${team.name}</h3>
        <p>${team.description}</p>
        <div class="member-list">👥 ${membersHtml}</div>
      `;
    } catch {
      // Fallback silenzioso
    }
  }
});
