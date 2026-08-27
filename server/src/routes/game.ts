import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_block_crush_token';

// Middleware to authenticate token
const authenticateToken = (req: any, res: Response, next: () => void) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied: token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Access denied: invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Sync Game Progress
router.put('/sync', authenticateToken as any, async (req: any, res: Response): Promise<any> => {
  try {
    const { profile, stats } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update progress fields
    if (profile) {
      if (typeof profile.level === 'number') user.level = profile.level;
      if (typeof profile.xp === 'number') user.xp = profile.xp;
      if (typeof profile.coins === 'number') user.coins = profile.coins;
      if (typeof profile.diamonds === 'number') user.diamonds = profile.diamonds;
    }

    // Update stats fields
    if (stats) {
      if (typeof stats.highScore === 'number') user.highScore = Math.max(user.highScore || 0, stats.highScore);
      if (typeof stats.gamesPlayed === 'number') user.gamesPlayed = stats.gamesPlayed;
      if (typeof stats.linesCleared === 'number') user.linesCleared = stats.linesCleared;
      if (typeof stats.bestCombo === 'number') user.bestCombo = stats.bestCombo;
      if (typeof stats.coinsEarned === 'number') user.coinsEarned = stats.coinsEarned;
    }

    await user.save();

    res.json({
      success: true,
      user: {
        username: user.username,
        level: user.level,
        xp: user.xp,
        coins: user.coins,
        diamonds: user.diamonds,
        highScore: user.highScore,
        stats: {
          gamesPlayed: user.gamesPlayed,
          linesCleared: user.linesCleared,
          bestCombo: user.bestCombo,
          coinsEarned: user.coinsEarned,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Fetch Leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const topUsers = await User.find()
      .sort({ highScore: -1 })
      .limit(10)
      .select('username highScore level');

    const formattedLeaderboard = topUsers.map((u, index) => ({
      rank: index + 1,
      username: u.username,
      highScore: u.highScore || 0,
      level: u.level || 1,
    }));

    res.json(formattedLeaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
