// windows/login/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const statusMessage = document.getElementById('status-message');
    // Объект для перевода сообщений об ошибках
    const errorMessages = {
        'Invalid credentials': 'Неверные учетные данные',
        'Unauthorized': 'Несанкционированный доступ',
        // добавьте другие сообщения по мере необходимости
    };
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        if (!username || !password) {
            showStatus('Заполните все поля', 'error');
            return;
        }
        try {
            const result = await window.auth.login({ username, password });
            console.log('Login Result:', result); // Логирование
            if (result.success) {
                showStatus('Успешный вход!', 'success');
                setTimeout(() => {
                    window.close(); // Закрываем окно авторизации
                }, 1500);
            } else {
                // Используем перевод сообщения об ошибке
                const errorMessage = errorMessages[result.error] || result.error || 'Ошибка авторизации';
                showStatus(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Login Error:', error); // Логирование
            showStatus('Ошибка соединения', 'error');
        }
    });
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status ${type}`;
        statusMessage.classList.remove('hidden');
        // Добавляем плавную видимость уведомления
        setTimeout(() => {
            statusMessage.classList.remove('hidden');
            statusMessage.style.opacity = 1; // Убираем скрытие
        }, 0); // Задержка в 0 мс, чтобы применился класс
        // Скрываем уведомление через 3 секунды
        setTimeout(() => {
            statusMessage.style.opacity = 0; // Добавляем эффект исчезновения
            setTimeout(() => {
                statusMessage.classList.add('hidden'); // После исчезновения скрываем элемент
            }, 500); // Время, равное длительности анимации исчезновения
        }, 1500);
    }
});

const phrases = [
    "игру",
    "мир кубов",
    "мечту",
    "лаунчер",
    "...",
    "Minecraft",
    "измерение",
    "FoxPaw",
    "§kerror"
];

function getRandomPhrase() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
}
function changeTitle() {
    const h1Element = document.querySelector('h1');
    const phrase = getRandomPhrase();
    if (phrase.includes("§k")) {
        h1Element.innerHTML = `Вход в <span id="obfuscated-text">${phrase.replace("§k", "")}</span>`;
        obfuscate(phrase.replace("§k", ""), 100);
    } else {
        h1Element.textContent = `Вход в ${phrase}`;
    }
}
function getRandomChar() {
    const chars = "!@#$%^&*()+-=[]{}|;':,.<>?/~";
    return chars[Math.floor(Math.random() * chars.length)];
}
function obfuscate(text, interval = 10) {
    let index = 0;
    const length = text.length;
    let obfuscatedText = text;
    const intervalId = setInterval(() => {
        if (index >= length) {
            clearInterval(intervalId);
            return;
        }
        obfuscatedText =
            obfuscatedText.substring(0, index) +
            getRandomChar() +
            obfuscatedText.substring(index + 1);
        document.getElementById("obfuscated-text").textContent = obfuscatedText;
        index++;
    }, interval);
}
window.onload = changeTitle;