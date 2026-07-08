import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  UserProfile, 
  Task, 
  Goal, 
  Note, 
  Expense, 
  Birthday, 
  Medicine, 
  ShoppingItem, 
  Settings, 
  SystemLog 
} from '../types';

interface AppContextType {
  user: User | null;
  profile: UserProfile | null;
  settings: Settings;
  tasks: Task[];
  goals: Goal[];
  notes: Note[];
  expenses: Expense[];
  birthdays: Birthday[];
  medicines: Medicine[];
  shopping: ShoppingItem[];
  systemLogs: SystemLog[];
  allUsers: UserProfile[];
  loading: boolean;
  isAdmin: boolean;
  
  // Auth actions
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  editProfileDisplayName: (displayName: string) => Promise<void>;
  
  // Tasks CRUD
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  // Goals CRUD
  addGoal: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  
  // Notes CRUD
  addNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  
  // Expenses CRUD
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  
  // Birthdays CRUD
  addBirthday: (birthday: Omit<Birthday, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateBirthday: (birthdayId: string, updates: Partial<Birthday>) => Promise<void>;
  deleteBirthday: (birthdayId: string) => Promise<void>;
  
  // Medicines CRUD
  addMedicine: (medicine: Omit<Medicine, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateMedicine: (medicineId: string, updates: Partial<Medicine>) => Promise<void>;
  deleteMedicine: (medicineId: string) => Promise<void>;
  
  // Shopping CRUD
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateShoppingItem: (itemId: string, updates: Partial<ShoppingItem>) => Promise<void>;
  deleteShoppingItem: (itemId: string) => Promise<void>;

  // Admin Actions
  logAction: (action: string, details: string) => Promise<void>;
  deleteUserAndData: (targetUid: string) => Promise<void>;
  clearLogs: () => Promise<void>;
  forceRefreshUsers: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: Settings = {
  userId: '',
  darkMode: false,
  language: 'en',
  updatedAt: new Date().toISOString()
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);

  // Lists
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  
  // Admin Data
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  const isAdmin = profile?.role === 'admin';

  // Log user actions to Firestore
  const logAction = async (action: string, details: string) => {
    if (!user) return;
    const logPath = 'system_logs';
    try {
      await addDoc(collection(db, logPath), {
        userId: user.uid,
        userEmail: user.email || 'unknown',
        action,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Could not write system log:", err);
    }
  };

  // Auth: Log in with Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;
      
      // Check/create user profile in Firestore
      const userDocRef = doc(db, 'users', loggedUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let finalRole: 'user' | 'admin' = 'user';
      // Auto-assign admin if email matches standard user
      if (loggedUser.email === 'asankaudayak31@gmail.com') {
        finalRole = 'admin';
      }

      if (!userDoc.exists()) {
        const newProfile: UserProfile = {
          uid: loggedUser.uid,
          name: loggedUser.displayName || 'User',
          email: loggedUser.email || '',
          role: finalRole,
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
        
        // Setup initial default settings
        const initSettings: Settings = {
          userId: loggedUser.uid,
          darkMode: false,
          language: 'en',
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'settings', loggedUser.uid), initSettings);
        setSettings(initSettings);
        
        await logAction("Register Profile", "Created new profile with Google");
      } else {
        const existingProfile = userDoc.data() as UserProfile;
        // Make sure admin status is enforced if email matches but role wasn't set to admin yet
        if (loggedUser.email === 'asankaudayak31@gmail.com' && existingProfile.role !== 'admin') {
          existingProfile.role = 'admin';
          await updateDoc(userDocRef, { role: 'admin' });
        }
        setProfile(existingProfile);
        await logAction("Login", "Logged in with Google");
      }
    } catch (err) {
      console.error("Google Auth error:", err);
    }
  };

  // Auth: Log out
  const logout = async () => {
    if (user) {
      await logAction("Logout", "User logged out");
    }
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setSettings(defaultSettings);
    // Clear state arrays
    setTasks([]);
    setGoals([]);
    setNotes([]);
    setExpenses([]);
    setBirthdays([]);
    setMedicines([]);
    setShopping([]);
  };

  // App Settings CRUD
  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!user) return;
    const path = `settings/${user.uid}`;
    try {
      const merged = { ...settings, ...newSettings, updatedAt: new Date().toISOString() };
      await setDoc(doc(db, 'settings', user.uid), merged);
      setSettings(merged);
      await logAction("Update Settings", `Language: ${merged.language}, Dark Mode: ${merged.darkMode}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const editProfileDisplayName = async (displayName: string) => {
    if (!user) return;
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, 'users', user.uid), { name: displayName });
      if (profile) {
        setProfile({ ...profile, name: displayName });
      }
      await logAction("Update Profile", `Changed display name to ${displayName}`);
    } catch (err) {
      console.error("Error updating display name", err);
    }
  };

  // Synchronize users for admin panel
  const forceRefreshUsers = async () => {
    if (!isAdmin) return;
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const list = snapshot.docs.map(doc => doc.data() as UserProfile);
      setAllUsers(list);
    } catch (err) {
      console.error("Error refreshing users list", err);
    }
  };

  // Tasks CRUD
  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const path = 'tasks';
    try {
      const id = doc(collection(db, path)).id;
      const newTask: Task = {
        ...taskData,
        id,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, path, id), newTask);
      await logAction("Create Task", `Task: ${newTask.title}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const path = `tasks/${taskId}`;
    try {
      await updateDoc(doc(db, 'tasks', taskId), updates);
      await logAction("Update Task", `Task ID: ${taskId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteTask = async (taskId: string) => {
    const path = `tasks/${taskId}`;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      await logAction("Delete Task", `Task ID: ${taskId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Goals CRUD
  const addGoal = async (goalData: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const path = 'goals';
    try {
      const id = doc(collection(db, path)).id;
      const newGoal: Goal = {
        ...goalData,
        id,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, path, id), newGoal);
      await logAction("Create Goal", `Goal: ${newGoal.title}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    const path = `goals/${goalId}`;
    try {
      await updateDoc(doc(db, 'goals', goalId), updates);
      await logAction("Update Goal", `Goal ID: ${goalId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteGoal = async (goalId: string) => {
    const path = `goals/${goalId}`;
    try {
      await deleteDoc(doc(db, 'goals', goalId));
      await logAction("Delete Goal", `Goal ID: ${goalId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Notes CRUD
  const addNote = async (noteData: Omit<Note, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const path = 'notes';
    try {
      const id = doc(collection(db, path)).id;
      const newNote: Note = {
        ...noteData,
        id,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, path, id), newNote);
      await logAction("Create Note", `Note: ${newNote.title}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    const path = `notes/${noteId}`;
    try {
      await updateDoc(doc(db, 'notes', noteId), updates);
      await logAction("Update Note", `Note ID: ${noteId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteNote = async (noteId: string) => {
    const path = `notes/${noteId}`;
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      await logAction("Delete Note", `Note ID: ${noteId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Expenses CRUD
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const path = 'expenses';
    try {
      const id = doc(collection(db, path)).id;
      const newExpense: Expense = {
        ...expenseData,
        id,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, path, id), newExpense);
      await logAction("Create Expense", `${newExpense.type === 'income' ? 'Income' : 'Expense'}: ${newExpense.title} - ${newExpense.amount}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    const path = `expenses/${expenseId}`;
    try {
      await updateDoc(doc(db, 'expenses', expenseId), updates);
      await logAction("Update Expense", `Expense ID: ${expenseId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    const path = `expenses/${expenseId}`;
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
      await logAction("Delete Expense", `Expense ID: ${expenseId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Birthdays CRUD
  const addBirthday = async (bdayData: Omit<Birthday, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const path = 'birthdays';
    try {
      const id = doc(collection(db, path)).id;
      const newBday: Birthday = {
        ...bdayData,
        id,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, path, id), newBday);
      await logAction("Create Birthday", `Birthday for ${newBday.name}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateBirthday = async (birthdayId: string, updates: Partial<Birthday>) => {
    const path = `birthdays/${birthdayId}`;
    try {
      await updateDoc(doc(db, 'birthdays', birthdayId), updates);
      await logAction("Update Birthday", `Birthday ID: ${birthdayId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteBirthday = async (birthdayId: string) => {
    const path = `birthdays/${birthdayId}`;
    try {
      await deleteDoc(doc(db, 'birthdays', birthdayId));
      await logAction("Delete Birthday", `Birthday ID: ${birthdayId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Medicines CRUD
  const addMedicine = async (medData: Omit<Medicine, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const path = 'medicines';
    try {
      const id = doc(collection(db, path)).id;
      const newMed: Medicine = {
        ...medData,
        id,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, path, id), newMed);
      await logAction("Create Medicine Reminder", `Medicine: ${newMed.name}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateMedicine = async (medicineId: string, updates: Partial<Medicine>) => {
    const path = `medicines/${medicineId}`;
    try {
      await updateDoc(doc(db, 'medicines', medicineId), updates);
      await logAction("Update Medicine", `Medicine ID: ${medicineId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteMedicine = async (medicineId: string) => {
    const path = `medicines/${medicineId}`;
    try {
      await deleteDoc(doc(db, 'medicines', medicineId));
      await logAction("Delete Medicine", `Medicine ID: ${medicineId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Shopping CRUD
  const addShoppingItem = async (itemData: Omit<ShoppingItem, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const path = 'shopping';
    try {
      const id = doc(collection(db, path)).id;
      const newItem: ShoppingItem = {
        ...itemData,
        id,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, path, id), newItem);
      await logAction("Create Shopping Item", `Item: ${newItem.name}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateShoppingItem = async (itemId: string, updates: Partial<ShoppingItem>) => {
    const path = `shopping/${itemId}`;
    try {
      await updateDoc(doc(db, 'shopping', itemId), updates);
      await logAction("Update Shopping Item", `Item ID: ${itemId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteShoppingItem = async (itemId: string) => {
    const path = `shopping/${itemId}`;
    try {
      await deleteDoc(doc(db, 'shopping', itemId));
      await logAction("Delete Shopping Item", `Item ID: ${itemId}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Admin Action: Delete User and all associated documents
  const deleteUserAndData = async (targetUid: string) => {
    if (!isAdmin) return;
    try {
      // 1. Delete user profile
      await deleteDoc(doc(db, 'users', targetUid));
      // 2. Delete user settings
      await deleteDoc(doc(db, 'settings', targetUid));
      
      // 3. Delete collections items (we delete from local state and DB manually)
      const deleteCollectionItems = async (collectionName: string) => {
        const q = query(collection(db, collectionName), where('userId', '==', targetUid));
        const snap = await getDocs(q);
        const batchPromises = snap.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(batchPromises);
      };

      await Promise.all([
        deleteCollectionItems('tasks'),
        deleteCollectionItems('goals'),
        deleteCollectionItems('notes'),
        deleteCollectionItems('expenses'),
        deleteCollectionItems('birthdays'),
        deleteCollectionItems('medicines'),
        deleteCollectionItems('shopping')
      ]);

      await logAction("Admin Action", `Deleted user ${targetUid} and all associated data.`);
      // Refresh local users
      await forceRefreshUsers();
    } catch (err) {
      console.error("Admin user delete failed:", err);
    }
  };

  // Admin Action: Clear all logs
  const clearLogs = async () => {
    if (!isAdmin) return;
    try {
      const snap = await getDocs(collection(db, 'system_logs'));
      await Promise.all(snap.docs.map(doc => deleteDoc(doc.ref)));
      setSystemLogs([]);
      await logAction("Admin Action", "Cleared activity logs");
    } catch (err) {
      console.error("Admin clear logs failed:", err);
    }
  };

  // Effect: Bind firebase auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let finalRole: 'user' | 'admin' = 'user';
        if (currentUser.email === 'asankaudayak31@gmail.com') {
          finalRole = 'admin';
        }

        if (userDoc.exists()) {
          const prof = userDoc.data() as UserProfile;
          if (currentUser.email === 'asankaudayak31@gmail.com' && prof.role !== 'admin') {
            prof.role = 'admin';
            await updateDoc(userDocRef, { role: 'admin' });
          }
          setProfile(prof);
        } else {
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            email: currentUser.email || '',
            role: finalRole,
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, newProfile);
          setProfile(newProfile);
          
          // Settings
          const initSettings: Settings = {
            userId: currentUser.uid,
            darkMode: false,
            language: 'en',
            updatedAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'settings', currentUser.uid), initSettings);
          setSettings(initSettings);
        }

        // Fetch settings real-time
        const settingsUnsub = onSnapshot(doc(db, 'settings', currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setSettings(docSnap.data() as Settings);
          }
        }, (err) => {
          console.error("Settings listener error:", err);
        });

        // Setup individual collection listeners
        const collectionsToSync = [
          { name: 'tasks', setter: setTasks, order: 'dueDate' },
          { name: 'goals', setter: setGoals, order: 'createdAt' },
          { name: 'notes', setter: setNotes, order: 'createdAt' },
          { name: 'expenses', setter: setExpenses, order: 'date' },
          { name: 'birthdays', setter: setBirthdays, order: 'date' },
          { name: 'medicines', setter: setMedicines, order: 'createdAt' },
          { name: 'shopping', setter: setShopping, order: 'createdAt' }
        ];

        const listeners = collectionsToSync.map(colDef => {
          const q = query(
            collection(db, colDef.name), 
            where('userId', '==', currentUser.uid)
          );
          return onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => doc.data());
            // Sort client-side to simplify query requirements and avoid missing index crashes
            if (colDef.order === 'dueDate' || colDef.order === 'date') {
              list.sort((a, b) => new Date(a[colDef.order]).getTime() - new Date(b[colDef.order]).getTime());
            } else {
              list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            }
            colDef.setter(list as any);
          }, (err) => {
            console.error(`Collection ${colDef.name} listener error:`, err);
          });
        });

        // Setup Admin Listeners if admin
        let adminUnsubLogs: () => void = () => {};
        if (currentUser.email === 'asankaudayak31@gmail.com') {
          // Listen to system logs
          const logsQuery = query(collection(db, 'system_logs'), orderBy('timestamp', 'desc'), limit(150));
          adminUnsubLogs = onSnapshot(logsQuery, (snapshot) => {
            const logsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as SystemLog);
            setSystemLogs(logsList);
          }, (err) => {
            console.error("Admin logs listener error:", err);
          });
          
          forceRefreshUsers();
        }

        setLoading(false);

        return () => {
          settingsUnsub();
          listeners.forEach(unsub => unsub());
          adminUnsubLogs();
        };
      } else {
        setProfile(null);
        setSettings(defaultSettings);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Apply dark mode theme class to HTML element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return (
    <AppContext.Provider value={{
      user,
      profile,
      settings,
      tasks,
      goals,
      notes,
      expenses,
      birthdays,
      medicines,
      shopping,
      systemLogs,
      allUsers,
      loading,
      isAdmin,
      loginWithGoogle,
      logout,
      updateSettings,
      editProfileDisplayName,
      addTask,
      updateTask,
      deleteTask,
      addGoal,
      updateGoal,
      deleteGoal,
      addNote,
      updateNote,
      deleteNote,
      addExpense,
      updateExpense,
      deleteExpense,
      addBirthday,
      updateBirthday,
      deleteBirthday,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      addShoppingItem,
      updateShoppingItem,
      deleteShoppingItem,
      logAction,
      deleteUserAndData,
      clearLogs,
      forceRefreshUsers
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
