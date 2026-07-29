/**
 * Auth Module — Self-contained authentication logic.
 * Uses localStorage to store users (JSON) and session state.
 *
 * Storage keys:
 *   - 'arcade_users'   → JSON array of user objects
 *   - 'arcade_session' → JSON object of currently logged-in user (or null)
 */
const Auth = (function () {
    const USERS_KEY = 'arcade_users';
    const SESSION_KEY = 'arcade_session';

    // ─── Helpers ───────────────────────────────────────────────

    function getUsers() {
        const data = localStorage.getItem(USERS_KEY);
        return data ? JSON.parse(data) : [];
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ─── Public API ────────────────────────────────────────────

    /**
     * Create a new account.
     * @param {object} data - { username, password, email, dateOfBirth, gender }
     * @returns {{ success: boolean, error?: string }}
     */
    function signup(data) {
        const { username, password, email, dateOfBirth, gender } = data;

        // Validation
        if (!username || username.trim().length < 2) {
            return { success: false, error: 'Username must be at least 2 characters.' };
        }
        if (!password || password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters.' };
        }
        if (!email || !isValidEmail(email)) {
            return { success: false, error: 'Please enter a valid email address.' };
        }
        if (!dateOfBirth) {
            return { success: false, error: 'Date of birth is required.' };
        }

        const users = getUsers();

        // Check uniqueness
        if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
            return { success: false, error: 'Username already taken.' };
        }
        if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
            return { success: false, error: 'Email already registered.' };
        }

        // Create user
        const newUser = {
            username: username.trim(),
            password: password, // In a real app, hash this!
            email: email.trim().toLowerCase(),
            dateOfBirth: dateOfBirth,
            gender: gender || '',
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        saveUsers(users);

        // Auto-login after signup
        setSession(newUser);

        return { success: true };
    }

    /**
     * Log in with username and password.
     * @param {string} username
     * @param {string} password
     * @returns {{ success: boolean, error?: string }}
     */
    function login(username, password) {
        if (!username || !password) {
            return { success: false, error: 'Username and password are required.' };
        }

        const users = getUsers();
        const user = users.find(
            u => u.username.toLowerCase() === username.trim().toLowerCase()
        );

        if (!user) {
            return { success: false, error: 'User not found.' };
        }

        if (user.password !== password) {
            return { success: false, error: 'Incorrect password.' };
        }

        setSession(user);
        return { success: true };
    }

    /**
     * Log out the current user.
     */
    function logout() {
        localStorage.removeItem(SESSION_KEY);
    }

    /**
     * Get the currently logged-in user, or null.
     * @returns {object|null}
     */
    function getCurrentUser() {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Check if a user is logged in.
     * @returns {boolean}
     */
    function isLoggedIn() {
        return getCurrentUser() !== null;
    }

    // ─── Internal ──────────────────────────────────────────────

    function setSession(user) {
        // Store session without password
        const session = {
            username: user.username,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    // ─── Expose ────────────────────────────────────────────────

    return {
        signup,
        login,
        logout,
        getCurrentUser,
        isLoggedIn,
    };
})();
