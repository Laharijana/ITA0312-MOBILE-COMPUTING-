
const $ = id => document.getElementById(id);

const locations = {
    central: { name: "Central City Parking", rate: 50 },
    mall: { name: "Green Mall Parking", rate: 40 },
    station: { name: "City Station Parking", rate: 30 }
};

let currentEmail = sessionStorage.getItem("parkEaseUser");
let selectedSlot = null;
let activeLocation = "all";
let vehicleType = "Car";

// Demo parking data. Availability is not connected to real sensors.
const initialSlots = [
    { id: "A01", location: "central", occupied: false },
    { id: "A02", location: "central", occupied: true },
    { id: "A03", location: "central", occupied: false },
    { id: "A04", location: "central", occupied: false },
    { id: "A05", location: "central", occupied: true },
    { id: "A06", location: "central", occupied: false },

    { id: "B01", location: "mall", occupied: false },
    { id: "B02", location: "mall", occupied: false },
    { id: "B03", location: "mall", occupied: true },
    { id: "B04", location: "mall", occupied: false },
    { id: "B05", location: "mall", occupied: false },
    { id: "B06", location: "mall", occupied: true },

    { id: "C01", location: "station", occupied: true },
    { id: "C02", location: "station", occupied: false },
    { id: "C03", location: "station", occupied: false },
    { id: "C04", location: "station", occupied: false },
    { id: "C05", location: "station", occupied: true },
    { id: "C06", location: "station", occupied: false }
];

function getUsers() {
    return JSON.parse(localStorage.getItem("parkEaseUsers") || "{}");
}

function saveUsers(users) {
    localStorage.setItem("parkEaseUsers", JSON.stringify(users));
}

function getSlots() {
    const saved = localStorage.getItem("parkEaseSlots");

    if (saved) return JSON.parse(saved);

    localStorage.setItem("parkEaseSlots", JSON.stringify(initialSlots));
    return JSON.parse(JSON.stringify(initialSlots));
}

function saveSlots(slots) {
    localStorage.setItem("parkEaseSlots", JSON.stringify(slots));
}

function getCurrentUser() {
    if (!currentEmail) return null;
    return getUsers()[currentEmail] || null;
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

function showDashboard() {
    if (!getCurrentUser()) {
        showLogin();
        return;
    }

    $("loginPage").classList.add("hidden");
    $("registerPage").classList.add("hidden");
    $("dashboard").classList.remove("hidden");
    $("logoutBtn").classList.remove("hidden");

    renderSlots();
    updateStats();
    renderBookings();
}

$("registerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = $("regName").value.trim();
    const email = $("regEmail").value.trim().toLowerCase();
    const password = $("regPassword").value;
    const users = getUsers();

    if (users[email]) {
        $("registerMessage").style.color = "#c0392b";
        $("registerMessage").textContent =
            "This email is already registered. Please sign in.";
        return;
    }

    users[email] = {
        name,
        password,
        bookings: []
    };

    saveUsers(users);

    $("registerMessage").style.color = "#16845b";
    $("registerMessage").textContent =
        "Account created successfully! Please sign in.";

    $("registerForm").reset();
});

$("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = $("loginEmail").value.trim().toLowerCase();
    const password = $("loginPassword").value;
    const user = getUsers()[email];

    if (!user || user.password !== password) {
        $("loginMessage").style.color = "#c0392b";
        $("loginMessage").textContent =
            "Incorrect email or password. Please try again.";
        return;
    }

    currentEmail = email;
    sessionStorage.setItem("parkEaseUser", email);

    $("loginForm").reset();
    $("welcomeTitleName");
    $("loginMessage").textContent = "";

    $("dashboard").classList.remove("hidden");
    $("welcomeTitle").innerHTML =
        "Find a spot. <span>Park with ease.</span>";

    showDashboard();
    window.scrollTo(0, 0);
});

function logout() {
    currentEmail = null;
    selectedSlot = null;
    sessionStorage.removeItem("parkEaseUser");
    $("loginForm").reset();
    showLogin();
    window.scrollTo(0, 0);
}

