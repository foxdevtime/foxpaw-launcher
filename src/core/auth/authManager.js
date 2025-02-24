const { AuthAPI } = require('./api');
const SessionManager = require('./session');

class AuthManager {
    constructor() {
        this.session = new SessionManager();
    }

    async initialize() {
        await this.session.initialize();
    }

    async login(credentials) {
        try {
            // Проверяем входные данные
            if (!credentials || !credentials.username || !credentials.password) {
                throw new Error('Необходимо указать имя пользователя и пароль');
            }

            console.log('Sending credentials:', credentials); // Логирование

            // Выполняем запрос к API
            const response = await AuthAPI.login(credentials);

            console.log('AuthAPI Response:', response); // Логирование

            // Сохраняем сессию
            await this.session.saveSession({
                token: response.token,
                username: credentials.username,
                minecraftUsername: response.minecraftUsername || credentials.username,
            });

            return {
                success: true,
                userData: {
                    username: credentials.username,
                    minecraftUsername: response.minecraftUsername || credentials.username,
                },
            };
        } catch (error) {
            console.error('Login Error:', error.message); // Логирование
            await this.session.clearSession();
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async logout() {
        await this.session.clearSession();
        return { success: true };
    }

    isAuthenticated() {
        return this.session.isSessionValid();
    }

    getCurrentUser() {
        return this.session.getSession();
    }
}

module.exports = AuthManager;