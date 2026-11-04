"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const index_1 = require("./db/index");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const courses_routes_1 = __importDefault(require("./routes/courses.routes"));
const lessons_routes_1 = __importDefault(require("./routes/lessons.routes"));
const quizzes_routes_1 = __importDefault(require("./routes/quizzes.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const speaking_routes_1 = __importDefault(require("./routes/speaking.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const certificates_routes_1 = __importDefault(require("./routes/certificates.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const teachers_routes_1 = __importDefault(require("./routes/teachers.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Gzip / Deflate compression for ultra-fast network transfer
app.use((0, compression_1.default)());
// Security Middleware
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health Check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        platform: 'LISON API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
// Mount Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/courses', courses_routes_1.default);
app.use('/api/lessons', lessons_routes_1.default);
app.use('/api/quizzes', quizzes_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/speaking', speaking_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/certificates', certificates_routes_1.default);
app.use('/api/notifications', notifications_routes_1.default);
app.use('/api/teachers', teachers_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Static frontend serving in production
const possibleFrontendDistPaths = [
    path_1.default.resolve(__dirname, '../../frontend/dist'),
    path_1.default.resolve(process.cwd(), 'frontend/dist'),
    path_1.default.resolve(process.cwd(), '../frontend/dist'),
    path_1.default.resolve(__dirname, '../../../frontend/dist')
];
let frontendDistPath = null;
for (const p of possibleFrontendDistPaths) {
    if (fs_1.default.existsSync(p)) {
        frontendDistPath = p;
        break;
    }
}
if (frontendDistPath) {
    console.log(`Serving frontend static build from: ${frontendDistPath}`);
    app.use(express_1.default.static(frontendDistPath, {
        maxAge: '1y',
        immutable: true,
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            }
            else {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        }
    }));
    // Catch-all fallback for client-side React routing (compatible with Express 5)
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api/')) {
            res.sendFile(path_1.default.join(frontendDistPath, 'index.html'));
            return;
        }
        next();
    });
}
// Safe Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Ichki server xatoligi yuz berdi.'
    });
});
// Start Server
const startServer = async () => {
    try {
        await (0, index_1.initDatabase)();
        const HOST = process.env.HOST || '0.0.0.0';
        app.listen(Number(PORT), () => {
            console.log(`===============================================`);
            console.log(`🚀 LISON Server running on port ${PORT}`);
            console.log(`📚 Relational Database connected & verified.`);
            console.log(`===============================================`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
