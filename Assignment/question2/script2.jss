
const $ = id => document.getElementById(id);

let currentUser = sessionStorage.getItem("careerUser");

const jobs = [
    {
        title: "AI / ML Engineer",
        company: "Tech Solutions",
        type: "AI / Data",
        location: "Remote",
        skills: "Python, Machine Learning",
        salary: "₹4–8 LPA"
    },
    {
        title: "Data Analyst",
        company: "Data Insights",
        type: "AI / Data",
        location: "Chennai",
        skills: "SQL, Python, Excel",
        salary: "₹3–6 LPA"
    },
    {
        title: "Software Developer",
        company: "CodeWorks",
        type: "Software",
        location: "Bengaluru",
        skills: "Java, C++, Problem Solving",
        salary: "₹4–7 LPA"
    },
    {
        title: "Frontend Developer",
        company: "WebCraft",
        type: "Software",
        location: "Remote",
        skills: "HTML, CSS, JavaScript",
        salary: "₹3–6 LPA"
    },
    {
        title: "UI/UX Designer",
        company: "Creative Studio",
        type: "Design",
        location: "Hyderabad",
        skills: "Figma, UI Design",
        salary: "₹3–5 LPA"
    },
    {
        title: "Data Scientist",
        company: "Smart Analytics",
        type: "AI / Data",
        location: "Chennai",
        skills: "Python, Statistics, ML",
        salary: "₹5–10 LPA"
    }
];

function getUsers() {
    return JSON.parse(localStorage.getItem("careerUsers") || "{}");
}

function saveUsers(users) {
    localStorage.setItem("careerUsers", JSON.stringify(users));
}

function showLogin(event) {
    if (event) event.preventDefault();
    $("loginPage").classList.remove("hidden");
    $("registerPage").classList.add("hidden");
    $("dashboard").classList.add("hidden");
    $("logoutBtn").classList.add("hidden");
}

function showRegister(event) {
    if (event) event.preventDefault();
    $("loginPage").classList.add("hidden");
    $("registerPage").classList.remove("hidden");
    $("dashboard").classList.add("hidden");
}

function enterDashboard() {
    const users = getUsers();
    const user = users[currentUser];

    if (!user) {
        logout();
        return;
    }

    $("loginPage").classList.add("hidden");
    $("registerPage").classList.add("hidden");
    $("dashboard").classList.remove("hidden");
    $("logoutBtn").classList.remove("hidden");
    $("welcomeTitle").textContent =
        "Welcome, " + user.name + "! Find Your Dream Job";

    // Restore saved personal details
    if (user.profile) {
        $("fullName").value = user.profile.fullName || user.name;
        $("phone").value = user.profile.phone || "";
        $("qualification").value = user.profile.qualification || "";
        $("skills").value = user.profile.skills || "";
        $("experience").value = user.profile.experience || "Fresher";
    } else {
        $("fullName").value = user.name;
    }

    $("subscriptionMessage").textContent =
        "Current plan: " + (user.subscription || "None selected");

    renderJobs();
    renderApplications();
}

$("registerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = $("regName").value.trim();
    const email = $("regEmail").value.trim().toLowerCase();
    const password = $("regPassword").value;
    const users = getUsers();

    if (users[email]) {
        $("registerMessage").textContent =
            "This email is already registered. Please log in.";
        $("registerMessage").style.color = "red";
        return;
    }

    users[email] = {
        name,
        password,
        subscription: "",
        profile: null,
        applications: []
    };

    saveUsers(users);

    $("registerMessage").style.color = "green";
    $("registerMessage").textContent =
        "Registration successful! You can now log in.";

    $("registerForm").reset();
});

$("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = $("loginEmail").value.trim().toLowerCase();
    const password = $("loginPassword").value;
    const users = getUsers();

    if (!users[email] || users[email].password !== password) {
        $("loginMessage").style.color = "red";
        $("loginMessage").textContent =
            "Invalid email or password. Please try again.";
        return;
    }

    currentUser = email;
    sessionStorage.setItem("careerUser", email);
    $("loginForm").reset();
    enterDashboard();
    window.scrollTo(0, 0);
});

function logout() {
    currentUser = null;
    sessionStorage.removeItem("careerUser");
    $("loginForm").reset();
    $("registerForm").reset();
    showLogin();
    window.scrollTo(0, 0);
}

function getCurrentAccount() {
    const users = getUsers();
    return users[currentUser];
}

function updateCurrentAccount(callback) {
    const users = getUsers();

    if (!users[currentUser]) return;

    callback(users[currentUser]);
    saveUsers(users);
}

function subscribe(plan) {
    if (plan === "Pro" || plan === "Premium") {
        const confirmed = confirm(
            plan + " plan selected. This is a demo; no payment will be charged. Continue?"
        );
        if (!confirmed) return;
    }

    updateCurrentAccount(user => {
        user.subscription = plan;
    });

    $("subscriptionMessage").style.color = "green";
    $("subscriptionMessage").textContent =
        plan + " plan selected successfully. Demo only; no payment was processed.";
}

