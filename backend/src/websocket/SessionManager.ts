export class SessionManager {
    private sessions: Map<string, any> = new Map();

    create(sessionId: string, data: any) {
        this.sessions.set(sessionId, {
            ...data,
            createdAt: new Date(),
            lastActivity: new Date()
        });
    }

    get(sessionId: string) {
        return this.sessions.get(sessionId);
    }

    update(sessionId: string, data: any) {
        const session = this.sessions.get(sessionId);
        if (session) {
            this.sessions.set(sessionId, {
                ...session,
                ...data,
                lastActivity: new Date()
            });
        }
    }

    delete(sessionId: string) {
        this.sessions.delete(sessionId);
    }

    cleanup(maxAgeMs: number = 3600000) { // 1 hour default
        const now = Date.now();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastActivity.getTime() > maxAgeMs) {
                this.sessions.delete(sessionId);
            }
        }
    }
}
