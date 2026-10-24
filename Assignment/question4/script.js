
function startWorkout(name) {
    document.getElementById("workoutMessage").textContent =
        name + " selected! Enjoy your workout.";
}

function createDiet() {
    const goal = document.getElementById("goal").value;
    const type = document.getElementById("dietType").value;

    const protein = type === "veg"
        ? "dal, beans, paneer or tofu"
        : "eggs, fish or chicken";

    let meals;

    if (goal === "muscle") {
        meals = "Breakfast: oats and milk. Lunch: rice, vegetables and " +
            protein + ". Snack: nuts. Dinner: a balanced protein-rich meal.";
    } else if (goal === "weight") {
        meals = "Breakfast: fruit and oats. Lunch: vegetables and " +
            protein + ". Snack: fruit. Dinner: a balanced meal.";
    } else {
        meals = "Breakfast: whole grains and fruit. Lunch: rice, vegetables " +
            "and " + protein + ". Snack: nuts. Dinner: a balanced meal.";
    }

    document.getElementById("result").textContent =
        "Your sample meal plan: " + meals;
}

function choosePlan(plan) {
    document.getElementById("planMessage").textContent =
        plan + " selected. Please log in to continue.";
    document.getElementById("login").scrollIntoView({
        behavior: "smooth"
    });
}

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (password.length < 6) {
        document.getElementById("loginMessage").textContent =
            "Password must contain at least 6 characters.";
        return;
    }

    const displayName = name || email.split("@")[0];

    document.getElementById("loginMessage").textContent =
        "Welcome, " + displayName + "! Demo login successful.";

    this.reset();
});
