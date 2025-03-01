// src/core/auth/api.js
const axios = require('axios');

class AuthAPI {
    static BASE_URL = 'https://fox-paw.ru/api';

    static async login(credentials) {
        try {
            // Убедимся, что credentials - это объект с username и password
            if (!credentials || typeof credentials !== 'object') {
                throw new Error('Invalid credentials format');
            }

            const { username, password } = credentials;

            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            // Отправляем запрос к API
            const response = await axios.post(`${this.BASE_URL}/login`, {
                username: String(username),
                password: String(password),
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('API Response:', response.data);

            // Проверяем ответ API
            if (response.data && response.data.token) {
                return {
                    success: true,
                    token: response.data.token,
                    username: String(username),
                    minecraftUsername: response.data.minecraftUsername || String(username),
                };
            } else {
                throw new Error(response.data?.message || 'Ошибка авторизации');
            }
        } catch (error) {
            console.error('API Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Ошибка соединения');
        }
    }
}

module.exports = { AuthAPI };