const state = {
  screen: "signup",
  playerName: "Alex Starfall",
  xp: 840,
  coins: 350,
  level: 8,
  avatar: {
    hair: 1,
    face: 1,
    eyes: 1,
    outfit: 1,
  },
  category: "School",
};

const avatarStyles = {
  hair: ["✦", "✹", "✧", "◌"],
  face: ["◉", "◎", "◍", "◐"],
  eyes: ["◔◔", "◕◕", "●●", "✧✧"],
  outfit: ["⌁", "⌬", "⌇", "⬟"],
};

const avatarTitles = {
  1: "Forest Sage",
  2: "Sky Ranger",
  3: "Crystal Mage",
  4: "Star Knight",
};

const screenOrder = [
  "signup",
  "avatar",
  "category",
  "map",
  "kingdom",
  "missions",
  "quiz",
  "rewards",
  "dashboard",
  "boss",
  "leaderboard",
  "battle",
  "tournament",
  "premium",
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const toast = $("#toast");
const rewardModal = $("#rewardModal");
const levelModal = $("#levelModal");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function openModal(modal) {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function setScreen(screen) {
  state.screen = screen;
  $$(".screen").forEach((section) => section.classList.remove("active"));
  $(`#screen-${screen}`).classList.add("active");
  $$(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.screen === screen);
  });
}

function syncHeader() {
  $("#topLevel").textContent = state.level;
  $("#topXp").textContent = state.xp;
  $("#topCoins").textContent = state.coins;
  $("#playerName").textContent = state.playerName;
  $("#dashboardName").textContent = state.playerName;
  const initials = state.playerName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  $("#sidebarAvatar").textContent = initials;
  $("#dashboardAvatar").textContent = initials;
  $("#playerTag").textContent = `${state.category} Champion`;
}

function updateAvatar() {
  const { hair, face, eyes, outfit } = state.avatar;
  $("#hairLayer").textContent = avatarStyles.hair[hair - 1];
  $("#faceLayer").textContent = avatarStyles.face[face - 1];
  $("#eyesLayer").textContent = avatarStyles.eyes[eyes - 1];
  $("#outfitLayer").textContent = avatarStyles.outfit[outfit - 1];
  $("#hairValue").textContent = hair;
  $("#faceValue").textContent = face;
  $("#eyesValue").textContent = eyes;
  $("#outfitValue").textContent = outfit;
  $("#avatarTitle").textContent = avatarTitles[outfit] || "Quest Hero";
  $("#avatarMood").textContent = `${state.category} · Ready for quests`;
}

function cyclePart(part, delta) {
  const total = avatarStyles[part].length;
  const next = ((state.avatar[part] - 1 + delta + total) % total) + 1;
  state.avatar[part] = next;
  updateAvatar();
}

function addProgress(xpGain, coinGain) {
  const previousLevel = state.level;
  state.xp += xpGain;
  state.coins += coinGain;
  state.level = Math.floor(state.xp / 100);
  syncHeader();
  if (state.level > previousLevel) {
    openModal(levelModal);
    showToast(`Level up! You reached level ${state.level}.`);
  } else {
    showToast(`+${xpGain} XP and +${coinGain} coins`);
  }
}

function initNav() {
  $$("#navGrid .nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => setScreen(btn.dataset.screen));
  });

  $$("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => setScreen(btn.dataset.next));
  });
}

function initSignup() {
  $("#signupBtn").addEventListener("click", () => {
    const name = $("#signupName").value.trim() || "Quest Hero";
    state.playerName = name;
    syncHeader();
    showToast("Account created. Welcome to Quest Academy.");
    setScreen("avatar");
  });
}

function initAvatar() {
  $$("[data-part]").forEach((btn) => {
    btn.addEventListener("click", () => {
      cyclePart(btn.dataset.part, Number(btn.dataset.dir));
    });
  });

  $("#createAvatarBtn").addEventListener("click", () => {
    showToast("Avatar created and saved.");
    setScreen("category");
  });

  $("#avatarPrev").addEventListener("click", () => setScreen("signup"));
}

function initCategory() {
  $$(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      $$(".category-card").forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
      state.category = card.dataset.category;
      syncHeader();
      updateAvatar();
      showToast(`${state.category} path selected.`);
    });
  });
}

function initMap() {
  $$(".kingdom-node").forEach((node) => {
    node.addEventListener("click", () => {
      showToast(`${node.dataset.kingdom} opened.`);
      setScreen("kingdom");
    });
  });
}

function initMissions() {
  $$(".mission-play").forEach((btn) => {
    btn.addEventListener("click", () => {
      setScreen("quiz");
      showToast("Mission loaded. Answer the quiz to complete it.");
    });
  });
}

function initQuiz() {
  $$(".answer-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const correct = btn.dataset.correct === "true";
      btn.classList.add(correct ? "correct" : "wrong");
      $$(".answer-btn").forEach((other) => {
        if (other !== btn && other.dataset.correct === "true") {
          other.classList.add("correct");
        }
      });
      if (correct) {
        addProgress(50, 20);
        openModal(rewardModal);
      } else {
        showToast("Not quite. Try the highlighted answer.");
      }
    });
  });
}

function initRewards() {
  $("#showRewardBtn").addEventListener("click", () => openModal(rewardModal));
  $("#bossStartBtn").addEventListener("click", () => {
    showToast("Boss battle started. Brace yourself.");
    setScreen("quiz");
  });
  $("#battleReadyBtn").addEventListener("click", () => {
    showToast("1v1 battle matchmaking ready.");
  });
}

function initModals() {
  $$("#rewardModal [data-close-modal], #levelModal [data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.closest(".modal")));
  });

  [rewardModal, levelModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });
}

function bootstrap() {
  syncHeader();
  updateAvatar();
  initNav();
  initSignup();
  initAvatar();
  initCategory();
  initMap();
  initMissions();
  initQuiz();
  initRewards();
  initModals();
  setScreen(state.screen);
}

bootstrap();
