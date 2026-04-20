console.log("🚀 Purplix ONLINE");

let currentUser = null;

/* FIREBASE */
const firebaseConfig = {
  apiKey: "AIzaSyAXswTNDekfx61QK7QR6tnaRxkEmB26t0M",
  authDomain: "purplix-99a2a.firebaseapp.com",
  projectId: "purplix-99a2a",
  storageBucket: "purplix-99a2a.firebasestorage.app",
  messagingSenderId: "995682402985",
  appId: "1:995682402985:web:0d87182acb137953591fb8",
  measurementId: "G-ZX4NWB4CEW"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ELEMENTS */
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

/* REGISTER */
function register() {
    const name = regName.value.trim();
    const pass = regPass.value.trim();

    if (!name || !pass) return alert("Fill in all fields!");

    db.collection("users").add({
        username: name,
        password: pass
    });

    localStorage.setItem("currentUser", name);
    openApp(name);
}

/* LOGIN */
function login() {
    const name = loginName.value.trim();
    const pass = loginPass.value.trim();

    if (!name || !pass) return alert("Login error!");

    db.collection("users")
        .where("username", "==", name)
        .where("password", "==", pass)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                alert("Invalid username or password!");
            } else {
                localStorage.setItem("currentUser", name);
                openApp(name);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Database connection error");
        });
}

/* OPEN APP */
function openApp(name) {
    currentUser = name;

    auth.style.display = "none";
    app.style.display = "flex";

    user.innerText = name;

    listenPosts();
}

/* ADD POST */
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

/* LIVE POSTS */
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
        <span>${p.post}</span>
    </div>
`;
            });

            postsDiv.scrollTop = 0;
        });
}

/* UI */
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

/* PASSWORD */
function togglePass(id, el) {
    const input = document.getElementById(id);

    input.type = input.type === "password" ? "text" : "password";
    el.textContent = input.type === "text" ? "🔓" : "🔒";
}

/* INIT */
window.onload = function () {
    loginBtn.onclick = login;
    regBtn.onclick = register;

    goRegister.onclick = showRegister;
    goLogin.onclick = showLogin;

    logoutBtn.onclick = logout;
    postBtn.onclick = addPost;

    const saved = localStorage.getItem("currentUser");
    if (saved) openApp(saved);
};