import { Course, Unit, Lesson, CourseStatus, CourseLevel } from '../types';
import { ALL_COURSES as DEFAULT_ALL_COURSES, SAKINAN_COURSE } from '../data/courses';

const CUSTOM_COURSES_STORAGE_KEY = 'tajweed_custom_courses_v2';
const COURSES_ORDER_KEY = 'tajweed_courses_order_v2';

export const getCustomStoredCourses = (): Course[] => {
  if (typeof window === 'undefined') return DEFAULT_ALL_COURSES;
  try {
    const raw = localStorage.getItem(CUSTOM_COURSES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_ALL_COURSES;
    }
    const parsed: Course[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_ALL_COURSES;
    }

    // Merge default courses to ensure built-in methods and rich data are preserved if not explicitly modified
    const mergedCourses = parsed.map((course) => {
      const defaultCourse = DEFAULT_ALL_COURSES.find((c) => c.id === course.id);
      if (defaultCourse) {
        return {
          ...defaultCourse,
          ...course,
          units: course.units && course.units.length > 0 ? course.units : defaultCourse.units,
          pricing: {
            ...defaultCourse.pricing,
            ...course.pricing,
          },
        };
      }
      return course;
    });

    return mergedCourses;
  } catch (e) {
    console.warn('Failed to load custom courses from localStorage, falling back to defaults:', e);
    return DEFAULT_ALL_COURSES;
  }
};

export const saveAllCourses = (courses: Course[]): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(CUSTOM_COURSES_STORAGE_KEY, JSON.stringify(courses));
    window.dispatchEvent(new CustomEvent('tajweed_courses_updated', { detail: { courses } }));
    return true;
  } catch (e) {
    console.error('Error saving custom courses:', e);
    return false;
  }
};

export const saveOrUpdateCourse = (course: Course): boolean => {
  const currentCourses = getCustomStoredCourses();
  const index = currentCourses.findIndex((c) => c.id === course.id);
  let updatedCourses: Course[];

  if (index >= 0) {
    updatedCourses = [...currentCourses];
    updatedCourses[index] = {
      ...updatedCourses[index],
      ...course,
    };
  } else {
    updatedCourses = [...currentCourses, course];
  }

  return saveAllCourses(updatedCourses);
};

export const deleteCourseById = (courseId: string): boolean => {
  if (courseId === 'sakinan') {
    // We protect the core beginner course from accidental full deletion, but allow editing its state
    console.warn('Cannot completely delete foundational course');
    return false;
  }
  const currentCourses = getCustomStoredCourses();
  const filtered = currentCourses.filter((c) => c.id !== courseId);
  return saveAllCourses(filtered);
};

export const updateCourseStatus = (
  courseId: string, 
  status: CourseStatus, 
  isPaid?: boolean, 
  priceText?: string
): boolean => {
  const currentCourses = getCustomStoredCourses();
  const index = currentCourses.findIndex((c) => c.id === courseId);
  if (index < 0) return false;

  const target = currentCourses[index];
  const updated: Course = {
    ...target,
    status,
    pricing: {
      ...target.pricing,
      isPaid: isPaid !== undefined ? isPaid : target.pricing?.isPaid ?? false,
      priceText: priceText !== undefined ? priceText : target.pricing?.priceText,
    },
  };

  currentCourses[index] = updated;
  return saveAllCourses(currentCourses);
};

export const addUnitToCourse = (courseId: string, unit: Unit): boolean => {
  const currentCourses = getCustomStoredCourses();
  const courseIndex = currentCourses.findIndex((c) => c.id === courseId);
  if (courseIndex < 0) return false;

  const targetCourse = currentCourses[courseIndex];
  const existingUnits = targetCourse.units || [];
  const unitIndex = existingUnits.findIndex((u) => u.id === unit.id);

  let newUnits: Unit[];
  if (unitIndex >= 0) {
    newUnits = [...existingUnits];
    newUnits[unitIndex] = unit;
  } else {
    newUnits = [...existingUnits, unit];
  }

  currentCourses[courseIndex] = {
    ...targetCourse,
    units: newUnits,
  };

  return saveAllCourses(currentCourses);
};

export const deleteUnitFromCourse = (courseId: string, unitId: string): boolean => {
  const currentCourses = getCustomStoredCourses();
  const courseIndex = currentCourses.findIndex((c) => c.id === courseId);
  if (courseIndex < 0) return false;

  const targetCourse = currentCourses[courseIndex];
  const updatedUnits = (targetCourse.units || []).filter((u) => u.id !== unitId);

  currentCourses[courseIndex] = {
    ...targetCourse,
    units: updatedUnits,
  };

  return saveAllCourses(currentCourses);
};

export const addLessonToUnit = (courseId: string, unitId: string, lesson: Lesson): boolean => {
  const currentCourses = getCustomStoredCourses();
  const courseIndex = currentCourses.findIndex((c) => c.id === courseId);
  if (courseIndex < 0) return false;

  const targetCourse = currentCourses[courseIndex];
  const units = targetCourse.units || [];
  const unitIndex = units.findIndex((u) => u.id === unitId);
  if (unitIndex < 0) return false;

  const targetUnit = units[unitIndex];
  const lessons = targetUnit.lessons || [];
  const lessonIndex = lessons.findIndex((l) => l.id === lesson.id);

  let newLessons: Lesson[];
  if (lessonIndex >= 0) {
    newLessons = [...lessons];
    newLessons[lessonIndex] = lesson;
  } else {
    newLessons = [...lessons, lesson];
  }

  const updatedUnit: Unit = {
    ...targetUnit,
    lessons: newLessons,
  };

  const updatedUnits = [...units];
  updatedUnits[unitIndex] = updatedUnit;

  currentCourses[courseIndex] = {
    ...targetCourse,
    units: updatedUnits,
  };

  return saveAllCourses(currentCourses);
};

export const resetCoursesToDefault = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem(CUSTOM_COURSES_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('tajweed_courses_updated', { detail: { courses: DEFAULT_ALL_COURSES } }));
    return true;
  } catch (e) {
    return false;
  }
};

export const subscribeCourses = (callback: (courses: Course[]) => void) => {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ courses: Course[] }>;
    if (customEvent.detail && customEvent.detail.courses) {
      callback(customEvent.detail.courses);
    } else {
      callback(getCustomStoredCourses());
    }
  };

  window.addEventListener('tajweed_courses_updated', handler);
  // initial call
  callback(getCustomStoredCourses());

  return () => {
    window.removeEventListener('tajweed_courses_updated', handler);
  };
};
