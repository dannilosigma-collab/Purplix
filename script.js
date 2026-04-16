console.log("🚀 Purplix ONLINE");

let currentUser = null;

/* ===== FIREBASE CONFIG ===== */
const firebaseConfig = {
  apiKey: "AIzaSyAXswTNDekfx61QK7QR6tnaRxkEmB26t0M",
  authDomain: "purplix-99a2a.firebaseapp.com",
  projectId: "purplix-99a2a",
  storageBucket: "purplix-99a2a.firebasestorage.app",
  messagingSenderId: "995682402985",
  appId: "1:995682402985:web:0d87182acb137953591fb8",
  measurementId: "G-ZX4NWB4CEW"
};

/* ===== INIT FIREBASE ===== */
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ===== ELEMENTS ===== */
const auth = document.getElementById("auth");
const app = document.getElementById("app");

const loginName = document.getElementById("loginName");
const loginPass = document.getElementById("loginPass");
const regName = document.getElementById("regName");
const regPass = document.getElementById("regPass");

const loginBox = document.getElementById("loginBox");
const registerBox = document.getElementById("registerBox");

const user = document.getElementById("user");
const postsDiv = document.getElementById("posts");
const postText = document.getElementById("postText");

/* ===== REGISTER ===== */
function register() {
    const name = regName.value.trim();
    const pass = regPass.value.trim();

    if (!name || !pass) return alert("Заполни поля!");

    // сохраняем пользователя (тестово)
    db.collection("users").add({
        username: name,
        password: pass
    });

    localStorage.setItem("currentUser", name);
    openApp(name);
}

/* ===== LOGIN ===== */
function login() {
    const name = loginName.value.trim();
    const pass = loginPass.value.trim();

    if (!name || !pass) return alert("Ошибка входа!");

    localStorage.setItem("currentUser", name);
    openApp(name);
}

/* ===== OPEN APP ===== */
function openApp(name) {
    currentUser = name;

    auth.style.display = "none";
    app.style.display = "block";

    user.innerText = name;

    listenPosts();
}

/* ===== ADD POST ===== */
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

/* ===== LIVE POSTS ===== */
function listenPosts() {
    db.collection("posts")
        .orderBy("time", "desc")
        .onSnapshot(snapshot => {
            postsDiv.innerHTML = "";

            snapshot.forEach(doc => {
                const p = doc.data();

                postsDiv.innerHTML += `
                    <div class="post">
                        <div class="post-user">${p.user}</div>
                        <div>${p.post}</div>
                    </div>
                `;
            });
        });
}

/* ===== UI ===== */
function showRegister() {
    loginBox.style.display = "none";
    registerBox.style.display = "block";
}

function showLogin() {
    registerBox.style.display = "none";
    loginBox.style.display = "block";
}

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

/* ===== PASSWORD TOGGLE ===== */
function togglePass(id, el) {
    const input = document.getElementById(id);

    if (input.type === "password") {
        input.type = "text";
        el.textContent = "🔓";
    } else {
        input.type = "password";
        el.textContent = "🔒";
    }
}

/* ===== INIT ===== */
window.onload = function () {
    document.getElementById("loginBtn").onclick = login;
    document.getElementById("regBtn").onclick = register;

    document.getElementById("goRegister").onclick = showRegister;
    document.getElementById("goLogin").onclick = showLogin;

    document.getElementById("logoutBtn").onclick = logout;
    document.getElementById("postBtn").onclick = addPost;

    const saved = localStorage.getItem("currentUser");
    if (saved) openApp(saved);
};