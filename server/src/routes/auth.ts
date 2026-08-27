import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_block_crush_token';

// Register User
router.post('/register', async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
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
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login User
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
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
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
