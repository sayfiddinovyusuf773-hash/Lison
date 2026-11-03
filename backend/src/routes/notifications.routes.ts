import { Router, Response } from 'express';
import { queryAll, executeRun } from '../db/index';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Get all notifications for current user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const notifications = await queryAll(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );

    const unreadCount = notifications.filter((n: any) => n.is_read === 0).length;

    res.json({
      success: true,
      unread_count: unreadCount,
      notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Bildirishnomalarni yuklab bo\'lmadi.' });
  }
});

// Mark single notification as read
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifId = req.params.id;
    const userId = req.user!.id;

    await executeRun(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [notifId, userId]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi.' });
  }
});

// Mark all as read
router.put('/read-all', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    await executeRun(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId]);
    res.json({ success: true, message: 'Barcha bildirishnomalar o\'qildi deb belgilandi.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi.' });
  }
});

export default router;
