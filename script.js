console.log("🚀 Purplix ONLINE");

/* =========================
   FIREBASE
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyAXswTNDekfx61QK7QR6tnaRxkEmB26t0M",
  authDomain: "purplix-99a2a.firebaseapp.com",
  projectId: "purplix-99a2a",
  storageBucket: "purplix-99a2a.firebasestorage.app",
  messagingSenderId: "995682402985",
  appId: "1:995682402985:web:0d87182acb137953591fb8",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* =========================
   STATE
========================= */
let currentUser = null;
let currentUserId = null;
let currentUserData = null;

/* =========================
   ELEMENTS
========================= */
const auth = document.getElementById("auth");
const app = document.getElementById("app");

const loginBox = document.getElementById("loginBox");
const registerBox = document.getElementById("registerBox");

const loginName = document.getElementById("loginName");
const loginPass = document.getElementById("loginPass");

const regName = document.getElementById("regName");
const regPass = document.getElementById("regPass");

const user = document.getElementById("user");
const postsDiv = document.getElementById("posts");
const postText = document.getElementById("postText");

/* buttons */
const loginBtn = document.getElementById("loginBtn");
const regBtn = document.getElementById("regBtn");
const goRegister = document.getElementById("goRegister");
const goLogin = document.getElementById("goLogin");
const logoutBtn = document.getElementById("logoutBtn");
const postBtn = document.getElementById("postBtn");

/* sidebar */
const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

/* sidebar buttons */
const btnPosts = document.getElementById("btnPosts");
const ownerBtn = document.getElementById("ownerBtn");

/* tabs */
const postsTab = document.getElementById("postsTab");
const ownerTab = document.getElementById("ownerTab");

/* =========================
   SIDEBAR TOGGLE (FIXED > <)
========================= */
if (sidebar && sidebarToggle) {
  sidebarToggle.onclick = () => {
    sidebar.classList.toggle("open");

    if (sidebar.classList.contains("open")) {
      sidebarToggle.innerText = "<";
    } else {
      sidebarToggle.innerText = ">";
    }
  };
}

/* =========================
   TAB SYSTEM
========================= */
function showTab(tab) {
  if (postsTab) postsTab.style.display = "none";
  if (ownerTab) ownerTab.style.display = "none";

  if (tab === "posts") postsTab.style.display = "block";
  if (tab === "owner") ownerTab.style.display = "block";

  localStorage.setItem("lastTab", tab);
}

/* =========================
   FIX BUTTON POSTS
========================= */
btnPosts.onclick = () => {
  showTab("posts");
};

/* =========================
   REGISTER
========================= */
function register() {
  const name = regName.value.trim();
  const pass = regPass.value.trim();

  if (!name || !pass) return alert("Fill all fields!");

  db.collection("users").add({
    username: name,
    password: pass,
    verified: false
  });

  alert("Account created!");
  showLogin();
}

/* =========================
   LOGIN
========================= */
function login() {
  const name = loginName.value.trim();
  const pass = loginPass.value.trim();

  db.collection("users")
    .where("username", "==", name)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        alert("User not found!");
        return;
      }

      let ok = false;

      snapshot.forEach(doc => {
        const data = doc.data();

        if (data.password === pass) {
          ok = true;
          currentUserId = doc.id;
          currentUserData = data;
        }
      });

      if (!ok) {
        alert("Wrong password!");
        return;
      }

      localStorage.setItem("currentUserId", currentUserId);
      openApp(currentUserData);
    });
}

/* =========================
   OPEN APP
========================= */
function openApp(userData) {
  currentUser = userData.username;

  auth.style.display = "none";
  app.style.display = "flex";

  user.innerText = currentUser;

  if (currentUser === "MDaniil") {
    ownerBtn.style.display = "block";
  }

  listenPosts();

  const lastTab = localStorage.getItem("lastTab");
  showTab(lastTab ? lastTab : "posts");
}

