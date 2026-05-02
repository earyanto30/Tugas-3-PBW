document.addEventListener('DOMContentLoaded', function () {
    const greetingMessage = document.getElementById('greetingMessage');
    const userNameDisplay = document.getElementById('userNameDisplay');

    const loggedInUserStr = localStorage.getItem('loggedInUser');
    if (loggedInUserStr) {
        const user = JSON.parse(loggedInUserStr);
        userNameDisplay.textContent = `Anda login sebagai ${user.nama} (${user.role})`;
    }

    const currentHour = new Date().getHours();
    let greeting = "";

    if (currentHour >= 0 && currentHour < 11) {
        greeting = "Selamat Pagi";
    } else if (currentHour >= 11 && currentHour < 15) {
        greeting = "Selamat Siang";
    } else {
        greeting = "Selamat Sore";
    }

    greetingMessage.textContent = greeting + "!";
});
