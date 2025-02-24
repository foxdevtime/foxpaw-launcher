const fs = require('fs-extra');
const path = require('path');
const { AuthAPI } = require('./api');

class SessionManager {
    constructor() {
        this.sessionPath = path.join(
            require('os').homedir(),
            '.minecraft-launcher',
            'session.json'
        );
        this.currentSession = null;
    }

    async initialize() {
        await this.#ensureSessionDirectory();
        await this.loadSession();
    }

    async #ensureSessionDirectory() {
        const dir = path.dirname(this.sessionPath);
        await fs.ensureDir(dir);
    }

    async loadSession() {
        try {
            const data = await fs.readJson(this.sessionPath);

            if (!this.#validateSessionStructure(data)) {
                await this.clearSession();
                return;
            }

            const isValid = await this.#validateToken(data.token);

            if (isValid) {
                this.currentSession = data;
            } else {
                await this.clearSession();
            }
        } catch (error) {
            this.currentSession = null;
        }
    }

    async saveSession(sessionData) {
        const validatedData = {
            token: sessionData.token,
            username: sessionData.username,
            minecraftUsername: sessionData.minecraftUsername,
            expiresAt: Date.now() + 3600 * 1000, // 1 hour expiration
        };

        await fs.writeJson(this.sessionPath, validatedData, { spaces: 2 });
        this.currentSession = validatedData;
    }

    async clearSession() {
        await fs.remove(this.sessionPath).catch(() => {});
        this.currentSession = null;
    }

    async #validateToken(token) {
        try {
            const response = await AuthAPI.validateToken(token);
            return response.valid;
        } catch (error) {
            return false;
        }
    }

    #validateSessionStructure(data) {
        return (
            data &&
            typeof data.token === 'string' &&
            typeof data.username === 'string' &&
            typeof data.minecraftUsername === 'string' &&
            typeof data.expiresAt === 'number' &&
            data.expiresAt > Date.now()
        );
    }

    getSession() {
        return this.currentSession ? { ...this.currentSession } : null;
    }

    isSessionValid() {
        return !!this.currentSession;
    }
}

module.exports = SessionManager;