$("profileForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const profile = {
        fullName: $("fullName").value.trim(),
        phone: $("phone").value.trim(),
        qualification: $("qualification").value,
        skills: $("skills").value.trim(),
        experience: $("experience").value
    };

    updateCurrentAccount(user => {
        user.profile = profile;
        user.name = profile.fullName;
    });

    $("welcomeTitle").textContent =
        "Welcome, " + profile.fullName + "! Find Your Dream Job";

    $("profileMessage").style.color = "green";
    $("profileMessage").textContent =
        "Personal details saved successfully.";
});

$("resumeFile").addEventListener("change", function() {
    const file = this.files[0];

    if (!file) {
        $("resumeInfo").textContent = "No resume selected.";
        return;
    }

    const allowedExtensions = /\.(pdf|doc|docx)$/i;

    if (!allowedExtensions.test(file.name)) {
        this.value = "";
        $("resumeInfo").textContent = "No resume selected.";
        $("resumeMessage").style.color = "red";
        $("resumeMessage").textContent =
            "Please select a PDF, DOC, or DOCX file.";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        this.value = "";
        $("resumeInfo").textContent = "No resume selected.";
        $("resumeMessage").style.color = "red";
        $("resumeMessage").textContent =
            "File size must be 5 MB or less.";
        return;
    }

    $("resumeInfo").textContent =
        "Selected: " + file.name +
        " (" + (file.size / 1024).toFixed(1) + " KB)";
    $("resumeMessage").textContent = "";
});

function uploadResume() {
    const file = $("resumeFile").files[0];

    if (!file) {
        $("resumeMessage").style.color = "red";
        $("resumeMessage").textContent =
            "Please choose your resume first.";
        $("resumeFile").click();
        return;
    }

    $("resumeMessage").style.color = "green";
    $("resumeMessage").textContent =
        "Resume selected successfully for this demo. It has not been uploaded to a server.";
}

function renderJobs() {
    const query = $("jobSearch").value.toLowerCase().trim();
    const type = $("jobType").value;

    const filtered = jobs.filter(job => {
        const matchesQuery =
            (job.title + " " + job.company + " " + job.skills)
                .toLowerCase().includes(query);

        const matchesType = type === "All" || job.type === type;

        return matchesQuery && matchesType;
    });

    const jobList = $("jobList");
    jobList.innerHTML = "";

    if (filtered.length === 0) {
        jobList.innerHTML = "<p>No matching jobs found.</p>";
        return;
    }

    filtered.forEach(job => {
        const card = document.createElement("article");
        card.className = "card job-card";

        const title = document.createElement("h3");
        title.textContent = job.title;

        const company = document.createElement("div");
        company.className = "company";
        company.textContent = job.company;

        const location = document.createElement("p");
        location.textContent = "📍 " + job.location;

        const salary = document.createElement("p");
        salary.textContent = "💰 " + job.salary;

        const skills = document.createElement("p");
        skills.textContent = "Skills: " + job.skills;

        const tag = document.createElement("span");
        tag.className = "job-tag";
        tag.textContent = job.type;

        const applyButton = document.createElement("button");
        applyButton.textContent = "Apply Now";
        applyButton.addEventListener("click", () => applyForJob(job));

        card.append(title, company, location, salary, skills, tag, applyButton);
        jobList.appendChild(card);
    });
}

$("jobSearch").addEventListener("input", renderJobs);
$("jobType").addEventListener("change", renderJobs);

function applyForJob(job) {
    const user = getCurrentAccount();

    if (!user) return;

    const alreadyApplied = user.applications.some(
        application => application.title === job.title &&
                      application.company === job.company
    );

    if (alreadyApplied) {
        $("jobMessage").style.color = "#315eea";
        $("jobMessage").textContent =
            "You have already applied for this sample job.";
        return;
    }

    updateCurrentAccount(account => {
        account.applications.push({
            title: job.title,
            company: job.company,
            salary: job.salary,
            date: new Date().toLocaleDateString()
        });
    });

    $("jobMessage").style.color = "green";
    $("jobMessage").textContent =
        "Demo application added for " + job.title + ".";

    renderApplications();
}

function renderApplications() {
    const user = getCurrentAccount();
    const container = $("applications");

    container.innerHTML = "";

    if (!user || user.applications.length === 0) {
        container.textContent =
            "No applications yet. Browse jobs and click Apply Now.";
        container.className = "subheading";
        return;
    }

    container.className = "";

    user.applications.forEach(application => {
        const item = document.createElement("div");
        item.className = "application-item";

        const title = document.createElement("h3");
        title.textContent = application.title;

        const company = document.createElement("p");
        company.textContent = application.company;

        const date = document.createElement("p");
        date.textContent =
            "Application recorded: " + application.date;

        const status = document.createElement("p");
        status.textContent = "Status: Demo application submitted";

        item.append(title, company, date, status);
        container.appendChild(item);
    });
}

function goTo(sectionId) {
    $(sectionId).scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Restore the login session after refreshing the page
if (currentUser && getCurrentAccount()) {
    enterDashboard();
} else {
    currentUser = null;
    sessionStorage.removeItem("careerUser");
    showLogin();
}