function searchParking() {
    activeLocation = $("locationSelect").value;
    vehicleType = $("vehicle").value;
    selectedSlot = null;

    $("locationDescription").textContent =
        activeLocation === "all"
            ? "Showing demo parking spaces at all locations."
            : "Available spaces at " + locations[activeLocation].name + ".";

    updateSelectedDetails();
    renderSlots();
    updateStats();

    $("slotGrid").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function renderSlots() {
    const grid = $("slotGrid");
    const slots = getSlots();
    const user = getCurrentUser();

    if (!user) return;

    grid.innerHTML = "";

    const filtered = slots.filter(slot =>
        activeLocation === "all" || slot.location === activeLocation
    );

    filtered.forEach(slot => {
        const ownerBooking = user.bookings.find(
            booking => booking.slotId === slot.id &&
                       booking.status === "Active"
        );

        const otherBookings = Object.values(getUsers()).some(account =>
            account.bookings.some(booking =>
                booking.slotId === slot.id &&
                booking.status === "Active" &&
                account !== user
            )
        );

        const isBooked = Boolean(ownerBooking);
        const isUnavailable = slot.occupied || isBooked || otherBookings;

        const button = document.createElement("button");
        button.className = "slot";

        if (isBooked) {
            button.classList.add("my-booked");
        } else if (selectedSlot === slot.id) {
            button.classList.add("selected");
        } else if (isUnavailable) {
            button.classList.add("occupied");
        }

        const car = document.createElement("span");
        car.className = "car-icon";
        car.textContent = isBooked ? "🔒" : isUnavailable ? "🚗" : "🅿️";

        const title = document.createElement("strong");
        title.textContent = slot.id;

        const status = document.createElement("small");
        status.textContent = isBooked
            ? "YOUR BOOKING"
            : isUnavailable
                ? "OCCUPIED"
                : "AVAILABLE";

        button.append(car, title, status);
        button.disabled = isUnavailable;

        if (!isUnavailable) {
            button.addEventListener("click", () => selectSlot(slot.id));
        }

        grid.appendChild(button);
    });

    if (filtered.length === 0) {
        grid.textContent = "No parking spaces found.";
    }
}

function selectSlot(slotId) {
    const slot = getSlots().find(item => item.id === slotId);

    if (!slot || slot.occupied) return;

    const user = getCurrentUser();
    if (!user) return;

    const bookedBySomeone = Object.entries(getUsers()).some(
        ([email, account]) =>
            account.bookings.some(booking =>
                booking.slotId === slotId &&
                booking.status === "Active"
            )
    );

    if (bookedBySomeone) {
        alert("This slot has already been booked.");
        renderSlots();
        return;
    }

    selectedSlot = slotId;
    activeLocation = slot.location;
    $("locationSelect").value = activeLocation;

    updateSelectedDetails();
    renderSlots();
}

function updateSelectedDetails() {
    const slot = getSlots().find(item => item.id === selectedSlot);
    const duration = Number($("duration").value);
    const locationKey = slot ? slot.location : activeLocation;
    const location = locations[locationKey];

    $("detailLocation").textContent = location
        ? location.name
        : "Choose a location";

    $("detailVehicle").textContent = vehicleType;
    $("hourlyPrice").textContent = location
        ? "₹" + location.rate
        : "—";

    $("totalPrice").textContent = slot
        ? "₹" + location.rate * duration
        : "₹0";

    $("selectedSlotTitle").textContent = slot
        ? "Slot " + slot.id
        : "No slot selected";

    $("selectedSlotDescription").textContent = slot
        ? "Your selected space is ready to reserve."
        : "Select an available parking space from the layout.";

    $("bookBtn").disabled = !slot;
}

$("duration").addEventListener("change", updateSelectedDetails);

$("vehicle").addEventListener("change", function() {
    vehicleType = this.value;
    updateSelectedDetails();
});

$("locationSelect").addEventListener("change", function() {
    activeLocation = this.value;
    selectedSlot = null;

    $("locationDescription").textContent =
        activeLocation === "all"
            ? "Showing demo parking spaces at all locations."
            : "Available spaces at " + locations[activeLocation].name + ".";

    updateSelectedDetails();
    renderSlots();
    updateStats();
});

function updateStats() {
    const slots = getSlots();
    const users = getUsers();

    const filtered = slots.filter(slot =>
        activeLocation === "all" || slot.location === activeLocation
    );

    const allActiveBookings = Object.values(users).flatMap(user =>
        user.bookings.filter(booking => booking.status === "Active")
    );

    const occupied = filtered.filter(slot => {
        const booked = allActiveBookings.some(
            booking => booking.slotId === slot.id
        );
        return slot.occupied || booked;
    }).length;

    $("totalCount").textContent = filtered.length;
    $("availableCount").textContent = filtered.length - occupied;
    $("occupiedCount").textContent = occupied;

    const user = getCurrentUser();

    $("bookingCount").textContent = user
        ? user.bookings.filter(booking => booking.status === "Active").length
        : 0;
}

function bookSlot() {
    if (!selectedSlot || !getCurrentUser()) {
        $("bookingMessage").textContent =
            "Please sign in and select an available slot.";
        return;
    }

    const slot = getSlots().find(item => item.id === selectedSlot);

    if (!slot || slot.occupied) {
        $("bookingMessage").textContent =
            "Sorry, this slot is unavailable.";
        return;
    }

    const users = getUsers();
    const alreadyBooked = Object.values(users).some(user =>
        user.bookings.some(booking =>
            booking.slotId === selectedSlot &&
            booking.status === "Active"
        )
    );

    if (alreadyBooked) {
        $("bookingMessage").textContent =
            "This slot is already booked. Please choose another.";
        selectedSlot = null;
        renderSlots();
        updateSelectedDetails();
        updateStats();
        return;
    }

    const location = locations[slot.location];
    const duration = Number($("duration").value);
    const total = location.rate * duration;
    const id = "PK" + Date.now().toString().slice(-7);

    users[currentEmail].bookings.push({
        id,
        slotId: slot.id,
        location: location.name,
        locationKey: slot.location,
        vehicle: vehicleType,
        duration,
        price: total,
        date: new Date().toLocaleString(),
        status: "Active"
    });

    saveUsers(users);

    $("confirmId").textContent = id;
    $("confirmSlot").textContent = slot.id;
    $("confirmLocation").textContent = location.name;
    $("confirmPrice").textContent = "₹" + total;

    $("confirmationModal").classList.remove("hidden");

    selectedSlot = null;
    $("bookingMessage").textContent = "";

    renderSlots();
    updateSelectedDetails();
    updateStats();
    renderBookings();
}

function renderBookings() {
    const user = getCurrentUser();
    const list = $("bookingList");

    list.innerHTML = "";

    if (!user || user.bookings.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-bookings";
        empty.textContent =
            "No bookings yet. Select an available parking slot to make your first reservation.";
        list.appendChild(empty);
        return;
    }

    [...user.bookings].reverse().forEach(booking => {
        const card = document.createElement("article");
        card.className = "application-card";

        const badge = document.createElement("span");
        badge.className = "booking-id";
        badge.textContent = booking.id;

        const title = document.createElement("h3");
        title.textContent = "Parking Slot " + booking.slotId;

        const location = document.createElement("p");
        location.textContent = "📍 " + booking.location;

        const vehicle = document.createElement("p");
        vehicle.textContent =
            booking.vehicle + " · " + booking.duration + " hour(s)";

        const price = document.createElement("p");
        price.textContent = "Total: ₹" + booking.price;

        const status = document.createElement("p");
        status.textContent = "Status: " + booking.status;

        card.append(badge, title, location, vehicle, price, status);

        if (booking.status === "Active") {
            const cancel = document.createElement("button");
            cancel.className = "cancel-btn";
            cancel.textContent = "Cancel Booking";

            cancel.addEventListener("click", () => cancelBooking(booking.id));
            card.appendChild(cancel);
        }

        list.appendChild(card);
    });
}

function cancelBooking(id) {
    const confirmed = confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    const users = getUsers();
    const booking = users[currentEmail].bookings.find(item => item.id === id);

    if (booking && booking.status === "Active") {
        booking.status = "Cancelled";
        saveUsers(users);

        if (selectedSlot === booking.slotId) {
            selectedSlot = null;
        }

        renderBookings();
        renderSlots();
        updateStats();
        updateSelectedDetails();
    }
}

function closeConfirmation() {
    $("confirmationModal").classList.add("hidden");

    $("myBooking").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Restore the demo session after a page refresh
if (currentEmail && getCurrentUser()) {
    showDashboard();
} else {
    currentEmail = null;
    sessionStorage.removeItem("parkEaseUser");
    showLogin();
}
