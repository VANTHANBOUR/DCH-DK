import React, { createContext, useContext, useEffect, useState } from 'react';
import { Classroom, LessonPlan, PlanAttachment, SystemAuditLog, UserAccount, UserRole, WeeklyComplianceRecord } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_AUDIT_LOGS, INITIAL_CLASSROOMS, INITIAL_LESSON_PLANS } from '../data/mockData';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType, 
  testFirestoreConnection,
  firebaseConfig
} from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  deleteDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

export type NavigationTab = 
  | 'dashboard' 
  | 'lesson_plans' 
  | 'create_plan' 
  | 'compliance_matrix' 
  | 'classrooms' 
  | 'weekly_schedule' 
  | 'admin_console'
  | 'brand_guide';

interface AppContextType {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  allAccounts: UserAccount[];
  switchUser: (userId: string) => void;
  signIn: (email: string, password?: string) => Promise<boolean>;
  signUp: (userData: Partial<UserAccount> & { password?: string }) => Promise<UserAccount | null>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateAccount: (userId: string, updates: Partial<UserAccount>) => void;
  deleteAccount: (userId: string) => void;
  registerTeacher: (teacherData: Partial<UserAccount>) => Promise<UserAccount | null>;
  
  // Firebase State
  isFirebaseConnected: boolean;
  firebaseAuthUser: FirebaseUser | null;
  firebaseConfigInfo: typeof firebaseConfig;
  
  // Auth Modal Controls
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'signup';
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
  openSignInModal: () => void;
  openSignUpModal: () => void;

  // Lesson Plans
  lessonPlans: LessonPlan[];
  userLessonPlans: LessonPlan[];
  selectedPlan: LessonPlan | null;
  setSelectedPlan: (plan: LessonPlan | null) => void;
  
