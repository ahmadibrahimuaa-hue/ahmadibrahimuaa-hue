import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { ComprehensiveExamQuestion } from '../types';
import { COMPREHENSIVE_EXAM_BANK } from '../data/comprehensiveExamData';
import { CURRICULUM_UNITS } from '../data/curriculumData';
import { IDGHAM_UNITS, IDGHAM_COMPREHENSIVE_EXAM } from '../data/courses/idghamCourse';

export interface UnitQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuestionsStorageSchema {
  // Sakinan course
  unitQuizzes: Record<number, UnitQuizQuestion[]>; // unitNumber -> array of questions
  comprehensiveBank: ComprehensiveExamQuestion[];

  // Idgham course
  idghamUnitQuizzes?: Record<number, UnitQuizQuestion[]>; // unitNumber -> array of questions
  idghamComprehensiveBank?: ComprehensiveExamQuestion[];

  // Generalized multi-course structure
  courses?: Record<string, {
    unitQuizzes: Record<number, UnitQuizQuestion[]>;
    comprehensiveBank: ComprehensiveExamQuestion[];
  }>;

  updatedAt: number;
}

const STORAGE_KEY = 'tajweed_custom_question_bank_v4';
const FIRESTORE_DOC_PATH = ['question_banks', 'all_questions'] as const;

// Helper to construct initial default schema from hardcoded data for all courses
export const getDefaultQuestionBank = (): QuestionsStorageSchema => {
  // 1. Sakinan defaults
  const sakinanUnitQuizzes: Record<number, UnitQuizQuestion[]> = {};
  CURRICULUM_UNITS.forEach((unit) => {
    if (unit.quiz && unit.quiz.questions) {
      sakinanUnitQuizzes[unit.unitNumber] = unit.quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: [...q.options],
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      }));
    }
  });

  // 2. Idgham defaults
  const idghamUnitQuizzes: Record<number, UnitQuizQuestion[]> = {};
  IDGHAM_UNITS.forEach((unit) => {
    if (unit.quiz && unit.quiz.questions) {
      idghamUnitQuizzes[unit.unitNumber] = unit.quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: [...q.options],
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      }));
    }
  });

  return {
    unitQuizzes: sakinanUnitQuizzes,
    comprehensiveBank: COMPREHENSIVE_EXAM_BANK.map((q) => ({ ...q })),
    idghamUnitQuizzes,
    idghamComprehensiveBank: IDGHAM_COMPREHENSIVE_EXAM.map((q) => ({ ...q })),
    courses: {
      sakinan: {
        unitQuizzes: sakinanUnitQuizzes,
        comprehensiveBank: COMPREHENSIVE_EXAM_BANK.map((q) => ({ ...q })),
      },
      idgham: {
        unitQuizzes: idghamUnitQuizzes,
        comprehensiveBank: IDGHAM_COMPREHENSIVE_EXAM.map((q) => ({ ...q })),
      },
    },
    updatedAt: Date.now(),
  };
};

let currentMemoryBank: QuestionsStorageSchema = getDefaultQuestionBank();
let isInitialized = false;
const listeners: Array<() => void> = [];

const notifyListeners = () => {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.error('Question storage listener error:', err);
    }
  });
};

export const subscribeQuestionBank = (callback: () => void): (() => void) => {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

// Load from LocalStorage synchronously
const loadFromLocalStorage = (): QuestionsStorageSchema | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse questions from localStorage:', err);
  }
  return null;
};

// Save to LocalStorage synchronously
const saveToLocalStorage = (data: QuestionsStorageSchema) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save questions to localStorage:', err);
  }
};

// Save to Firestore asynchronously
const saveToFirestore = async (data: QuestionsStorageSchema) => {
  try {
    const docRef = doc(db, FIRESTORE_DOC_PATH[0], FIRESTORE_DOC_PATH[1]);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.warn('Firestore save question bank failed:', err);
  }
};

// Normalize data ensuring both courses always exist
const normalizeBankData = (data: Partial<QuestionsStorageSchema>): QuestionsStorageSchema => {
  const defaults = getDefaultQuestionBank();
  
  const sakinanUnits = data.courses?.sakinan?.unitQuizzes || data.unitQuizzes || defaults.unitQuizzes;
  const sakinanExam = data.courses?.sakinan?.comprehensiveBank || data.comprehensiveBank || defaults.comprehensiveBank;
  
  const idghamUnits = data.courses?.idgham?.unitQuizzes || data.idghamUnitQuizzes || defaults.idghamUnitQuizzes || {};
  const idghamExam = data.courses?.idgham?.comprehensiveBank || data.idghamComprehensiveBank || defaults.idghamComprehensiveBank || [];

  return {
    unitQuizzes: sakinanUnits,
    comprehensiveBank: sakinanExam,
    idghamUnitQuizzes: idghamUnits,
    idghamComprehensiveBank: idghamExam,
    courses: {
      sakinan: {
        unitQuizzes: sakinanUnits,
        comprehensiveBank: sakinanExam,
      },
      idgham: {
        unitQuizzes: idghamUnits,
        comprehensiveBank: idghamExam,
      },
    },
    updatedAt: data.updatedAt || Date.now(),
  };
};

