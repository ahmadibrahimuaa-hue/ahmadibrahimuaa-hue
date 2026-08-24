import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getStudentProfile, clearStudentProfile, clearAllSubmissions } from './studentStorage';

export interface SingleCourseProgress {
  completedUnitNumbers: number[]; // e.g. [1, 2, 3]
  readSections: string[]; // e.g. ['exceptions', 'examples', 'summary', 'rules', 'books']
  examBestScore: number | null; // e.g. 95 (percentage)
  examCompleted: boolean;
  totalQuizzesPassed: number;
  lastUpdated: number;
}

export type StudentProgressData = SingleCourseProgress;

export interface MultiCourseProgressData {
  courses: Record<string, SingleCourseProgress>;
  lastUpdated: number;
}

const PROGRESS_KEY = 'tajweed_multi_student_progress_v2';
const OLD_PROGRESS_KEY = 'tajweed_student_progress_v1';

export const getDefaultSingleProgress = (): SingleCourseProgress => ({
  completedUnitNumbers: [],
  readSections: [],
  examBestScore: null,
  examCompleted: false,
  totalQuizzesPassed: 0,
  lastUpdated: Date.now(),
});

let currentMultiProgress: MultiCourseProgressData = {
  courses: {
    sakinan: getDefaultSingleProgress(),
    idgham: getDefaultSingleProgress(),
  },
  lastUpdated: Date.now(),
};

let isInitialized = false;
const listeners: Array<() => void> = [];

export const subscribeStudentProgress = (callback: () => void): (() => void) => {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

const notifyListeners = () => {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.error('Progress storage listener error:', err);
    }
  });
};

export const loadMultiProgress = (): MultiCourseProgressData => {
  if (typeof window !== 'undefined' && !isInitialized) {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      try {
        currentMultiProgress = JSON.parse(raw);
      } catch (e) {
        console.warn('Failed to parse multi progress from localStorage:', e);
      }
    } else {
      // Migrate old single progress if exists to sakinan course
      const oldRaw = localStorage.getItem(OLD_PROGRESS_KEY);
      if (oldRaw) {
        try {
          const oldData = JSON.parse(oldRaw);
          currentMultiProgress.courses.sakinan = {
            completedUnitNumbers: oldData.completedUnitNumbers || [],
            readSections: oldData.readSections || [],
            examBestScore: oldData.examBestScore ?? null,
            examCompleted: oldData.examCompleted || false,
            totalQuizzesPassed: oldData.totalQuizzesPassed || 0,
            lastUpdated: oldData.lastUpdated || Date.now(),
          };
        } catch (e) {
          console.warn('Failed to migrate old progress:', e);
        }
      }
    }
    isInitialized = true;
  }
  return currentMultiProgress;
};

export const getStudentProgress = (courseId: string = 'sakinan'): SingleCourseProgress => {
  const multi = loadMultiProgress();
  if (!multi.courses[courseId]) {
    multi.courses[courseId] = getDefaultSingleProgress();
  }
  return multi.courses[courseId];
};

const saveProgressLocally = (multiData: MultiCourseProgressData) => {
  currentMultiProgress = multiData;
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(multiData));
  }
  notifyListeners();
};

