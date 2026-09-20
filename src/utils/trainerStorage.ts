import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { TrainerAccount } from '../types';

const TRAINERS_KEY = 'tajweed_trainers_list';
const CURRENT_TRAINER_KEY = 'tajweed_current_trainer_session';

export const SUPER_ADMIN_ACCOUNT: TrainerAccount = {
  id: 'super_admin',
  name: 'المشرف العام (الإدارة المركزية)',
  username: 'admin',
  password: '2026',
  role: 'super_admin',
  status: 'active',
  referralCode: 'ADMIN',
  notes: 'حساب المشرف العام والمالك للمنصة - صلاحيات كاملة',
  maxStudents: 0,
  createdAt: '2026-01-01',
  updatedAt: 1704067200000,
};

// Initial default seed trainers for initial boot only
const DEFAULT_TRAINERS: TrainerAccount[] = [
  SUPER_ADMIN_ACCOUNT,
  {
    id: 'tr_ahmed',
    name: 'د. أحمد محمد إبراهيم',
    username: 'ahmed',
    password: '123',
    role: 'trainer',
    status: 'active',
    referralCode: 'AHMED-QURAN',
    phone: '+966500000000',
    notes: 'اشتراك مدرب معتمد - دورات التجويد الميدانية',
    maxStudents: 100,
    createdAt: '2026-01-15',
    updatedAt: 1705276800000,
  }
];

let cachedTrainers: TrainerAccount[] = [];
let isLoaded = false;

const trainerListeners: Array<(trainers: TrainerAccount[]) => void> = [];

export const subscribeTrainers = (callback: (trainers: TrainerAccount[]) => void): (() => void) => {
  trainerListeners.push(callback);
  
  // Call immediately with current cache
  const initial = getLocalTrainers();
  callback(initial);

  try {
    const unsub = onSnapshot(
      collection(db, 'trainers'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: TrainerAccount[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as TrainerAccount;
            list.push({ ...data, id: d.id });
          });
          
          cachedTrainers = list;
          isLoaded = true;
          saveLocalTrainers(list);
          notifyTrainerListeners(list);
        } else {
          // If Firestore is empty, seed it with default accounts
          const list = getLocalTrainers();
          cachedTrainers = list;
          notifyTrainerListeners(list);
          list.forEach(async (t) => {
            try {
              await setDoc(doc(db, 'trainers', t.id), t);
            } catch (e) {
              console.error('Error seeding initial trainer to Firestore:', e);
            }
          });
        }
      },
      (err) => {
        console.error('Firestore trainers listener error:', err);
      }
    );
    return () => {
      const idx = trainerListeners.indexOf(callback);
      if (idx !== -1) trainerListeners.splice(idx, 1);
      unsub();
    };
  } catch (e) {
    console.error('Firestore init subscribe error:', e);
    return () => {
      const idx = trainerListeners.indexOf(callback);
      if (idx !== -1) trainerListeners.splice(idx, 1);
    };
  }
};