/* =========================
   POSTS
========================= */
function listenPosts() {
  db.collection("posts")
    .orderBy("time", "desc")
    .onSnapshot(async snapshot => {
      postsDiv.innerHTML = "";

      for (const doc of snapshot.docs) {
        const p = doc.data();

        const userSnap = await db.collection("users")
          .where("username", "==", p.user)
          .get();

        let verified = false;

        userSnap.forEach(u => {
          verified = u.data().verified;
        });

        postsDiv.innerHTML += `
          <div class="post">
            <div class="post-user">
              ${p.user} ${verified ? "✔️" : ""}
            </div>
            <div>${p.post}</div>
          </div>
        `;
      }
    });
}

/* =========================
   ADD POST
========================= */
function addPost() {
  const text = postText.value.trim();
  if (!text) return;

  db.collection("posts").add({
    post: text,
    user: currentUser,
    time: Date.now()
  });

  postText.value = "";
}

/* =========================
   OWNER
========================= */
ownerBtn.onclick = () => {
  showTab("owner");
};

/* =========================
   OWNER SEARCH SYSTEM
========================= */

const searchUser = document.getElementById("searchUser");
const userResults = document.getElementById("userResults");

if (searchUser) {

  searchUser.addEventListener("input", async () => {
    const value = searchUser.value.trim().toLowerCase();

    userResults.innerHTML = "";

    if (!value) return;

    const snapshot = await db.collection("users").get();

    snapshot.forEach(doc => {
      const data = doc.data();
      const username = data.username.toLowerCase();

      if (username.startsWith(value)) {

        const btn = document.createElement("button");
        btn.className = "user-btn";
        btn.innerText = data.username;

        btn.onclick = async () => {
          await db.collection("users").doc(doc.id).update({
            verified: true
          });

          alert("✔ User verified!");

          searchUser.value = "";
          userResults.innerHTML = "";
        };

        userResults.appendChild(btn);
      }
    });
  });

}

/* =========================
   REMOVE VERIFY SYSTEM
========================= */

const removeUser = document.getElementById("removeUser");
const removeResults = document.getElementById("removeResults");

if (removeUser) {

  removeUser.addEventListener("input", async () => {
    const value = removeUser.value.trim().toLowerCase();

    removeResults.innerHTML = "";

    if (!value) return;

    const snapshot = await db.collection("users").get();

    snapshot.forEach(doc => {
      const data = doc.data();
      const username = data.username.toLowerCase();

      // показываем только тех у кого ЕСТЬ галочка
      if (username.startsWith(value) && data.verified === true) {

        const btn = document.createElement("button");
        btn.className = "user-btn";
        btn.innerText = data.username;

        btn.onclick = async () => {
          await db.collection("users").doc(doc.id).update({
            verified: false
          });

          alert("❌ Verification removed");

          removeUser.value = "";
          removeResults.innerHTML = "";
        };

        removeResults.appendChild(btn);
      }
    });
  });

}

/* =========================
   UI
========================= */
function showRegister() {
  loginBox.style.display = "none";
  registerBox.style.display = "block";
}

function showLogin() {
  registerBox.style.display = "none";
  loginBox.style.display = "block";
}

function logout() {
  localStorage.removeItem("currentUserId");
  localStorage.removeItem("lastTab");
  location.reload();
}

/* =========================
   EVENTS
========================= */
loginBtn.onclick = login;
regBtn.onclick = register;
goRegister.onclick = showRegister;
goLogin.onclick = showLogin;
logoutBtn.onclick = logout;
postBtn.onclick = addPost;

/* =========================
   AUTO LOGIN
========================= */
window.onload = function () {
  const savedId = localStorage.getItem("currentUserId");

  if (savedId) {
    db.collection("users").doc(savedId).get().then(doc => {
      if (doc.exists) {
        currentUserId = savedId;
        currentUserData = doc.data();
        openApp(currentUserData);
      }
    });
  }
};