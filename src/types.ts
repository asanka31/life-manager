export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: string; // YYYY-MM-DD
  reminderTime?: string; // HH:MM
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  notes?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  current: number;
  target: number;
  createdAt: string;
}

export interface NoteChecklistItem {
  text: string;
  checked: boolean;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  checklist?: NoteChecklistItem[];
  tags?: string[];
  images?: string[];
  voiceNotes?: string[];
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Birthday {
  id: string;
  userId: string;
  name: string;
  date: string; // YYYY-MM-DD
  phone?: string;
  photoUrl?: string;
  reminderTime?: string; // HH:MM
  createdAt: string;
}

export interface Medicine {
  id: string;
  userId: string;
  name: string;
  dose: string;
  time: string; // HH:MM
  repeat: 'daily' | 'weekly' | 'monthly' | 'as_needed';
  notification: boolean;
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  userId: string;
  name: string;
  category: string;
  quantity: number;
  purchased: boolean;
  createdAt: string;
}

export interface Settings {
  userId: string;
  darkMode: boolean;
  language: 'en' | 'si'; // English, Sinhala
  updatedAt: string;
}

export interface SystemLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}
