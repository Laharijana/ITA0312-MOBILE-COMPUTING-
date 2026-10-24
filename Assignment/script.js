
const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");
const homePage = document.getElementById("homePage");
const logoutBtn = document.getElementById("logoutBtn");

// Show the Login screen
function showLogin(event) {
    if (event) event.preventDefault();

    loginPage.classList.remove("hidden");
    registerPage.classList.add("hidden");
    homePage.classList.add("hidden");

    document.getElementById("loginMessage").textContent = "";
}

// Show the Register screen
function showRegister(event) {
    if (event) event.preventDefault();

    loginPage.classList.add("hidden");
    registerPage.classList.remove("hidden");
    homePage.classList.add("hidden");

    document.getElementById("registerMessage").textContent = "";
}

// Register a new demo account
document.getElementById("registerForm").addEventListener("submit",
    function(event) {
        event.preventDefault();

        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value
            .trim().toLowerCase();
        const password = document.getElementById("regPassword").value;

        const users = JSON.parse(
            localStorage.getItem("mindcareUsers") || "[]"
        );

        const message = document.getElementById("registerMessage");

        if (users.some(user => user.email === email)) {
            message.style.color = "red";
            message.textContent = "This email is already registered.";
            return;
        }

        users.push({
            name: name,
            email: email,
            password: password
        });

        localStorage.setItem("mindcareUsers", JSON.stringify(users));

        message.style.color = "green";
        message.textContent = "Registration successful! Please log in.";

        document.getElementById("registerForm").reset();
    }
);

// Login using the registered demo account
document.getElementById("loginForm").addEventListener("submit",
    function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value
            .trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        const users = JSON.parse(
            localStorage.getItem("mindcareUsers") || "[]"
        );

        const user = users.find(
            item => item.email === email &&
                    item.password === password
        );

        const message = document.getElementById("loginMessage");

        if (!user) {
            message.style.color = "red";
            message.textContent =
                "Invalid email or password. Please register first.";
            return;
        }

        sessionStorage.setItem("mindcareCurrentUser", user.email);
        openHome(user.name);
    }
);

// Display the home dashboard
function openHome(name) {
    loginPage.classList.add("hidden");
    registerPage.classList.add("hidden");
    homePage.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");

    document.getElementById("welcomeTitle").textContent =
        "Hello, " + name + "! 🌸";

    window.scrollTo(0, 0);
}

// Logout
function logout() {
    sessionStorage.removeItem("mindcareCurrentUser");

    document.getElementById("loginForm").reset();
    showLogin();
    logoutBtn.classList.add("hidden");
    window.scrollTo(0, 0);
}

// Scroll to a section
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: "smooth"
    });
}

// Open a blog article
function readBlog(title, content) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalText").textContent = content;

    document.getElementById("blogModal").classList.remove("hidden");
}

// Close the blog article
function closeBlog() {
    document.getElementById("blogModal").classList.add("hidden");
}

// Close the blog modal by clicking outside it
document.getElementById("blogModal").addEventListener("click",
    function(event) {
        if (event.target === this) {
            closeBlog();
        }
    }
);

// Close the modal with the Escape key
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeBlog();
    }
});

// Restore the current demo session after a page refresh
const currentEmail = sessionStorage.getItem("mindcareCurrentUser");

if (currentEmail) {
    const users = JSON.parse(
        localStorage.getItem("mindcareUsers") || "[]"
    );

    const currentUser = users.find(user => user.email === currentEmail);

    if (currentUser) {
        openHome(currentUser.name);
    } else {
        sessionStorage.removeItem("mindcareCurrentUser");
    }
}