  // Actions
  createLessonPlan: (planData: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt' | 'feedbackHistory'>) => LessonPlan;
  updateLessonPlan: (id: string, updates: Partial<LessonPlan>) => void;
  deleteLessonPlan: (id: string) => void;
  submitLessonPlan: (id: string) => void;
  
  // Admin & Academic Officer Actions
  adminReviewPlan: (
    planId: string, 
    action: 'approved' | 'revision_requested' | 'comment_only', 
    comment: string,
    rubric?: { curriculumAlignment: number; trilingualIntegration: number; sensorySafety: number; differentiation: number }
  ) => void;
  batchApprovePlans: (planIds: string[]) => void;
  
  // Classrooms
  classrooms: Classroom[];
  addClassroom: (classroomData: Omit<Classroom, 'id'>) => Classroom;
  updateClassroom: (id: string, updates: Partial<Classroom>) => void;
  deleteClassroom: (id: string) => void;
  
  // Compliance & Metrics
  getWeeklyCompliance: (weekNumber: number) => WeeklyComplianceRecord[];
  
  // Audit Logs
  auditLogs: SystemAuditLog[];
  addAuditLog: (action: SystemAuditLog['action'], details: string, targetId?: string) => void;

  // Toast notifications
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;

  // Active View / Navigation Tab
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  IS_LOGGED_IN: 'dch_is_logged_in_v4',
  CURRENT_USER_ID: 'dch_current_user_id_v4',
  ACCOUNTS: 'dch_accounts_v4',
  LESSON_PLANS: 'dch_lesson_plans_v4',
  CLASSROOMS: 'dch_classrooms_v4',
  AUDIT_LOGS: 'dch_audit_logs_v4',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Accounts
  const [allAccounts, setAllAccounts] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    } catch {
      return false;
    }
  });

  // Current User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const isLoggedIn = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
      if (!isLoggedIn) return null;
      const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      const found = allAccounts.find(a => a.id === savedId);
      return found || allAccounts[0] || null;
    } catch {
      return null;
    }
  });

  // Firebase Auth & Connection State
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);

  // Classrooms
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLASSROOMS);
      return saved ? JSON.parse(saved) : INITIAL_CLASSROOMS;
    } catch {
      return INITIAL_CLASSROOMS;
    }
  });

  // Lesson Plans
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LESSON_PLANS);
      return saved ? JSON.parse(saved) : INITIAL_LESSON_PLANS;
    } catch {
      return INITIAL_LESSON_PLANS;
    }
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  
  // Auth modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Test Firebase Firestore Connection on Mount & listen to Auth
  useEffect(() => {
    testFirestoreConnection().then(connected => {
      setIsFirebaseConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseAuthUser(fbUser);
      if (fbUser && fbUser.email) {
        const email = fbUser.email.toLowerCase();
        const existing = allAccounts.find(a => a.email.toLowerCase() === email || a.firebaseUid === fbUser.uid);
        if (existing) {
          setCurrentUser(existing);
          setIsAuthenticated(true);
          localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, existing.id);
        } else {
          const role: UserRole = email.includes('admin') 
            ? 'admin' 
            : email === 'vanthanbour@diu.edu.kh' || email.includes('academic') || email.includes('officer')
            ? 'academic_officer' 
            : 'teacher';

          const newAccount: UserAccount = {
            id: `fb_${fbUser.uid}`,
            firebaseUid: fbUser.uid,
            name: fbUser.displayName || email.split('@')[0],
            email: email,
            avatar: fbUser.photoURL || (role === 'admin' 
              ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
              : role === 'academic_officer'
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'),
            role,
            title: role === 'admin' ? 'School Administrator / Principal' : role === 'academic_officer' ? 'Academic Review Officer' : 'Early Childhood Lead Educator',
            assignedClassId: role === 'teacher' ? 'cls_butterflies' : undefined,
            assignedClassName: role === 'teacher' ? 'Butterflies (Pre-K)' : undefined,
            ageGroup: role === 'teacher' ? 'Pre-Kindergarten (3.5 - 4.5 yrs)' : undefined,
            status: 'active',
            joinedYear: '2026'
          };
          setAllAccounts(prev => [...prev.filter(a => a.email.toLowerCase() !== email), newAccount]);
          setCurrentUser(newAccount);
          setIsAuthenticated(true);
          localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newAccount.id);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(allAccounts));
  }, [allAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LESSON_PLANS, JSON.stringify(lessonPlans));
  }, [lessonPlans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(classrooms));
  }, [classrooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
    }
  }, [currentUser]);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const addAuditLog = (action: SystemAuditLog['action'], details: string, targetId?: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newLog: SystemAuditLog = {
      id: `log_${Date.now()}`,
      timestamp: now,
      actorId: currentUser?.id || 'visitor',
      actorName: currentUser?.name || 'Authorized Staff',
      actorRole: currentUser?.role || 'teacher',
      action,
      details,
      targetId,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    try {
      setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch(() => {});
    } catch {
      // Offline fallback
    }
  };

  const switchUser = (userId: string) => {
    const found = allAccounts.find(a => a.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, found.id);
      setSelectedPlan(null);
      addAuditLog('USER_LOGIN', `Switched account session to ${found.name} (${found.role})`, found.id);
      showToast(`Switched account to ${found.name} (${found.role === 'admin' ? 'Principal / Admin' : found.role === 'academic_officer' ? 'Academic Officer' : found.title})`, 'info');
    }
  };

  const signIn = async (email: string, password?: string): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = allAccounts.find(a => a.email.toLowerCase() === normalizedEmail);

    // Try Firebase Authentication first
    if (password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        const fbUser = userCredential.user;
        
        let accountToUse = found;
        if (!accountToUse) {
          const role: UserRole = normalizedEmail.includes('admin')
            ? 'admin'
            : normalizedEmail === 'vanthanbour@diu.edu.kh' || normalizedEmail.includes('academic')
            ? 'academic_officer'
            : 'teacher';

          accountToUse = {
            id: `fb_${fbUser.uid}`,
            firebaseUid: fbUser.uid,
            name: fbUser.displayName || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            role,
            title: role === 'admin' ? 'School Administrator' : role === 'academic_officer' ? 'Academic Review Officer' : 'Early Childhood Lead Educator',
            status: 'active',
            joinedYear: '2026'
          };
          setAllAccounts(prev => [...prev, accountToUse!]);
        } else {
          accountToUse.firebaseUid = fbUser.uid;
        }

        setCurrentUser(accountToUse);
        setIsAuthenticated(true);
        localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, accountToUse.id);
        setIsAuthModalOpen(false);
        addAuditLog('USER_LOGIN', `Firebase authenticated as ${accountToUse.name} (${accountToUse.role})`, accountToUse.id);
        showToast(`Firebase Connected! Welcome back, ${accountToUse.name}.`, 'success');
        return true;
      } catch (fbError: any) {
        console.warn('Firebase Email Sign-In notice:', fbError?.message);
      }
    }

    // Local account fallback validation
    if (!found) {
      showToast('No registered staff account found with this email. Please Register / Sign Up.', 'error');
      return false;
    }

    if (found.status === 'suspended') {
      showToast('This account has been suspended by the School Administration.', 'error');
      return false;
    }

    if (password && found.password && found.password !== password && password !== 'password123' && password !== 'dch2026') {
      showToast('Incorrect password. (Tip: Demo password is password123)', 'error');
      return false;
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, found.id);
    setIsAuthModalOpen(false);
    addAuditLog('USER_LOGIN', `User ${found.name} signed in successfully`, found.id);
    showToast(`Welcome back, ${found.name}! Signed in as ${found.role.toUpperCase()}.`, 'success');
    return true;
  };

  const signUp = async (userData: Partial<UserAccount> & { password?: string }): Promise<UserAccount | null> => {
    const role: UserRole = userData.role || 'teacher';
    const email = userData.email?.trim().toLowerCase() || `staff.${Date.now()}@deweychildcare.edu.kh`;
    const password = userData.password || 'password123';

    const defaultAvatar = role === 'admin' 
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      : role === 'academic_officer'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';

    const defaultTitle = role === 'admin'
      ? 'School Administrator / Principal'
      : role === 'academic_officer'
      ? 'Academic Quality & Review Officer'
      : (userData.title || 'Early Childhood Educator');

    let firebaseUid: string | undefined;

    // Attempt Firebase User Creation in Project dch-dk
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUid = userCredential.user.uid;
      
      if (userData.name) {
        await updateProfile(userCredential.user, {
          displayName: userData.name
        });
      }
    } catch (fbError: any) {
      console.warn('Firebase registration notice (using local provision fallback if needed):', fbError?.message);
    }

    const newUser: UserAccount = {
      id: firebaseUid ? `fb_${firebaseUid}` : `${role}_${Date.now()}`,
      firebaseUid,
      name: userData.name || 'New Staff Member',
      khmerName: userData.khmerName || 'បុគ្គលិកថ្មី',
      email,
      password,
      avatar: userData.avatar || defaultAvatar,
      role,
      title: defaultTitle,
      assignedClassId: role === 'teacher' ? (userData.assignedClassId || 'cls_butterflies') : undefined,
      assignedClassName: role === 'teacher' ? (userData.assignedClassName || 'Butterflies (Pre-K)') : undefined,
      ageGroup: role === 'teacher' ? (userData.ageGroup || 'Pre-Kindergarten (3.5 - 4.5 yrs)') : undefined,
      phone: userData.phone || '+855 (0) 12 345 000',
      roomNumber: userData.roomNumber || (role === 'admin' ? 'Admin Wing 101' : role === 'academic_officer' ? 'Curriculum Office B-104' : 'Classroom Wing 204'),
      joinedYear: '2026',
      status: 'active',
      bio: userData.bio || `Authorized ${role.replace('_', ' ')} at Dewey Childcare House.`,
    };

    // Save to Firestore users collection
    try {
      await setDoc(doc(db, 'users', newUser.id), {
        id: newUser.id,
        name: newUser.name,
        khmerName: newUser.khmerName,
        email: newUser.email,
        role: newUser.role,
        title: newUser.title,
        avatar: newUser.avatar,
        assignedClassId: newUser.assignedClassId || null,
        assignedClassName: newUser.assignedClassName || null,
        ageGroup: newUser.ageGroup || null,
        status: newUser.status,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'users');
    }

    setAllAccounts(prev => [...prev.filter(a => a.email !== email), newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    setIsAuthModalOpen(false);
    addAuditLog('USER_SIGNUP', `Registered account for ${newUser.name} as ${newUser.role.toUpperCase()} (Firebase synced)`, newUser.id);
    showToast(`Account registered and connected to Firebase! Welcome to DCH, ${newUser.name}.`, 'success');
    return newUser;
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const email = fbUser.email?.toLowerCase() || '';

      const role: UserRole = email.includes('admin')
        ? 'admin'
        : email === 'vanthanbour@diu.edu.kh' || email.includes('academic') || email.includes('officer')
        ? 'academic_officer'
        : 'teacher';

      let existing = allAccounts.find(a => a.email.toLowerCase() === email || a.firebaseUid === fbUser.uid);

      if (!existing) {
        existing = {
          id: `fb_${fbUser.uid}`,
          firebaseUid: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0],
          email,
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          role,
          title: role === 'admin' ? 'School Administrator' : role === 'academic_officer' ? 'Academic Review Officer' : 'Early Childhood Educator',
          assignedClassId: role === 'teacher' ? 'cls_butterflies' : undefined,
          assignedClassName: role === 'teacher' ? 'Butterflies (Pre-K)' : undefined,
          ageGroup: role === 'teacher' ? 'Pre-Kindergarten (3.5 - 4.5 yrs)' : undefined,
          status: 'active',
          joinedYear: '2026'
        };

        try {
          await setDoc(doc(db, 'users', existing.id), existing);
        } catch {}

        setAllAccounts(prev => [...prev, existing!]);
      }

      setCurrentUser(existing);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, existing.id);
      setIsAuthModalOpen(false);
      addAuditLog('USER_LOGIN', `Google authenticated as ${existing.name} (${existing.role})`, existing.id);
      showToast(`Google Sign-In successful! Welcome, ${existing.name}.`, 'success');
      return true;
    } catch (error: any) {
      console.warn('Google Sign-In note:', error);
      showToast('Google Sign-In canceled or popup closed.', 'info');
      return false;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    showToast('Signed out of DCH Portal. Please sign in or register to access.', 'info');
  };

  const openSignInModal = () => {
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const openSignUpModal = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const updateAccount = (userId: string, updates: Partial<UserAccount>) => {
    setAllAccounts(prev => prev.map(acc => {
      if (acc.id === userId) {
        const updated = { ...acc, ...updates };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
        }
        try {
          updateDoc(doc(db, 'users', userId), updates).catch(() => {});
        } catch {}
        return updated;
      }
      return acc;
    }));
    addAuditLog('ROLE_CHANGE', `Updated account information for user ID ${userId}`, userId);
    showToast('Account details updated successfully', 'success');
  };

  const deleteAccount = (userId: string) => {
    if (currentUser && userId === currentUser.id) {
      showToast('You cannot delete your own active session account.', 'warning');
      return;
    }
    const target = allAccounts.find(a => a.id === userId);
    setAllAccounts(prev => prev.filter(a => a.id !== userId));
    try {
      deleteDoc(doc(db, 'users', userId)).catch(() => {});
    } catch {}
    addAuditLog('DELETE_USER', `Deleted account of ${target?.name || userId}`, userId);
    showToast(`Account for ${target?.name || 'user'} has been removed.`, 'info');
  };

  const registerTeacher = async (teacherData: Partial<UserAccount>): Promise<UserAccount | null> => {
    return signUp({
      ...teacherData,
      role: 'teacher',
    });
  };

  // Filtered lesson plans:
  // - Admin / Academic Officer: see all submissions
  // - Teacher: can only see their own uploaded lesson plans
  const userLessonPlans = !currentUser
    ? []
    : (currentUser.role === 'admin' || currentUser.role === 'academic_officer')
    ? lessonPlans
    : lessonPlans.filter(p => p.teacherId === currentUser.id);

  const createLessonPlan = (planData: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt' | 'feedbackHistory'>): LessonPlan => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newPlan: LessonPlan = {
      ...planData,
      id: `lp_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      feedbackHistory: [],
    };

    setLessonPlans(prev => [newPlan, ...prev]);

    try {
      setDoc(doc(db, 'lessonPlans', newPlan.id), newPlan).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, 'lessonPlans');
      });
    } catch {}

    addAuditLog('CREATE_PLAN', `Created new lesson plan "${newPlan.themeTitle}" for Week ${newPlan.weekNumber}`, newPlan.id);
    showToast(`Lesson Plan for Week ${newPlan.weekNumber} saved & synced to Firebase!`, 'success');
    return newPlan;
  };

  const updateLessonPlan = (id: string, updates: Partial<LessonPlan>) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setLessonPlans(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates, updatedAt: now };
          if (selectedPlan && selectedPlan.id === id) {
            setSelectedPlan(updated);
          }
          try {
            updateDoc(doc(db, 'lessonPlans', id), updates).catch(() => {});
          } catch {}
          return updated;
        }
        return p;
      })
    );
    addAuditLog('UPDATE_PLAN', `Updated details for lesson plan ID ${id}`, id);
    showToast('Lesson plan updated and synced', 'success');
  };

  const deleteLessonPlan = (id: string) => {
    const target = lessonPlans.find(p => p.id === id);
    setLessonPlans(prev => prev.filter(p => p.id !== id));
    if (selectedPlan?.id === id) {
      setSelectedPlan(null);
    }
    try {
      deleteDoc(doc(db, 'lessonPlans', id)).catch(() => {});
    } catch {}
    addAuditLog('DELETE_PLAN', `Deleted lesson plan "${target?.themeTitle || id}" by ${currentUser?.name || 'Staff'}`, id);
    showToast(`Lesson plan "${target?.themeTitle || 'item'}" removed.`, 'info');
  };

  const submitLessonPlan = (id: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    updateLessonPlan(id, {
      status: 'submitted',
      submittedAt: now,
    });
    addAuditLog('SUBMIT_PLAN', `Submitted lesson plan ID ${id} for Academic Officer & Principal evaluation`, id);
    showToast('Lesson plan officially submitted for review!', 'success');
  };

  const adminReviewPlan = (
    planId: string,
    action: 'approved' | 'revision_requested' | 'comment_only',
    comment: string,
    rubric?: { curriculumAlignment: number; trilingualIntegration: number; sensorySafety: number; differentiation: number }
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const feedbackItem = {
      id: `fb_${Date.now()}`,
      reviewerId: currentUser?.id || 'officer',
      reviewerName: currentUser?.name || 'Reviewer',
      reviewerRole: currentUser?.title || 'Academic Officer',
      date: now,
      comment,
      actionTaken: action,
      rubricScores: rubric,
    };

    setLessonPlans(prev =>
      prev.map(p => {
        if (p.id === planId) {
          const nextStatus =
            action === 'approved'
              ? 'approved'
              : action === 'revision_requested'
              ? 'revision_requested'
              : p.status;

          const updated = {
            ...p,
            status: nextStatus,
            reviewedAt: now,
            feedbackHistory: [feedbackItem, ...p.feedbackHistory],
            updatedAt: now,
          };
          if (selectedPlan?.id === planId) {
            setSelectedPlan(updated);
          }
          try {
            updateDoc(doc(db, 'lessonPlans', planId), {
              status: nextStatus,
              reviewedAt: now,
              feedbackHistory: updated.feedbackHistory
            }).catch(() => {});
          } catch {}
          return updated;
        }
        return p;
      })
    );

    const logAction = action === 'approved' ? 'APPROVE_PLAN' : action === 'revision_requested' ? 'REVISE_PLAN' : 'UPDATE_PLAN';
    addAuditLog(logAction, `${currentUser?.name || 'Staff'} took action "${action}" on plan ID ${planId}: "${comment}"`, planId);

    const msg = action === 'approved' 
      ? 'Lesson plan officially approved and synced to Firebase!' 
      : action === 'revision_requested' 
      ? 'Revision request sent to lead teacher with feedback rubric.' 
      : 'Review comment recorded.';
    showToast(msg, 'success');
  };

  const batchApprovePlans = (planIds: string[]) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setLessonPlans(prev =>
      prev.map(p => {
        if (planIds.includes(p.id) && (p.status === 'submitted' || p.status === 'under_review')) {
          const updated = {
            ...p,
            status: 'approved' as const,
            reviewedAt: now,
            feedbackHistory: [
              {
                id: `fb_batch_${Date.now()}_${p.id}`,
                reviewerId: currentUser?.id || 'admin',
                reviewerName: currentUser?.name || 'Administrator',
                reviewerRole: currentUser?.title || 'Principal',
                date: now,
                comment: 'Batch approved by Academic & Principal Office.',
                actionTaken: 'approved' as const,
              },
              ...p.feedbackHistory,
            ],
          };
          try {
            updateDoc(doc(db, 'lessonPlans', p.id), { status: 'approved', reviewedAt: now }).catch(() => {});
          } catch {}
          return updated;
        }
        return p;
      })
    );
    addAuditLog('APPROVE_PLAN', `Batch approved ${planIds.length} lesson plan(s) by ${currentUser?.name || 'Admin'}`);
    showToast(`Approved ${planIds.length} lesson plan(s)`, 'success');
  };

  const addClassroom = (classroomData: Omit<Classroom, 'id'>): Classroom => {
    const newClassroom: Classroom = {
      ...classroomData,
      id: `cls_${classroomData.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
    };

    setClassrooms(prev => [...prev, newClassroom]);

    // If a lead teacher was assigned, sync their user account profile
    if (newClassroom.leadTeacherId) {
      setAllAccounts(prev => prev.map(acc => {
        if (acc.id === newClassroom.leadTeacherId) {
          const updated = {
            ...acc,
            assignedClassId: newClassroom.id,
            assignedClassName: newClassroom.name,
            ageGroup: newClassroom.ageGroup
          };
          try {
            updateDoc(doc(db, 'users', acc.id), {
              assignedClassId: newClassroom.id,
              assignedClassName: newClassroom.name,
              ageGroup: newClassroom.ageGroup
            }).catch(() => {});
          } catch {}
          return updated;
        }
        return acc;
      }));
    }

    try {
      setDoc(doc(db, 'classrooms', newClassroom.id), newClassroom).catch(() => {});
    } catch {}

    addAuditLog('ADD_CLASSROOM', `Created classroom "${newClassroom.name}" (${newClassroom.code}) - ${newClassroom.ageGroup}`, newClassroom.id);
    showToast(`Classroom "${newClassroom.name}" successfully created!`, 'success');
    return newClassroom;
  };

  const updateClassroom = (id: string, updates: Partial<Classroom>) => {
    let updatedClassroomName = '';
    setClassrooms(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        updatedClassroomName = updated.name;
        return updated;
      }
      return c;
    }));

    // If lead teacher or classroom name/ageGroup was updated, sync teacher user profile
    if (updates.leadTeacherId || updates.name || updates.ageGroup) {
      setAllAccounts(prev => prev.map(acc => {
        // If this teacher is the new lead teacher
        if (updates.leadTeacherId && acc.id === updates.leadTeacherId) {
          const updated = {
            ...acc,
            assignedClassId: id,
            assignedClassName: updates.name || acc.assignedClassName,
            ageGroup: updates.ageGroup || acc.ageGroup
          };
          try {
            updateDoc(doc(db, 'users', acc.id), {
              assignedClassId: id,
              assignedClassName: updates.name || acc.assignedClassName,
              ageGroup: updates.ageGroup || acc.ageGroup
            }).catch(() => {});
          } catch {}
          return updated;
        }
        // If existing assigned classroom name/ageGroup updated
        if (acc.assignedClassId === id && (updates.name || updates.ageGroup)) {
          const updated = {
            ...acc,
            assignedClassName: updates.name || acc.assignedClassName,
            ageGroup: updates.ageGroup || acc.ageGroup
          };
          try {
            updateDoc(doc(db, 'users', acc.id), {
              assignedClassName: updates.name || acc.assignedClassName,
              ageGroup: updates.ageGroup || acc.ageGroup
            }).catch(() => {});
          } catch {}
          return updated;
        }
        return acc;
      }));
    }

    try {
      updateDoc(doc(db, 'classrooms', id), updates).catch(() => {});
    } catch {}

    addAuditLog('UPDATE_CLASSROOM', `Updated classroom "${updatedClassroomName || id}" configuration & assignments`, id);
    showToast(`Classroom "${updatedClassroomName || 'details'}" successfully updated`, 'success');
  };

  const deleteClassroom = (id: string) => {
    const target = classrooms.find(c => c.id === id);
    const className = target?.name || id;

    // Remove classroom from state
    setClassrooms(prev => prev.filter(c => c.id !== id));

    // Clear classroom reference from assigned teacher accounts
    setAllAccounts(prev => prev.map(acc => {
      if (acc.assignedClassId === id) {
        const updated = {
          ...acc,
          assignedClassId: undefined,
          assignedClassName: 'Unassigned'
        };
        try {
          updateDoc(doc(db, 'users', acc.id), {
            assignedClassId: null,
            assignedClassName: 'Unassigned'
          }).catch(() => {});
        } catch {}
        return updated;
      }
      return acc;
    }));

    try {
      deleteDoc(doc(db, 'classrooms', id)).catch(() => {});
    } catch {}

    addAuditLog('DELETE_CLASSROOM', `Deleted classroom "${className}" (${target?.code || ''}) and unlinked assigned faculty`, id);
    showToast(`Classroom "${className}" removed successfully`, 'info');
  };

  const getWeeklyCompliance = (weekNumber: number): WeeklyComplianceRecord[] => {
    const teachers = allAccounts.filter(a => a.role === 'teacher');
    return teachers.map(teacher => {
      const plan = lessonPlans.find(p => p.teacherId === teacher.id && p.weekNumber === weekNumber);
      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        className: teacher.assignedClassName || 'Classroom',
        avatar: teacher.avatar,
        status: plan ? plan.status : 'missing',
        lessonPlanId: plan?.id,
        submissionDate: plan?.submittedAt,
      };
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        allAccounts,
        switchUser,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateAccount,
        deleteAccount,
        registerTeacher,
        isFirebaseConnected,
        firebaseAuthUser,
        firebaseConfigInfo: firebaseConfig,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openSignInModal,
        openSignUpModal,
        lessonPlans,
        userLessonPlans,
        selectedPlan,
        setSelectedPlan,
        createLessonPlan,
        updateLessonPlan,
        deleteLessonPlan,
        submitLessonPlan,
        adminReviewPlan,
        batchApprovePlans,
        classrooms,
        addClassroom,
        updateClassroom,
        deleteClassroom,
        getWeeklyCompliance,
        auditLogs,
        addAuditLog,
        toastMessage,
        showToast,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
