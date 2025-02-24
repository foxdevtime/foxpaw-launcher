// windows/login/renderer.js

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const result = await window.auth.login({ username, password });

    if (result.success) {
        // Перенаправляем в главное окно
        window.location.href = '../main/index.html';
    } else {
        // Показываем ошибку
        showError(result.error);
    }
});