const syncProgressToFirestore = async (courseId: string, data: SingleCourseProgress) => {
  const profile = getStudentProfile();
  if (!profile || !profile.name) return;

  try {
    const docRef = doc(db, 'student_progress', `${profile.name}_${courseId}`);
    await setDoc(docRef, {
      ...data,
      courseId,
      studentName: profile.name,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore progress sync failed:', err);
  }
};

export const markUnitCompleted = async (unitNumber: number, completed: boolean = true, courseId: string = 'sakinan') => {
  const multi = { ...loadMultiProgress() };
  const prog = { ...getStudentProgress(courseId) };
  
  let set = new Set(prog.completedUnitNumbers);
  if (completed) {
    set.add(unitNumber);
  } else {
    set.delete(unitNumber);
  }
  prog.completedUnitNumbers = Array.from(set).sort((a, b) => a - b);
  prog.lastUpdated = Date.now();
  
  multi.courses[courseId] = prog;
  multi.lastUpdated = Date.now();

  saveProgressLocally(multi);
  await syncProgressToFirestore(courseId, prog);
};

export const markSectionRead = async (sectionId: string, courseId: string = 'sakinan') => {
  const multi = { ...loadMultiProgress() };
  const prog = { ...getStudentProgress(courseId) };

  let set = new Set(prog.readSections);
  set.add(sectionId);
  prog.readSections = Array.from(set);
  prog.lastUpdated = Date.now();

  multi.courses[courseId] = prog;
  multi.lastUpdated = Date.now();

  saveProgressLocally(multi);
  await syncProgressToFirestore(courseId, prog);
};

export const recordExamScore = async (scorePercentage: number, courseId: string = 'sakinan') => {
  const multi = { ...loadMultiProgress() };
  const prog = { ...getStudentProgress(courseId) };

  prog.examCompleted = true;
  if (prog.examBestScore === null || scorePercentage > prog.examBestScore) {
    prog.examBestScore = scorePercentage;
  }
  prog.lastUpdated = Date.now();

  multi.courses[courseId] = prog;
  multi.lastUpdated = Date.now();

  saveProgressLocally(multi);
  await syncProgressToFirestore(courseId, prog);
};

export const isCoursePassed = (courseId: string = 'sakinan'): boolean => {
  const prog = getStudentProgress(courseId);
  return Boolean(prog.examCompleted && prog.examBestScore !== null && prog.examBestScore >= 90);
};

export const isCourseUnlocked = (courseId: string, isTeacherMode: boolean = false): boolean => {
  if (isTeacherMode) return true;
  if (courseId === 'sakinan') return true;
  if (courseId === 'idgham') {
    return isCoursePassed('sakinan');
  }
  return true;
};

export const calculateProgressPercentage = (prog?: SingleCourseProgress, totalUnitsCount: number = 5): number => {
  const p = prog || getStudentProgress('sakinan');
  
  const unitWeight = (p.completedUnitNumbers.length / Math.max(1, totalUnitsCount)) * 50;
  
  const sectionsCount = p.readSections.length; // max 4
  const sectionWeight = Math.min(sectionsCount / 4, 1) * 20;

  let examWeight = 0;
  if (p.examCompleted && p.examBestScore !== null) {
    examWeight = Math.min((p.examBestScore / 100) * 30, 30);
  }

  const total = Math.round(unitWeight + sectionWeight + examWeight);
  return Math.min(100, Math.max(0, total));
};

export const getBadges = (prog: SingleCourseProgress = getStudentProgress('sakinan'), courseTitle: string = 'التقاء الساكنين') => {
  const percent = calculateProgressPercentage(prog);
  const badges = [];

  if (prog.completedUnitNumbers.length >= 1) {
    badges.push({ title: 'بداية الممر', desc: 'إتمام الباب الأول بنجاح', icon: '🌱', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' });
  }
  if (prog.completedUnitNumbers.length >= 3) {
    badges.push({ title: 'قطع الشوط', desc: 'إتمام 3 أبواب تجويدية', icon: '🌿', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' });
  }
  if (prog.completedUnitNumbers.length >= 5) {
    badges.push({ title: 'حافظ الأبواب الخمسة', desc: 'إتقان جميع الأبواب المنهاجية', icon: '🏆', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' });
  }
  if (prog.readSections.length >= 3) {
    badges.push({ title: 'مستكشف المراجع', desc: 'دراسة الكلمات المستثناة والمختبر والجدول', icon: '📖', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' });
  }
  if (prog.examCompleted && (prog.examBestScore || 0) >= 80) {
    badges.push({ title: 'فارس التجويد والقراءات', desc: 'اجتياز الاختبار النهائي الشامل بدرجة ممتازة', icon: '👑', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' });
  }
  if (percent === 100) {
    badges.push({ title: `خبير ${courseTitle}`, desc: 'إكمال 100% من الحقيبة التدريبية', icon: '⭐', bg: 'bg-amber-400 text-slate-950 font-bold border-amber-300' });
  }

  return badges;
};

export const resetProgress = async (courseId?: string) => {
  const profile = getStudentProfile();
  
  if (courseId) {
    currentMultiProgress.courses[courseId] = getDefaultSingleProgress();
    currentMultiProgress.lastUpdated = Date.now();
    saveProgressLocally(currentMultiProgress);

    if (profile && profile.name) {
      try {
        await deleteDoc(doc(db, 'student_progress', `${profile.name}_${courseId}`));
      } catch (err) {
        console.warn('Firestore progress doc delete failed:', err);
      }
    }
  } else {
    currentMultiProgress = {
      courses: {
        sakinan: getDefaultSingleProgress(),
        idgham: getDefaultSingleProgress(),
      },
      lastUpdated: Date.now(),
    };

    saveProgressLocally(currentMultiProgress);

    if (profile && profile.name) {
      try {
        await deleteDoc(doc(db, 'student_progress', `${profile.name}_sakinan`));
        await deleteDoc(doc(db, 'student_progress', `${profile.name}_idgham`));
        await deleteDoc(doc(db, 'student_progress', profile.name));
      } catch (err) {
        console.warn('Firestore progress doc delete failed:', err);
      }
    }

    await clearStudentProfile();
    await clearAllSubmissions();

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('tajweed_unit_quiz_answers_v3');
        localStorage.removeItem('tajweed_unit_quiz_submitted_v3');
        localStorage.removeItem('tajweed_exam_saved_result');
        localStorage.removeItem('tajweed_student_profile');
        localStorage.removeItem('tajweed_student_submissions');
        localStorage.removeItem('tajweed_student_progress_v1');
        localStorage.removeItem(PROGRESS_KEY);
      } catch (e) {
        console.warn('localStorage clean error:', e);
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('tajweed_progress_reset'));
  }
};
