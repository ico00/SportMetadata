const jwt = require('jsonwebtoken');

// Environment variables
// Na localhost-u koristimo default password, na produkciji koristi se env varijabla
const isLocalhost = process.env.NODE_ENV !== 'production' || 
                    process.env.FLY_APP_NAME === undefined ||
                    process.env.ALLOW_LOCALHOST_AUTH === 'true';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sprTmdatA9823-918!'; // Default za development
const JWT_SECRET = process.env.JWT_SECRET || 'sport-metadata-secret-key-change-in-production';

// Security validation for production
const DEFAULT_PASSWORD = 'sprTmdatA9823-918!';
const DEFAULT_JWT_SECRET = 'sport-metadata-secret-key-change-in-production';

// Validate environment variables in production
if (process.env.NODE_ENV === 'production' && !isLocalhost) {
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD environment variable must be set in production');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  if (process.env.ADMIN_PASSWORD === DEFAULT_PASSWORD) {
    throw new Error('Default ADMIN_PASSWORD cannot be used in production. Please set a secure password.');
  }
  if (process.env.JWT_SECRET === DEFAULT_JWT_SECRET) {
    throw new Error('Default JWT_SECRET cannot be used in production. Please set a secure secret key.');
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }
}

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
