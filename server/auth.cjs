const jwt = require('jsonwebtoken');

// Environment variables
// Na localhost-u koristimo default password, na produkciji koristi se env varijabla
const isLocalhost = process.env.NODE_ENV !== 'production' || 
                    process.env.FLY_APP_NAME === undefined ||
                    process.env.ALLOW_LOCALHOST_AUTH === 'true';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sprTmdatA9823-918!'; // Default za development
const JWT_SECRET = process.env.JWT_SECRET || 'sport-metadata-secret-key-change-in-production';

/**
 * Proverava admin lozinku i vraća JWT token
 */
function login(password) {
    // Na localhost-u, automatski omogući pristup bez passworda
    if (isLocalhost) {
        console.log('🔓 Localhost mode: Auto-login enabled');
        const token = jwt.sign(
            { role: 'admin', localhost: true },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        return { success: true, token, localhost: true };
    }

    // Na produkciji, provjeri password
    if (password === ADMIN_PASSWORD) {
        const token = jwt.sign(
            { role: 'admin' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        return { success: true, token };
    }
    return { success: false, message: 'Incorrect password' };
}

/**
 * Proverava validnost JWT tokena
 */
function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

/**
 * Express middleware za zaštitu ruta
 * Na localhost-u automatski omogućava pristup
 */
function authMiddleware(req, res, next) {
    // Na localhost-u, automatski omogući pristup
    if (isLocalhost) {
        req.user = { role: 'admin', localhost: true };
        return next();
    }

    // Na produkciji, provjeri token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized access - token not provided' });
    }

    const token = authHeader.substring(7); // Ukloni "Bearer "
    const result = verifyToken(token);

    if (!result.valid) {
        return res.status(401).json({ error: 'Unauthorized access - invalid token' });
    }

    req.user = result.decoded;
    next();
}

/**
 * Provjerava da li je korisnik admin (bez middleware-a)
 */
function isAdmin(req) {
    if (isLocalhost) {
        return true;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
    }

    const token = authHeader.substring(7);
    const result = verifyToken(token);
    return result.valid && result.decoded.role === 'admin';
}

module.exports = {
    login,
    verifyToken,
    authMiddleware,
    isAdmin,
    isLocalhost
};