const notifyTrainerListeners = (trainers: TrainerAccount[]) => {
  trainerListeners.forEach((cb) => {
    try {
      cb(trainers);
    } catch (e) {
      console.error('Trainer listener cb error:', e);
    }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tajweed_trainers_updated', { detail: trainers }));
  }
};

export const getLocalTrainers = (): TrainerAccount[] => {
  if (cachedTrainers.length > 0 && isLoaded) {
    return cachedTrainers;
  }
  if (typeof window === 'undefined') return DEFAULT_TRAINERS;
  try {
    const raw = localStorage.getItem(TRAINERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TrainerAccount[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure super admin is present without overwriting custom password
        const adminFound = parsed.find((t) => t.role === 'super_admin' || t.id === 'super_admin');
        if (!adminFound) {
          parsed.unshift(SUPER_ADMIN_ACCOUNT);
        }
        cachedTrainers = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local trainers:', e);
  }
  cachedTrainers = DEFAULT_TRAINERS;
  return DEFAULT_TRAINERS;
};

export const saveLocalTrainers = (trainers: TrainerAccount[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TRAINERS_KEY, JSON.stringify(trainers));
  } catch (e) {
    console.error('Error saving local trainers:', e);
  }
};

export const getAllTrainersAsync = async (): Promise<TrainerAccount[]> => {
  try {
    const snap = await getDocs(collection(db, 'trainers'));
    if (!snap.empty) {
      const list: TrainerAccount[] = [];
      snap.forEach((d) => {
        const data = d.data() as TrainerAccount;
        list.push({ ...data, id: d.id });
      });
      
      // If there are any locally added custom trainers not yet synced to Firestore, keep them
      const local = getLocalTrainers();
      local.forEach((locT) => {
        if (locT.id !== 'super_admin' && !list.some((r) => r.id === locT.id || r.username.toLowerCase() === locT.username.toLowerCase())) {
          list.push(locT);
        }
      });

      cachedTrainers = list;
      isLoaded = true;
      saveLocalTrainers(list);
      notifyTrainerListeners(list);
      return list;
    } else {
      // Seed Firestore with local trainers if Firestore collection is empty
      const list = getLocalTrainers();
      for (const t of list) {
        try {
          await setDoc(doc(db, 'trainers', t.id), t);
        } catch (err) {
          console.error('Error seeding trainer to Firestore:', err);
        }
      }
      return list;
    }
  } catch (e) {
    console.error('Failed to get trainers from firestore, using local:', e);
  }
  return getLocalTrainers();
};

export const saveTrainerAccount = async (trainer: TrainerAccount): Promise<TrainerAccount> => {
  const isSuper = trainer.role === 'super_admin' || trainer.id === 'super_admin';
  const cleanId = isSuper ? 'super_admin' : (trainer.id.trim() || `tr_${trainer.username.toLowerCase().replace(/[^a-z0-9_]/g, '')}_${Date.now().toString().slice(-4)}`);
  const cleanTrainer: TrainerAccount = {
    ...trainer,
    id: cleanId,
    username: (trainer.username || (isSuper ? 'admin' : 'trainer')).trim().toLowerCase(),
    password: String(trainer.password).trim(),
    name: trainer.name.trim(),
    referralCode: (trainer.referralCode || (isSuper ? 'ADMIN' : trainer.username)).trim().toUpperCase(),
    role: isSuper ? 'super_admin' : (trainer.role || 'trainer'),
    updatedAt: Date.now(),
  };

  const current = getLocalTrainers();
  const existingIdx = current.findIndex((t) => t.id === cleanId || (isSuper && (t.role === 'super_admin' || t.id === 'super_admin')) || t.username === cleanTrainer.username);
  let updatedList: TrainerAccount[];
  if (existingIdx !== -1) {
    updatedList = [...current];
    updatedList[existingIdx] = cleanTrainer;
  } else {
    updatedList = [cleanTrainer, ...current];
  }

  cachedTrainers = updatedList;
  saveLocalTrainers(updatedList);
  notifyTrainerListeners(updatedList);

  // Direct Overwrite to Firestore
  try {
    await setDoc(doc(db, 'trainers', cleanId), cleanTrainer);
  } catch (e) {
    console.error('Error saving trainer to Firestore:', e);
  }

  // Update active session with the new credentials
  try {
    const active = getCurrentAuthTrainer();
    if (active && (active.id === cleanId || active.username.toLowerCase() === cleanTrainer.username || (isSuper && (active.role === 'super_admin' || active.id === 'super_admin')))) {
      setCurrentAuthTrainer(cleanTrainer);
    }
  } catch (e) {
    console.error('Error updating current auth trainer session:', e);
  }

  return cleanTrainer;
};

export const deleteTrainerAccount = async (trainerId: string): Promise<boolean> => {
  if (trainerId === 'super_admin') {
    throw new Error('لا يمكن حذف حساب المشرف العام الرئيسي');
  }

  const current = getLocalTrainers();
  const filtered = current.filter((t) => t.id !== trainerId);
  cachedTrainers = filtered;
  saveLocalTrainers(filtered);
  notifyTrainerListeners(filtered);

  try {
    await deleteDoc(doc(db, 'trainers', trainerId));
    return true;
  } catch (e) {
    console.error('Error deleting trainer from Firestore:', e);
    return true;
  }
};

export const toggleTrainerStatus = async (
  trainerId: string, 
  newStatus: 'active' | 'suspended'
): Promise<TrainerAccount | null> => {
  const current = getLocalTrainers();
  const target = current.find((t) => t.id === trainerId);
  if (!target) return null;

  const updated: TrainerAccount = {
    ...target,
    status: newStatus,
    updatedAt: Date.now(),
  };

  return await saveTrainerAccount(updated);
};

export const getSuperAdminAccount = (): TrainerAccount => {
  const trainers = getLocalTrainers();
  const found = trainers.find((t) => t.role === 'super_admin' || t.id === 'super_admin');
  return found || SUPER_ADMIN_ACCOUNT;
};

/**
 * دالة تنظيف الجلسات القديمة ومطابقة أحدث بيانات
 */
export const clearStaleAuthSessions = () => {
  if (typeof window === 'undefined') return;
  try {
    const active = getCurrentAuthTrainer();
    if (active) {
      const trainers = getLocalTrainers();
      const isSuper = active.role === 'super_admin' || active.id === 'super_admin';
      const fresh = trainers.find((t) => t.id === active.id || (isSuper && (t.role === 'super_admin' || t.id === 'super_admin')) || t.username.toLowerCase() === active.username.toLowerCase());
      if (fresh) {
        localStorage.setItem(CURRENT_TRAINER_KEY, JSON.stringify(fresh));
      } else {
        localStorage.removeItem(CURRENT_TRAINER_KEY);
      }
    }
  } catch (e) {
    console.error('Error clearing stale auth session:', e);
  }
};

/**
 * دالة تحديث كلمة المرور (Update Password): استبدال مباشر وكامل وحصري لكلمة المرور القديمة
 */
export const updateTrainerPassword = async (
  trainerId: string, 
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; trainer?: TrainerAccount; error?: string }> => {
  const current = getLocalTrainers();
  const cleanTrainerId = (trainerId || '').trim();
  const isSuperTarget = cleanTrainerId === 'super_admin' || cleanTrainerId === 'admin';

  let target = current.find((t) => 
    t.id === cleanTrainerId || 
    (isSuperTarget && (t.role === 'super_admin' || t.id === 'super_admin')) ||
    (t.username && t.username.toLowerCase() === cleanTrainerId.toLowerCase())
  );

  if (!target && isSuperTarget) {
    target = getSuperAdminAccount();
  }

  if (!target) {
    return { success: false, error: 'حساب المستخدم غير موجود في سجل المنصة' };
  }

  const cleanOld = String(oldPassword || '').trim();
  const currentTargetPass = String(target.password || '').trim();

  // التحقق الإلزامي من مطابقة كلمة المرور الحالية المعتمدة فقط
  if (currentTargetPass !== cleanOld) {
    return { 
      success: false, 
      error: 'كلمة المرور الحالية (القديمة) غير صحيحة، يرجى كتابة كلمة المرور المعتمدة حالياً' 
    };
  }

  const cleanNew = String(newPassword || '').trim();
  if (!cleanNew) {
    return { success: false, error: 'يرجى إدخال كلمة مرور جديدة صالحة' };
  }

  if (cleanOld === cleanNew) {
    return { success: false, error: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية' };
  }

  try {
    // Overwrite مباشر وكامل
    const updated: TrainerAccount = {
      ...target,
      password: cleanNew,
      updatedAt: Date.now(),
    };

    const saved = await saveTrainerAccount(updated);
    
    // تنظيف وتحديث الجلسات فوراً
    clearStaleAuthSessions();

    return { success: true, trainer: saved };
  } catch (err: any) {
    console.error('Failed in updateTrainerPassword:', err);
    return { success: false, error: 'حدث خطأ أثناء حفظ التحديث: ' + (err?.message || 'يرجى المحاولة مجدداً') };
  }
};

export interface AuthResult {
  success: boolean;
  role?: 'super_admin' | 'trainer';
  trainer?: TrainerAccount;
  error?: string;
}

/**
 * دالة التحقق المتزامنة من تسجيل الدخول (Synchronous Fallback)
 */
export const authenticateTrainerOrAdminSync = (
  usernameOrCode: string,
  password?: string
): AuthResult => {
  const trimmedUser = (usernameOrCode || '').trim().toLowerCase();
  const trimmedPass = String(password || '').trim();
  const trainers = getLocalTrainers();

  // إيجاد الحساب الفعلي المعتمد للمشرف العام
  const superAdmin = trainers.find((t) => t.role === 'super_admin' || t.id === 'super_admin') || SUPER_ADMIN_ACCOUNT;
  const currentAdminPassword = String(superAdmin.password).trim();

  // Case 1: الدخول السريع للمشرف برمز المرور فقط
  if (!password) {
    const enteredPass = trimmedUser;
    // التحقق التام والحصري فقط مع كلمة المرور المسجلة حالياً
    if (enteredPass && enteredPass === currentAdminPassword) {
      return {
        success: true,
        role: 'super_admin',
        trainer: superAdmin,
      };
    }
    return {
      success: false,
      error: 'الرمز السري للمشرف العام غير صحيح. يرجى إدخال كلمة المرور المعتمدة حالياً.',
    };
  }

  // Case 2: تسجيل الدخول باسم المستخدم وكلمة المرور
  // فحص ما إذا كان الحساب المستهدف هو المشرف العام
  const isSuperAdminTarget = 
    trimmedUser === 'admin' || 
    trimmedUser === 'super_admin' || 
    trimmedUser === superAdmin.username.toLowerCase() || 
    trimmedUser === superAdmin.referralCode.toLowerCase() ||
    trimmedUser === superAdmin.id.toLowerCase();

  if (isSuperAdminTarget) {
    // تطابق تام فقط مع كلمة المرور الحالية الحصرية
    if (trimmedPass === currentAdminPassword) {
      return {
        success: true,
        role: 'super_admin',
        trainer: superAdmin,
      };
    }
    return {
      success: false,
      error: 'كلمة المرور الخاصة بحساب المشرف العام غير صحيحة',
    };
  }

  // Case 3: فحص حسابات المعلمين المسجلين
  const matched = trainers.find(
    (t) =>
      t.username.toLowerCase() === trimmedUser ||
      t.id.toLowerCase() === trimmedUser ||
      t.referralCode.toLowerCase() === trimmedUser
  );

  if (!matched) {
    return {
      success: false,
      error: 'اسم المستخدم أو كود المعلم غير موجود في سجل المنصة',
    };
  }

  const currentTrainerPassword = String(matched.password).trim();

  // تطابق تام فقط مع كلمة المرور الحالية للمعلم
  if (currentTrainerPassword !== trimmedPass) {
    return {
      success: false,
      error: 'كلمة المرور غير صحيحة، يرجى التأكد وإعادة المحاولة',
    };
  }

  // التحقق من حالة تفعيل الحساب
  if (matched.status === 'suspended') {
    return {
      success: false,
      error: '⛔ تم إيقاف هذا الحساب مؤقتاً من قِبل المشرف العام للمنصة. يرجى التواصل مع الإدارة لتفعيل الاشتراك.',
    };
  }

  return {
    success: true,
    role: matched.role || 'trainer',
    trainer: matched,
  };
};

/**
 * دالة التحقق من تسجيل الدخول (Login Verification - Async with Firestore sync):
 * تجلب أحدث بيانات الحسابات وكلمات المرور من سحاب Firestore مباشرة لضمان فتح الحساب في أي متصفح أو جهاز.
 */
export const authenticateTrainerOrAdmin = async (
  usernameOrCode: string,
  password?: string
): Promise<AuthResult> => {
  try {
    // جلب أحدث بيانات الحسابات من Firestore سحابياً لجميع المتصفحات
    await getAllTrainersAsync();
  } catch (err) {
    console.warn('Network sync during auth failed, using local cache:', err);
  }

  return authenticateTrainerOrAdminSync(usernameOrCode, password);
};

export const getActiveTrainersList = (): TrainerAccount[] => {
  return getLocalTrainers().filter((t) => t.status === 'active');
};

export const getTrainerByReferralCode = (code: string): TrainerAccount | null => {
  if (!code) return null;
  const clean = code.trim().toUpperCase();
  const trainers = getLocalTrainers();
  return (
    trainers.find(
      (t) =>
        t.referralCode.toUpperCase() === clean ||
        t.username.toUpperCase() === clean ||
        t.id.toUpperCase() === clean
    ) || null
  );
};

export interface TrainerCodeStatus {
  found: boolean;
  trainer: TrainerAccount | null;
  status: 'active' | 'suspended' | 'not_found';
  message: string;
}

export const checkTrainerCodeStatus = (code: string): TrainerCodeStatus => {
  if (!code || !code.trim()) {
    return { found: false, trainer: null, status: 'not_found', message: '' };
  }
  const clean = code.trim().toUpperCase();
  const trainers = getLocalTrainers();
  const matched = trainers.find(
    (t) =>
      t.referralCode.toUpperCase() === clean ||
      t.username.toUpperCase() === clean ||
      t.id.toUpperCase() === clean
  );

  if (!matched) {
    return {
      found: false,
      trainer: null,
      status: 'not_found',
      message: 'كود المعلم غير مسجل في المنصة. يرجى التحقق من الكود الممنوح لمعلمك.',
    };
  }

  if (matched.status === 'suspended') {
    return {
      found: true,
      trainer: matched,
      status: 'suspended',
      message: `⛔ كود المعلم [${matched.name}] معلق حالياً. يرجى مراجعة المعلم لتفعيل اشتراكه.`,
    };
  }

  return {
    found: true,
    trainer: matched,
    status: 'active',
    message: `✅ تم التحقق: المعلم المشرف هو [${matched.name}] - الاشتراك مفعّل ومعتمد ✓`,
  };
};

export const getCurrentAuthTrainer = (): TrainerAccount | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_TRAINER_KEY);
    if (raw) return JSON.parse(raw) as TrainerAccount;
  } catch (e) {
    console.error('Error getting current auth trainer:', e);
  }
  return null;
};

export const setCurrentAuthTrainer = (trainer: TrainerAccount | null) => {
  if (typeof window === 'undefined') return;
  if (!trainer) {
    localStorage.removeItem(CURRENT_TRAINER_KEY);
  } else {
    localStorage.setItem(CURRENT_TRAINER_KEY, JSON.stringify(trainer));
  }
};