// Initialize listeners and sync
export const initQuestionStorageSync = () => {
  if (isInitialized) return;
  isInitialized = true;

  // 1. First check LocalStorage
  const localData = loadFromLocalStorage();
  if (localData) {
    currentMemoryBank = normalizeBankData(localData);
    notifyListeners();
  }

  // 2. Set up Firestore Realtime Listener
  try {
    const docRef = doc(db, FIRESTORE_DOC_PATH[0], FIRESTORE_DOC_PATH[1]);
    onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data() as Partial<QuestionsStorageSchema>;
          if (remoteData) {
            const localTimestamp = currentMemoryBank.updatedAt || 0;
            const remoteTimestamp = remoteData.updatedAt || 0;
            
            if (remoteTimestamp >= localTimestamp) {
              currentMemoryBank = normalizeBankData(remoteData);
              saveToLocalStorage(currentMemoryBank);
              notifyListeners();
            } else if (localTimestamp > remoteTimestamp) {
              // Local version has newer edits, push to Firestore
              saveToFirestore(currentMemoryBank);
            }
          }
        } else {
          // Document does not exist on Firestore yet, push current local bank
          saveToFirestore(currentMemoryBank);
        }
      },
      (err) => {
        console.warn('Firestore question bank realtime sync error:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to setup Firestore question listener:', err);
  }
};

// Execute sync initialization immediately
initQuestionStorageSync();

// --- GETTERS ---
export const getUnitQuizQuestions = (unitNumber: number, courseId: string = 'sakinan'): UnitQuizQuestion[] => {
  const normCourse = courseId === 'idgham' ? 'idgham' : 'sakinan';
  
  if (normCourse === 'idgham') {
    if (currentMemoryBank.courses?.idgham?.unitQuizzes?.[unitNumber]) {
      return currentMemoryBank.courses.idgham.unitQuizzes[unitNumber];
    }
    if (currentMemoryBank.idghamUnitQuizzes?.[unitNumber]) {
      return currentMemoryBank.idghamUnitQuizzes[unitNumber];
    }
    const defaults = getDefaultQuestionBank();
    return defaults.idghamUnitQuizzes?.[unitNumber] || [];
  }

  // Sakinan
  if (currentMemoryBank.courses?.sakinan?.unitQuizzes?.[unitNumber]) {
    return currentMemoryBank.courses.sakinan.unitQuizzes[unitNumber];
  }
  if (currentMemoryBank.unitQuizzes && currentMemoryBank.unitQuizzes[unitNumber]) {
    return currentMemoryBank.unitQuizzes[unitNumber];
  }
  const defaults = getDefaultQuestionBank();
  return defaults.unitQuizzes[unitNumber] || [];
};

export const getComprehensiveExamBank = (courseId: string = 'sakinan'): ComprehensiveExamQuestion[] => {
  const normCourse = courseId === 'idgham' ? 'idgham' : 'sakinan';

  if (normCourse === 'idgham') {
    if (currentMemoryBank.courses?.idgham?.comprehensiveBank && currentMemoryBank.courses.idgham.comprehensiveBank.length > 0) {
      return currentMemoryBank.courses.idgham.comprehensiveBank;
    }
    if (currentMemoryBank.idghamComprehensiveBank && currentMemoryBank.idghamComprehensiveBank.length > 0) {
      return currentMemoryBank.idghamComprehensiveBank;
    }
    return getDefaultQuestionBank().idghamComprehensiveBank || [];
  }

  // Sakinan
  if (currentMemoryBank.courses?.sakinan?.comprehensiveBank && currentMemoryBank.courses.sakinan.comprehensiveBank.length > 0) {
    return currentMemoryBank.courses.sakinan.comprehensiveBank;
  }
  if (currentMemoryBank.comprehensiveBank && currentMemoryBank.comprehensiveBank.length > 0) {
    return currentMemoryBank.comprehensiveBank;
  }
  return getDefaultQuestionBank().comprehensiveBank;
};

// --- MUTATORS (TEACHER ACTIONS) ---

