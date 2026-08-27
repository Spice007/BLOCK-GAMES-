import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  coins: { type: Number, default: 500 },
  diamonds: { type: Number, default: 50 },
  highScore: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  linesCleared: { type: Number, default: 0 },
  bestCombo: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
}, { timestamps: true });

export const User = model('User', UserSchema);
export default User;
