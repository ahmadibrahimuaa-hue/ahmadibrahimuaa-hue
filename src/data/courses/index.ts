import { Course } from '../../types';
import { SAKINAN_COURSE } from './sakinanCourse';
import { IDGHAM_COURSE } from './idghamCourse';

export { SAKINAN_COURSE, IDGHAM_COURSE };

export const ALL_COURSES: Course[] = [
  SAKINAN_COURSE,
  IDGHAM_COURSE,
];

export const DEFAULT_COURSE_ID = 'sakinan';

export const getCourseById = (id?: string): Course => {
  if (!id) return ALL_COURSES[0];
  const found = ALL_COURSES.find((c) => c.id === id);
  return found || ALL_COURSES[0];
};
