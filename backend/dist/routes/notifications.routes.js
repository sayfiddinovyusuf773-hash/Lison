"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../db/index");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all notifications for current user
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await (0, index_1.queryAll)(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`, [userId]);
        const unreadCount = notifications.filter((n) => n.is_read === 0).length;
        res.json({
            success: true,
            unread_count: unreadCount,
            notifications
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Bildirishnomalarni yuklab bo\'lmadi.' });
    }
});
// Mark single notification as read
router.put('/:id/read', auth_1.authenticateToken, async (req, res) => {
    try {
        const notifId = req.params.id;
        const userId = req.user.id;
        await (0, index_1.executeRun)(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [notifId, userId]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi.' });
    }
});
// Mark all as read
router.put('/read-all', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await (0, index_1.executeRun)(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId]);
        res.json({ success: true, message: 'Barcha bildirishnomalar o\'qildi deb belgilandi.' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Xatolik yuz berdi.' });
    }
});
exports.default = router;
