"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = exports.requireRoles = exports.optionalAuth = exports.authenticateToken = exports.JWT_SECRET = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../db/index");
exports.JWT_SECRET = process.env.JWT_SECRET || 'ziyo_academy_super_secret_jwt_key_2026';
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.split(' ')[1]) || req.cookies?.['lison_session'];
    if (!token) {
        res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
        const user = await (0, index_1.queryOne)(`SELECT id, email, role, first_name, last_name, is_suspended, is_active FROM users WHERE id = ?`, [decoded.id]);
        if (!user || !user.is_active || user.is_suspended) {
            res.status(403).json({ success: false, message: 'Account is inactive or suspended.' });
            return;
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
        };
        next();
    }
    catch (err) {
        res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.split(' ')[1]) || req.cookies?.['lison_session'];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
            const user = await (0, index_1.queryOne)(`SELECT id, email, role, first_name, last_name FROM users WHERE id = ? AND is_active = 1 AND is_suspended = 0`, [decoded.id]);
            if (user) {
                req.user = user;
            }
        }
        catch {
            // ignore invalid optional token
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
const requireRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required.' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Forbidden: Access requires one of [${roles.join(', ')}] roles.`
            });
            return;
        }
        next();
    };
};
exports.requireRoles = requireRoles;
const logAudit = async (userId, action, resource, details, ipAddress) => {
    try {
        const id = 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        await (0, index_1.executeRun)(`INSERT INTO audit_logs (id, user_id, action, resource, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`, [id, userId, action, resource, details, ipAddress || '127.0.0.1']);
    }
    catch (err) {
        console.error('Audit log failed:', err);
    }
};
exports.logAudit = logAudit;