export const saveUnitQuizQuestion = async (
  unitNumber: number,
  question: UnitQuizQuestion,
  courseId: string = 'sakinan'
) => {
  const normCourse = courseId === 'idgham' ? 'idgham' : 'sakinan';
  const bank = normalizeBankData(currentMemoryBank);
  const courseBank = bank.courses![normCourse];
  const unitList = courseBank.unitQuizzes[unitNumber] ? [...courseBank.unitQuizzes[unitNumber]] : [];

  const existingIdx = unitList.findIndex((q) => q.id === question.id);
  if (existingIdx !== -1) {
    unitList[existingIdx] = question;
  } else {
    const newId = question.id || Date.now();
    unitList.push({ ...question, id: newId });
  }

  courseBank.unitQuizzes[unitNumber] = unitList;

  if (normCourse === 'sakinan') {
    bank.unitQuizzes = { ...courseBank.unitQuizzes };
  } else {
    bank.idghamUnitQuizzes = { ...courseBank.unitQuizzes };
  }

  bank.updatedAt = Date.now();
  currentMemoryBank = bank;
  saveToLocalStorage(bank);
  notifyListeners();
  await saveToFirestore(bank);
};

export const deleteUnitQuizQuestion = async (
  unitNumber: number,
  questionId: number,
  courseId: string = 'sakinan'
) => {
  const normCourse = courseId === 'idgham' ? 'idgham' : 'sakinan';
  const bank = normalizeBankData(currentMemoryBank);
  const courseBank = bank.courses![normCourse];
  
  if (!courseBank.unitQuizzes[unitNumber]) return;

  courseBank.unitQuizzes[unitNumber] = courseBank.unitQuizzes[unitNumber].filter((q) => q.id !== questionId);
  
  if (normCourse === 'sakinan') {
    bank.unitQuizzes = { ...courseBank.unitQuizzes };
  } else {
    bank.idghamUnitQuizzes = { ...courseBank.unitQuizzes };
  }

  bank.updatedAt = Date.now();
  currentMemoryBank = bank;
  saveToLocalStorage(bank);
  notifyListeners();
  await saveToFirestore(bank);
};

export const saveComprehensiveExamQuestion = async (
  question: ComprehensiveExamQuestion,
  courseId: string = 'sakinan'
) => {
  const normCourse = courseId === 'idgham' ? 'idgham' : 'sakinan';
  const bank = normalizeBankData(currentMemoryBank);
  const courseBank = bank.courses![normCourse];
  const examList = [...(courseBank.comprehensiveBank || [])];

  const existingIdx = examList.findIndex((q) => q.id === question.id);
  if (existingIdx !== -1) {
    examList[existingIdx] = question;
  } else {
    const newId = question.id || Date.now();
    examList.push({ ...question, id: newId });
  }

  courseBank.comprehensiveBank = examList;

  if (normCourse === 'sakinan') {
    bank.comprehensiveBank = examList;
  } else {
    bank.idghamComprehensiveBank = examList;
  }

  bank.updatedAt = Date.now();
  currentMemoryBank = bank;
  saveToLocalStorage(bank);
  notifyListeners();
  await saveToFirestore(bank);
};

export const deleteComprehensiveExamQuestion = async (
  questionId: number,
  courseId: string = 'sakinan'
) => {
  const normCourse = courseId === 'idgham' ? 'idgham' : 'sakinan';
  const bank = normalizeBankData(currentMemoryBank);
  const courseBank = bank.courses![normCourse];
  
  courseBank.comprehensiveBank = (courseBank.comprehensiveBank || []).filter((q) => q.id !== questionId);

  if (normCourse === 'sakinan') {
    bank.comprehensiveBank = courseBank.comprehensiveBank;
  } else {
    bank.idghamComprehensiveBank = courseBank.comprehensiveBank;
  }

  bank.updatedAt = Date.now();
  currentMemoryBank = bank;
  saveToLocalStorage(bank);
  notifyListeners();
  await saveToFirestore(bank);
};

export const resetQuestionsToDefault = async (courseId?: string) => {
  const defaults = getDefaultQuestionBank();
  
  if (!courseId) {
    currentMemoryBank = defaults;
  } else {
    const normCourse = courseId === 'idgham' ? 'idgham' : 'sakinan';
    const bank = normalizeBankData(currentMemoryBank);
    bank.courses![normCourse] = defaults.courses![normCourse];
    if (normCourse === 'sakinan') {
      bank.unitQuizzes = defaults.unitQuizzes;
      bank.comprehensiveBank = defaults.comprehensiveBank;
    } else {
      bank.idghamUnitQuizzes = defaults.idghamUnitQuizzes;
      bank.idghamComprehensiveBank = defaults.idghamComprehensiveBank;
    }
    bank.updatedAt = Date.now();
    currentMemoryBank = bank;
  }

  saveToLocalStorage(currentMemoryBank);
  notifyListeners();
  await saveToFirestore(currentMemoryBank);
};
