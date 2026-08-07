export type CompanionType = 'Sproutling' | 'Sage Pup' | 'Lumo';
export type SeedlingStatus = 'active' | 'archived';

export interface GardenerProfile {
  uid: string;
  displayName: string;
  email?: string;
  bio: string;
  companionName: string;
  companionType: CompanionType;
  companionXp: number;
  streakDays: number;
  lastActiveDate: string; // ISO format
  theme: 'alabaster' | 'forest' | 'midnight' | 'clay' | 'cyberpunk';
  pushNotifications: boolean;
  hapticFeedback?: boolean;
  profilePicture?: string;
  discordStatus?: 'online' | 'idle' | 'dnd' | 'offline';
}

export interface SeedlingNode {
  id: string;
  userId: string;
  title: string;
  content: string; // Markdown supported
  tags: string[];
  isTask: boolean;
  isCompleted: boolean;
  status: SeedlingStatus;
  clonedFrom?: string; // templates reference if cloned
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface ActivityMetric {
  id: string;
  userId: string;
  actionText: string;
  xpGained: number;
  timestamp: string; // ISO string
}

export interface CompanionDetail {
  type: CompanionType;
  name: string;
  title: string;
  xp: number;
  level: number;
  bond: string; // e.g. "Trusted Botanist", "Loyal Companion"
  description: string;
  quote: string;
  avatarEmoji: string;
}

export interface NotificationAlert {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'care' | 'plant' | 'system' | 'achievement';
  read: boolean;
}
