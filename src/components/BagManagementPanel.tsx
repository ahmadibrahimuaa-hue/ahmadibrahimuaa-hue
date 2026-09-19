import React, { useState, useEffect } from 'react';
import { 
  Briefcase, PlusCircle, Edit3, Trash2, CheckCircle2, Lock, Unlock,
  Clock, Sparkles, Layers, BookOpen, ChevronLeft, ArrowRight,
  Save, AlertTriangle, RefreshCw, X, Check, DollarSign, Gift,
  Tag, Award, Eye, FileText, ChevronDown, ChevronUp, MoveUp, MoveDown, KeyRound,
  FolderSync, RotateCcw, UserCheck
} from 'lucide-react';
import { Course, Unit, Lesson, CourseStatus, CourseLevel } from '../types';
import { LessonClassifierModal } from './LessonClassifierModal';
import { 
  getCustomStoredCourses, 
  saveOrUpdateCourse, 
  deleteCourseById, 
  restoreCourseById,
  getDeletedCoursesArchive,
  permanentlyDeleteFromArchive,
  updateCourseStatus, 
  addUnitToCourse, 
  deleteUnitFromCourse, 
  addLessonToUnit, 
  resetCoursesToDefault,
  subscribeCourses 
} from '../utils/courseCustomStorage';
import {
  getStudentUnlockedCourses,
  grantCourseAccessToStudent,
  revokeCourseAccessFromStudent,
  isCourseUnlocked
} from '../utils/studentProgressStorage';

interface BagManagementPanelProps {
  onClose?: () => void;
  onSelectCourseToView?: (courseId: string) => void;
  activeCourseId?: string;
}

export const BagManagementPanel: React.FC<BagManagementPanelProps> = ({
  onClose,
  onSelectCourseToView,
  activeCourseId = 'sakinan',
}) => {
  const [courses, setCourses] = useState<Course[]>(getCustomStoredCourses());
  const [selectedBagId, setSelectedBagId] = useState<string>(activeCourseId);
  const [viewMode, setViewMode] = useState<'bags_list' | 'edit_bag' | 'manage_units'>('bags_list');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [unlockedStudentCourses, setUnlockedStudentCourses] = useState<string[]>(getStudentUnlockedCourses());

  // Course Edit/Create Form State
  const [editingCourse, setEditingCourse] = useState<Partial<Course>>({});
  const [isCreatingNewBag, setIsCreatingNewBag] = useState<boolean>(false);

  // Unit Edit/Create Form State
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [isEditingUnit, setIsEditingUnit] = useState<boolean>(false);
  const [editingUnit, setEditingUnit] = useState<Partial<Unit>>({});

  // Lesson Edit/Create Form State
  const [isEditingLesson, setIsEditingLesson] = useState<boolean>(false);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson>>({});
  const [targetUnitForLesson, setTargetUnitForLesson] = useState<string | null>(null);

  // Lesson Classifier Modal State
  const [classifierModalData, setClassifierModalData] = useState<{
    isOpen: boolean;
    courseId?: string;
    unitId?: string;
    lessonId?: string;
  }>({ isOpen: false });

  // Delete Bag Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    courseId: string;
    courseTitle: string;
    badge?: string;
    unitsCount?: number;
    lessonsCount?: number;
  } | null>(null);

  // Deleted Courses Trash / Archive State
  const [showTrashModal, setShowTrashModal] = useState<boolean>(false);
  const [deletedArchive, setDeletedArchive] = useState<Course[]>(() => getDeletedCoursesArchive());

  useEffect(() => {
    const unsub = subscribeCourses((updatedList) => {
      setCourses(updatedList);
    });
    return () => unsub();
  }, []);

  const notifySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const notifyError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 4000);
  };

  const currentSelectedCourse = courses.find((c) => c.id === selectedBagId) || courses[0] || null;

  // ----------------------------------------------------
  // Bag CRUD Actions
  // ----------------------------------------------------
  const handleOpenCreateBag = () => {
    const newId = `bag_${Date.now()}`;
    setEditingCourse({
      id: newId,
      title: '',
      shortTitle: '',
      subtitle: 'حقيبة تعليمية وتطبيقية متقدمة',
      badge: `الحقيبة رقم ${courses.length + 1}`,
      iconName: 'Sparkles',
      description: '',
      author: 'أحمد إبراهيم',
      qualificationNote: '«ومؤهل لتدريس المحتوى والتأصيل الأكاديمي»',
      status: 'available',
      level: 'intermediate',
      levelText: 'المستوى التدريبي المتقدم',
      pricing: {
        isPaid: false,
        priceText: 'متاحة ومفتوحة لجميع الدارسين',
        note: 'شهادة معتمدة فور الاجتياز',
      },
      expectedDuration: '8 محاضرات دراسية',
      features: ['شرح وتأصيل نظري', 'مختبر قرآني تفاعلي', 'اختبار نهائي وشهادة فورية'],
      units: [],
      summaryTable: [],
      exceptionWords: [],
      quranExamples: [],
      comprehensiveExamBank: [],
    });
    setIsCreatingNewBag(true);
    setViewMode('edit_bag');
  };

  const handleOpenEditBag = (course: Course) => {
    setEditingCourse(JSON.parse(JSON.stringify(course)));
    setIsCreatingNewBag(false);
    setViewMode('edit_bag');
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse.title || !editingCourse.title.trim()) {
      notifyError('يرجى كتابة عنوان الحقيبة كاملاً');
      return;
    }

    const courseToSave: Course = {
      id: editingCourse.id || `bag_${Date.now()}`,
      title: editingCourse.title.trim(),
      shortTitle: editingCourse.shortTitle?.trim() || editingCourse.title.trim(),
      subtitle: editingCourse.subtitle?.trim() || 'حقيبة تعليمية متخصصة',
      badge: editingCourse.badge?.trim() || 'حقيبة تدريبية',
      iconName: editingCourse.iconName || 'BookOpen',
      description: editingCourse.description?.trim() || 'وصف المنهج والحقيبة التدريبية',
      author: editingCourse.author?.trim() || 'أحمد إبراهيم',
      qualificationNote: editingCourse.qualificationNote || '«ومؤهل لتدريس وتأصيل أحكام التجويد»',
      status: editingCourse.status || 'available',
      level: editingCourse.level || 'intermediate',
      levelText: editingCourse.levelText || 'المستوى المعتمد',
      pricing: {
        isPaid: editingCourse.pricing?.isPaid ?? false,
        priceText: editingCourse.pricing?.priceText || (editingCourse.pricing?.isPaid ? 'قريباً - محتوى مدفوع' : 'متاحة مجاناً'),
        note: editingCourse.pricing?.note || '',
      },
      expectedDuration: editingCourse.expectedDuration || '6 محاضرات',
      features: editingCourse.features || ['شرح منهجي', 'تدريبات عملية', 'اختبار معتمد'],
      units: editingCourse.units || [],
      summaryTable: editingCourse.summaryTable || [],
      exceptionWords: editingCourse.exceptionWords || [],
      quranExamples: editingCourse.quranExamples || [],
      comprehensiveExamBank: editingCourse.comprehensiveExamBank || [],
      books: editingCourse.books || [],
      rulesCheatSheetMarkdown: editingCourse.rulesCheatSheetMarkdown || '',
    };

    const ok = saveOrUpdateCourse(courseToSave);
    if (ok) {
      notifySuccess(`تم حفظ وتحديث الحقيبة "${courseToSave.title}" بنجاح!`);
      setSelectedBagId(courseToSave.id);
      setViewMode('bags_list');
    } else {
      notifyError('تعذر حفظ بيانات الحقيبة، يرجى المحاولة مرة أخرى.');
    }
  };

  const handleRequestDeleteBag = (course: Course) => {
    const totalLessons = (course.units || []).reduce(
      (acc, u) => acc + (u.lessons?.length || 0),
      0
    );
    setDeleteTarget({
      courseId: course.id,
      courseTitle: course.title,
      badge: course.badge,
      unitsCount: course.units?.length || 0,
      lessonsCount: totalLessons,
    });
  };

  const handleConfirmDeleteBag = () => {
    if (!deleteTarget) return;
    const { courseId, courseTitle } = deleteTarget;
    const ok = deleteCourseById(courseId);
    if (ok) {
      setDeletedArchive(getDeletedCoursesArchive());
      notifySuccess(`تم حذف الحقيبة "${courseTitle}" بنجاح ونقلها إلى سلة المحذوفات.`);
      // If the currently selected bag was deleted, switch to another course or empty
      const remaining = courses.filter((c) => c.id !== courseId);
      if (remaining.length > 0) {
        setSelectedBagId(remaining[0].id);
      }
      if (viewMode === 'edit_bag' && editingCourse.id === courseId) {
        setViewMode('bags_list');
      }
    } else {
      notifyError('تعذر حذف الحقيبة، يرجى المحاولة مرة أخرى.');
    }
    setDeleteTarget(null);
  };

  const handleRestoreBag = (courseId: string, title: string) => {
    const ok = restoreCourseById(courseId);
    if (ok) {
      setDeletedArchive(getDeletedCoursesArchive());
      notifySuccess(`تمت استعادة الحقيبة "${title}" بنجاح وأصبحت متاحة في المنصة!`);
      setSelectedBagId(courseId);
    } else {
      notifyError('تعذر استعادة الحقيبة.');
    }
  };

  const handlePermanentDelete = (courseId: string, title: string) => {
    permanentlyDeleteFromArchive(courseId);
    setDeletedArchive(getDeletedCoursesArchive());
    notifySuccess(`تم حذف الحقيبة "${title}" نهائياً من سلة المهملات.`);
  };

  const handleQuickStatusToggle = (course: Course, newStatus: CourseStatus) => {
    // Preserve current isPaid and pricing strictly - do not force paid when coming_soon
    updateCourseStatus(course.id, newStatus);
    notifySuccess(`تم تحديث حالة الحقيبة "${course.shortTitle || course.title}" إلى: ${
      newStatus === 'available' ? '🟢 نشطة ومتاحة' : newStatus === 'coming_soon' ? '⏳ قريباً - قيد الإعداد' : '🔒 مغلقة'
    }`);
  };

  const handleQuickPaidToggle = (course: Course) => {
    const nextIsPaid = !(course.pricing?.isPaid ?? false);
    const nextPriceText = nextIsPaid 
      ? (course.pricing?.priceText && course.pricing?.priceText !== 'متاحة مجاناً ومفتوحة' && course.pricing?.priceText !== 'متاحة مجاناً' 
          ? course.pricing.priceText 
          : 'محتوى مدفوع') 
      : 'متاحة مجاناً ومفتوحة';

    updateCourseStatus(course.id, course.status, nextIsPaid, nextPriceText);
    notifySuccess(
      nextIsPaid
        ? `تم تحويل الحقيبة "${course.shortTitle || course.title}" إلى: محتوى مدفوع 🔒 (مقفلة تلقائياً عن الطلاب)`
        : `تم تحويل الحقيبة "${course.shortTitle || course.title}" إلى: مجانية ومفتوحة 🟢`
    );
  };

  const handleToggleStudentAccess = (courseId: string, courseTitle: string) => {
    const isGranted = unlockedStudentCourses.includes(courseId);
    if (isGranted) {
      revokeCourseAccessFromStudent(courseId);
      setUnlockedStudentCourses((prev) => prev.filter((id) => id !== courseId));
      notifySuccess(`تم سحب صلاحية الطالب من الحقيبة: "${courseTitle}". أصبحت مقفلة الآن 🔒`);
    } else {
      grantCourseAccessToStudent(courseId);
      setUnlockedStudentCourses((prev) => [...prev, courseId]);
      notifySuccess(`تم منح صلاحية الوصول للحقيبة: "${courseTitle}" بنجاح! 🔑`);
    }
  };

  // ----------------------------------------------------
  // Unit Management Actions
  // ----------------------------------------------------
  const handleOpenAddUnit = (courseId: string) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    const existingCount = targetCourse?.units?.length || 0;
    setEditingUnit({
      id: `unit_${Date.now()}`,
      unitNumber: existingCount + 1,
      title: `الباب ${existingCount + 1}: عنوان الباب الجديد`,
      subtitle: 'المحور والمفاهيم الأساسية للباب',
      description: 'وصف تفصيلي لأهداف هذا الباب والمسائل المتناولة فيه.',
      estimatedLectures: 'محاضرتان تدريبيتان',
      lessons: [],
      mindMap: { id: `m_${Date.now()}`, label: 'خريطة الباب الذهنية' },
      unitReviewMarkdown: 'ملخص شامل لأحكام الباب وضوابطه الأكاديمية.',
      quiz: { id: `q_${Date.now()}`, title: 'اختبار الباب', questions: [] },
      commonMistakes: [],
    });
    setIsEditingUnit(true);
  };

  const handleSaveUnit = (courseId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit.title || !editingUnit.title.trim()) {
      notifyError('يرجى إدخال عنوان الباب');
      return;
    }

    const unitToSave: Unit = {
      id: editingUnit.id || `unit_${Date.now()}`,
      unitNumber: Number(editingUnit.unitNumber) || 1,
      title: editingUnit.title.trim(),
      subtitle: editingUnit.subtitle?.trim() || '',
      description: editingUnit.description?.trim() || '',
      estimatedLectures: editingUnit.estimatedLectures || 'محاضرة واحدة',
      lessons: editingUnit.lessons || [],
      mindMap: editingUnit.mindMap || { id: 'mm', label: editingUnit.title },
      unitReviewMarkdown: editingUnit.unitReviewMarkdown || '',
      quiz: editingUnit.quiz || { id: 'qz', title: 'اختبار الباب', questions: [] },
      commonMistakes: editingUnit.commonMistakes || [],
    };

    const ok = addUnitToCourse(courseId, unitToSave);
    if (ok) {
      notifySuccess(`تم حفظ الباب: "${unitToSave.title}" في الحقيبة بنجاح!`);
      setIsEditingUnit(false);
      setEditingUnit({});
    } else {
      notifyError('تعذر حفظ الباب.');
    }
  };

  const handleDeleteUnit = (courseId: string, unitId: string, unitTitle: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الباب "${unitTitle}"؟`)) {
      const ok = deleteUnitFromCourse(courseId, unitId);
      if (ok) {
        notifySuccess(`تم حذف الباب بنجاح.`);
      } else {
        notifyError('تعذر حذف الباب.');
      }
    }
  };

  // ----------------------------------------------------
  // Lesson Management Actions
  // ----------------------------------------------------
  const handleOpenAddLesson = (unitId: string) => {
    setTargetUnitForLesson(unitId);
    const targetUnit = currentSelectedCourse?.units?.find((u) => u.id === unitId);
    const lessonCount = targetUnit?.lessons?.length || 0;

    setEditingLesson({
      id: `lesson_${Date.now()}`,
      lessonNumber: lessonCount + 1,
      title: `الدرس ${lessonCount + 1}: عنوان الدرس الجديد`,
      subtitle: 'محور الدرس وأهدافه',
      objectives: ['استيعاب الحكم التجويدي بدقة', 'التطبيق العملي على شواهد المصحف'],
      contentMarkdown: `### 📖 شرح وتأصيل الدرس\n\nاكتب هنا الشرح التفصيلي للدرس والقواعد المتعلقة به مع الضوابط والشواهد.\n\n- **القاعدة الأساسية:** بيان الحكم وموضعه.\n- **التوجيه الصوتي:** طريقة النطق الصحيح.`,
      summaryPoints: ['النقطة الأولى في ضبط الحكم', 'النقطة الثانية في التطبيق'],
      exercises: [],
      examples: [],
      discussionQuestions: ['ما هو الضابط الأساسي في هذا الحكم؟'],
      homeworkTask: 'استخراج 5 أمثلة من سورة البقرة تطبيقاً على ما تعلمته في هذا الدرس.',
      recitationTask: 'تلاوة ربع الحزب المحدد مع مراعاة تحقيق هذا الحكم بدقة.',
    });
    setIsEditingLesson(true);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUnitForLesson || !currentSelectedCourse) return;
    if (!editingLesson.title || !editingLesson.title.trim()) {
      notifyError('يرجى إدخال عنوان الدرس');
      return;
    }

    const lessonToSave: Lesson = {
      id: editingLesson.id || `lesson_${Date.now()}`,
      lessonNumber: Number(editingLesson.lessonNumber) || 1,
      title: editingLesson.title.trim(),
      subtitle: editingLesson.subtitle?.trim() || '',
      objectives: editingLesson.objectives || [],
      contentMarkdown: editingLesson.contentMarkdown || 'محتوى الدرس',
      summaryPoints: editingLesson.summaryPoints || [],
      exercises: editingLesson.exercises || [],
      examples: editingLesson.examples || [],
      discussionQuestions: editingLesson.discussionQuestions || [],
      discussionAnswers: editingLesson.discussionAnswers || [],
      homeworkTask: editingLesson.homeworkTask || '',
      homeworkSolution: editingLesson.homeworkSolution || '',
      recitationTask: editingLesson.recitationTask || '',
      recitationGuide: editingLesson.recitationGuide || '',
    };

    const ok = addLessonToUnit(currentSelectedCourse.id, targetUnitForLesson, lessonToSave);
    if (ok) {
      notifySuccess(`تم حفظ الدرس "${lessonToSave.title}" بنجاح!`);
      setIsEditingLesson(false);
      setEditingLesson({});
      setTargetUnitForLesson(null);
    } else {
      notifyError('تعذر حفظ الدرس.');
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-8 border-2 border-emerald-500/40 shadow-2xl space-y-6 font-tajawal dir-rtl relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-quran text-amber-200">
              نظام إدارة وتحرير الحقائب والدروس
            </h2>
            <p className="text-xs text-slate-300">
              إضافة وحذف الحقائب، ضبط الحالات (نشطة / مغلقة / قريباً)، التحكم بالأسعار وإدارة الأبواب والدروس
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {viewMode !== 'bags_list' && (
            <button
              onClick={() => {
                setViewMode('bags_list');
                setIsEditingUnit(false);
                setIsEditingLesson(false);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer font-quran"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لقائمة الحقائب</span>
            </button>
          )}

          {viewMode === 'bags_list' && (
            <>
              <button
                onClick={() => setClassifierModalData({ isOpen: true, courseId: selectedBagId })}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer font-quran"
                title="تصنيف ونقل الدروس بين الحقائب والمستويات، أو إنشاء حقيبة جديدة للدرس"
              >
                <FolderSync className="w-4 h-4" />
                <span>تصنيف ونقل الدروس والمستويات</span>
              </button>

              <button
                onClick={handleOpenCreateBag}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer font-quran"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ إضافة حقيبة جديدة</span>
              </button>

              {deletedArchive.length > 0 && (
                <button
                  onClick={() => setShowTrashModal(true)}
                  className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-rose-100 text-xs font-bold px-3.5 py-2 rounded-xl border border-rose-800/60 flex items-center gap-1.5 cursor-pointer font-quran transition-colors shadow-sm"
                  title="سلة الحقائب المحذوفة واسترجاعها"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>سلة المحذوفات ({deletedArchive.length})</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (window.confirm('هل تود استعادة الحقائب الافتراضية للمنصة بالكامل؟')) {
                    resetCoursesToDefault();
                    setDeletedArchive([]);
                    notifySuccess('تمت استعادة الحقائب الافتراضية بنجاح');
                  }
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                title="استعادة الحقائب الافتراضية"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>استعادة الافتراضي</span>
              </button>
            </>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs p-3.5 rounded-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-950/90 border border-rose-500 text-rose-200 text-xs p-3.5 rounded-2xl flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-bold">{errorMessage}</span>
        </div>
      )}

      {/* VIEW 1: BAGS LIST & QUICK CONTROLS */}
      {viewMode === 'bags_list' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course, idx) => {
              const isAvailable = (course.status || 'available') === 'available';
              const isComingSoon = course.status === 'coming_soon';
              const isLocked = course.status === 'locked';
              const isPaid = course.pricing?.isPaid ?? false;
              const unitsCount = course.units?.length || 0;

              return (
                <div
                  key={course.id}
                  className={`bg-slate-950/80 rounded-2xl p-5 border-2 transition-all space-y-4 flex flex-col justify-between ${
                    course.id === selectedBagId
                      ? 'border-amber-400 shadow-lg shadow-amber-400/5'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-slate-800 text-slate-300 text-[11px] font-bold px-2.5 py-0.5 rounded-md font-quran border border-slate-700">
                          {course.badge || `الحقيبة ${idx + 1}`}
                        </span>

                        {isPaid ? (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>مدفوعة</span>
                          </span>
                        ) : (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            <span>مفتوحة مجاناً</span>
                          </span>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div>
                        {isAvailable && (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-500 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>🟢 نشطة ومتاحة</span>
                          </span>
                        )}
                        {isComingSoon && (
                          <span className="bg-purple-950 text-purple-300 border border-purple-500 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>⏳ قريباً - معاينة</span>
                          </span>
                        )}
                        {isLocked && (
                          <span className="bg-amber-950 text-amber-300 border border-amber-500 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>🔒 مغلقة باشتراط</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Course Title & Summary */}
                    <div>
                      <h3 className="text-base sm:text-lg font-black font-quran text-slate-100 flex items-center gap-2">
                        <span>{course.title}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {course.description || 'لا يوجد وصف محدد لهذه الحقيبة'}
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs text-slate-300 font-quran">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-amber-400" />
                        <span>الأبواب: <strong>{unitsCount}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>المستوى: <strong>{course.levelText || 'عام'}</strong></span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {course.pricing?.priceText || 'بدون تحديد'}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="space-y-2 pt-3 border-t border-slate-800">
                    
                    {/* Quick State Toggle Buttons */}
                    <div className="flex items-center justify-between gap-1 text-[11px] font-bold font-quran bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 px-1 text-[10px]">الحالة:</span>
                      <button
                        onClick={() => handleQuickStatusToggle(course, 'available')}
                        className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                          isAvailable ? 'bg-emerald-600 text-white font-black' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        نشطة
                      </button>
                      <button
                        onClick={() => handleQuickStatusToggle(course, 'coming_soon')}
                        className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                          isComingSoon ? 'bg-purple-600 text-white font-black' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        قريباً
                      </button>
                      <button
                        onClick={() => handleQuickStatusToggle(course, 'locked')}
                        className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                          isLocked ? 'bg-amber-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        مغلقة
                      </button>
                    </div>

                    {/* Quick Paid & Student Access Control */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-quran font-bold">
                      <button
                        onClick={() => handleQuickPaidToggle(course)}
                        className={`py-1.5 px-2 rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isPaid
                            ? 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border-amber-600/50'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                        }`}
                        title="تبديل نوع الحقيبة بين مدفوعة ومجانية"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isPaid ? 'مدفوعة 🔒' : 'مجانية 🟢'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleStudentAccess(course.id, course.title)}
                        className={`py-1.5 px-2 rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          unlockedStudentCourses.includes(course.id)
                            ? 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border-emerald-500/50'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                        }`}
                        title="فتح أو قفل صلاحية دخول الطالب في هذا المتصفح"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>{unlockedStudentCourses.includes(course.id) ? 'الوصول ممنوح ✓' : 'مقفلة للطالب 🔒'}</span>
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedBagId(course.id);
                          setViewMode('manage_units');
                        }}
                        className="flex-1 bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 font-quran cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>تنظيم الأبواب والدروس ({unitsCount})</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditBag(course)}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold p-2 px-3 rounded-xl border border-slate-700 flex items-center gap-1 font-quran cursor-pointer"
                        title="تعديل بيانات الحقيبة"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleRequestDeleteBag(course)}
                        className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-rose-100 text-xs font-bold p-2 px-2.5 rounded-xl border border-rose-800/60 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        title="حذف هذه الحقيبة بالكامل"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-[11px] font-quran">حذف</span>
                      </button>

                      {onSelectCourseToView && (
                        <button
                          onClick={() => {
                            onSelectCourseToView(course.id);
                            if (onClose) onClose();
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold p-2 rounded-xl border border-slate-700 cursor-pointer"
                          title="معاينة الحقيبة في المنصة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {courses.length === 0 && (
            <div className="bg-slate-950/90 rounded-3xl p-8 sm:p-12 border-2 border-dashed border-slate-800 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black font-quran text-slate-100">
                  لا توجد حقائب تعليمية نشطة حالياً
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  تم حذف كافة الحقائب الحالية من المنصة. يمكنك إنشاء حقيبة جديدة مخصصة، أو استرجاع ما تم حذفه من سلة المحذوفات، أو استعادة الحقائب الافتراضية.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleOpenCreateBag}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs font-quran flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ إنشاء حقيبة جديدة</span>
                </button>

                {deletedArchive.length > 0 && (
                  <button
                    onClick={() => setShowTrashModal(true)}
                    className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold px-4 py-2.5 rounded-xl text-xs font-quran border border-rose-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>سلة المحذوفات ({deletedArchive.length})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    resetCoursesToDefault();
                    setDeletedArchive([]);
                    notifySuccess('تمت استعادة الحقائب الافتراضية بنجاح');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs font-quran border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>استعادة الحقائب الافتراضية</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ADD / EDIT BAG FORM */}
      {viewMode === 'edit_bag' && (
        <form onSubmit={handleSaveCourse} className="space-y-6 animate-fadeIn">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black font-quran text-amber-300 flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                <span>{isCreatingNewBag ? 'إضافة حقيبة تدريبية جديدة' : `تعديل بيانات الحقيبة (${editingCourse.shortTitle || ''})`}</span>
              </h3>
              <span className="text-xs text-slate-400 font-sans">ID: {editingCourse.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-quran">
              
              {/* Full Title */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-bold">عنوان الحقيبة الكامل *</label>
                <input
                  type="text"
                  required
                  value={editingCourse.title || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  placeholder="مثال: أحكام الميم الساكنة والنون المشددتين"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 focus:border-amber-400 outline-none"
                />
              </div>

              {/* Short Title */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">الاسم المختصر (للقوائم والأزرار)</label>
                <input
                  type="text"
                  value={editingCourse.shortTitle || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, shortTitle: e.target.value })}
                  placeholder="مثال: الميم الساكنة"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-400 outline-none"
                />
              </div>

              {/* Badge Text */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">نص الشارة التعريفية</label>
                <input
                  type="text"
                  value={editingCourse.badge || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, badge: e.target.value })}
                  placeholder="مثال: الحقيبة الخامسة (المتقدم)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-400 outline-none"
                />
              </div>

              {/* Subtitle */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-bold">العنوان الفرعي</label>
                <input
                  type="text"
                  value={editingCourse.subtitle || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, subtitle: e.target.value })}
                  placeholder="منهج تعليمي تطبيقي متدرج لمعلمي القرآن الكريم"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-400 outline-none"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-bold">وصف محتوى الحقيبة وأهدافها</label>
                <textarea
                  rows={3}
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  placeholder="حقيبة متخصصة لضبط مسائل وأحكام..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 focus:border-amber-400 outline-none leading-relaxed"
                />
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">حالة الحقيبة وإتاحتها للطلاب</label>
                <select
                  value={editingCourse.status || 'available'}
                  onChange={(e) => setEditingCourse({ ...editingCourse, status: e.target.value as CourseStatus })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-400 outline-none"
                >
                  <option value="available">🟢 نشطة ومتاحة مباشرة (Available)</option>
                  <option value="coming_soon">⏳ قريباً - محتوى تدريبي / مدفوع (Coming Soon)</option>
                  <option value="locked">🔒 مغلقة باشتراط اجتياز حقائب سابقة (Locked)</option>
                </select>
              </div>

              {/* Level Selector */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">المستوى التدريبي</label>
                <select
                  value={editingCourse.level || 'intermediate'}
                  onChange={(e) => {
                    const val = e.target.value as CourseLevel;
                    const levelNames = {
                      beginner: 'المستوى الأول: التأسيسي (المبتدئ)',
                      intermediate: 'المستوى الثاني: المتوسط',
                      advanced: 'المستوى الثالث: المتقدم',
                      master: 'المستوى الرابع: المتميز والإتقان',
                    };
                    setEditingCourse({ 
                      ...editingCourse, 
                      level: val, 
                      levelText: levelNames[val] 
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-400 outline-none"
                >
                  <option value="beginner">المستوى الأول: التأسيسي (المبتدئ)</option>
                  <option value="intermediate">المستوى الثاني: المتوسط</option>
                  <option value="advanced">المستوى الثالث: المتقدم</option>
                  <option value="master">المستوى الرابع: المتميز والإتقان</option>
                </select>
              </div>

              {/* Pricing Settings Box */}
              <div className="sm:col-span-2 bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-amber-200">إعدادات التسعير والرسوم:</span>
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-slate-300 text-xs">هل الحقيبة مدفوعة؟</span>
                    <input
                      type="checkbox"
                      checked={editingCourse.pricing?.isPaid ?? false}
                      onChange={(e) => setEditingCourse({
                        ...editingCourse,
                        pricing: {
                          ...editingCourse.pricing,
                          isPaid: e.target.checked,
                          priceText: e.target.checked ? (editingCourse.pricing?.priceText || 'قريباً - محتوى مدفوع') : 'متاحة مجاناً ومفتوحة',
                        }
                      })}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px]">نص السعر أو الإتاحة المعروض:</label>
                    <input
                      type="text"
                      value={editingCourse.pricing?.priceText || ''}
                      onChange={(e) => setEditingCourse({
                        ...editingCourse,
                        pricing: {
                          ...editingCourse.pricing,
                          isPaid: editingCourse.pricing?.isPaid ?? false,
                          priceText: e.target.value
                        }
                      })}
                      placeholder="مثال: 99 ريال / شهر أو متاحة مجاناً"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-amber-400 outline-none text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px]">ملاحظة الخصم أو الاشتراك:</label>
                    <input
                      type="text"
                      value={editingCourse.pricing?.note || ''}
                      onChange={(e) => setEditingCourse({
                        ...editingCourse,
                        pricing: {
                          ...editingCourse.pricing,
                          isPaid: editingCourse.pricing?.isPaid ?? false,
                          note: e.target.value
                        }
                      })}
                      placeholder="مثال: خصم 50% لطلاب الحلقات والمجازين"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-amber-400 outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Author & Expected Duration */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">اسم المؤلف / المعد</label>
                <input
                  type="text"
                  value={editingCourse.author || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, author: e.target.value })}
                  placeholder="أحمد إبراهيم"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-400 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">المدة التقديرية للدراسة</label>
                <input
                  type="text"
                  value={editingCourse.expectedDuration || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, expectedDuration: e.target.value })}
                  placeholder="مثال: 8 محاضرات تدريبية"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-amber-400 outline-none"
                />
              </div>

            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800 flex-wrap">
              <div>
                {!isCreatingNewBag && editingCourse.id && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = courses.find((x) => x.id === editingCourse.id);
                      if (c) {
                        handleRequestDeleteBag(c);
                      } else {
                        handleRequestDeleteBag(editingCourse as Course);
                      }
                    }}
                    className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-rose-100 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-rose-800/60 transition-colors flex items-center gap-1.5 cursor-pointer font-quran"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>حذف هذه الحقيبة</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('bags_list')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 cursor-pointer font-quran"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer font-quran"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ بيانات الحقيبة</span>
                </button>
              </div>
            </div>

          </div>
        </form>
      )}

      {/* VIEW 3: MANAGE UNITS & LESSONS OF SELECTED BAG */}
      {viewMode === 'manage_units' && currentSelectedCourse && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Bar for Selected Bag */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded-lg font-quran">
                {currentSelectedCourse.badge}
              </span>
              <div>
                <h3 className="text-base font-black font-quran text-slate-100">
                  {currentSelectedCourse.title}
                </h3>
                <p className="text-xs text-slate-400">
                  إجمالي الأبواب: {currentSelectedCourse.units?.length || 0} باب تعليمي
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAddUnit(currentSelectedCourse.id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer font-quran"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ إضافة باب جديد</span>
              </button>
            </div>
          </div>

          {/* Unit Edit Modal / Box */}
          {isEditingUnit && (
            <form
              onSubmit={(e) => handleSaveUnit(currentSelectedCourse.id, e)}
              className="bg-slate-950 p-5 rounded-2xl border-2 border-emerald-500/50 space-y-4 animate-fadeIn"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-black font-quran text-emerald-300 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>تعديل / إضافة باب دراسي</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingUnit(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-quran">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">رقم الباب</label>
                  <input
                    type="number"
                    min={1}
                    value={editingUnit.unitNumber || 1}
                    onChange={(e) => setEditingUnit({ ...editingUnit, unitNumber: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-300 font-bold">عنوان الباب *</label>
                  <input
                    type="text"
                    required
                    value={editingUnit.title || ''}
                    onChange={(e) => setEditingUnit({ ...editingUnit, title: e.target.value })}
                    placeholder="مثال: الباب الأول: المدخل والأصول"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-300 font-bold">العنوان الفرعي للباب</label>
                  <input
                    type="text"
                    value={editingUnit.subtitle || ''}
                    onChange={(e) => setEditingUnit({ ...editingUnit, subtitle: e.target.value })}
                    placeholder="تأصيل المسائل الأساسية"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">المدة التقديرية</label>
                  <input
                    type="text"
                    value={editingUnit.estimatedLectures || ''}
                    onChange={(e) => setEditingUnit({ ...editingUnit, estimatedLectures: e.target.value })}
                    placeholder="محاضرتان"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-slate-300 font-bold">وصف الباب</label>
                  <textarea
                    rows={2}
                    value={editingUnit.description || ''}
                    onChange={(e) => setEditingUnit({ ...editingUnit, description: e.target.value })}
                    placeholder="شرح أهداف الباب"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingUnit(false)}
                  className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-lg"
                >
                  حفظ الباب
                </button>
              </div>
            </form>
          )}

          {/* Lesson Edit Modal / Box */}
          {isEditingLesson && (
            <form
              onSubmit={handleSaveLesson}
              className="bg-slate-950 p-5 rounded-2xl border-2 border-amber-400/50 space-y-4 animate-fadeIn"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-black font-quran text-amber-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>تعديل / إضافة درس جديد</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingLesson(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-quran">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">رقم الدرس</label>
                  <input
                    type="number"
                    min={1}
                    value={editingLesson.lessonNumber || 1}
                    onChange={(e) => setEditingLesson({ ...editingLesson, lessonNumber: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-300 font-bold">عنوان الدرس *</label>
                  <input
                    type="text"
                    required
                    value={editingLesson.title || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                    placeholder="مثال: الدرس الأول: تعريف الحكم وشروطه"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-slate-300 font-bold">محتوى وشرح الدرس (Markdown)</label>
                  <textarea
                    rows={6}
                    value={editingLesson.contentMarkdown || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, contentMarkdown: e.target.value })}
                    placeholder="اكتب هنا الشرح التفصيلي للدرس..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 font-mono text-xs leading-relaxed"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-slate-300 font-bold">الواجب المنزلي والتطبيق العملي (يظهر للطالب)</label>
                  <input
                    type="text"
                    value={editingLesson.homeworkTask || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, homeworkTask: e.target.value })}
                    placeholder="مثال: استخراج 3 أمثلة من سورة الكهف..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1 bg-purple-950/40 p-3 rounded-xl border border-purple-800/60">
                  <label className="text-purple-300 font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    نموذج حل الواجب والتصحيح (🔒 خاص بنسخة المعلم فقط):
                  </label>
                  <textarea
                    rows={3}
                    value={editingLesson.homeworkSolution || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, homeworkSolution: e.target.value })}
                    placeholder="اكتب الحل النموذجي المعتمد للواجب..."
                    className="w-full bg-slate-900 border border-purple-700/60 rounded-xl p-2 text-slate-100 text-xs"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-slate-300 font-bold">تكليف التلاوة التطبيقي (يظهر للطالب)</label>
                  <input
                    type="text"
                    value={editingLesson.recitationTask || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, recitationTask: e.target.value })}
                    placeholder="مثال: تلاوة الآيات المحددة مع مراعاة تحقيق هذا الحكم..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/60">
                  <label className="text-emerald-300 font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    توجيهات المعلم عند الاستماع للتلاوة (🔒 خاص بنسخة المعلم فقط):
                  </label>
                  <textarea
                    rows={2}
                    value={editingLesson.recitationGuide || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, recitationGuide: e.target.value })}
                    placeholder="اكتب توجيهات الاستماع للتلاوة ورصد الأخطاء الشائعة..."
                    className="w-full bg-slate-900 border border-emerald-700/60 rounded-xl p-2 text-slate-100 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingLesson(false)}
                  className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-lg"
                >
                  حفظ الدرس
                </button>
              </div>
            </form>
          )}

          {/* Units List */}
          <div className="space-y-4">
            {(!currentSelectedCourse.units || currentSelectedCourse.units.length === 0) ? (
              <div className="bg-slate-950 p-8 rounded-2xl border border-dashed border-slate-800 text-center space-y-3">
                <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-sm font-bold font-quran text-slate-400">
                  لا توجد أبواب دراسية مضافة لهذه الحقيبة بعد.
                </div>
                <button
                  onClick={() => handleOpenAddUnit(currentSelectedCourse.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl font-quran"
                >
                  + إضافة الباب الأول
                </button>
              </div>
            ) : (
              currentSelectedCourse.units.map((unit, uIdx) => (
                <div
                  key={unit.id || uIdx}
                  className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4"
                >
                  {/* Unit Title & Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-900/80 text-emerald-300 text-xs font-black flex items-center justify-center font-quran">
                        {unit.unitNumber || uIdx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm sm:text-base font-black font-quran text-slate-100">
                          {unit.title}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {unit.subtitle || unit.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenAddLesson(unit.id)}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-quran cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ إضافة درس</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingUnit(JSON.parse(JSON.stringify(unit)));
                          setIsEditingUnit(true);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs p-1.5 px-2.5 rounded-lg border border-slate-700 cursor-pointer"
                        title="تعديل الباب"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteUnit(currentSelectedCourse.id, unit.id, unit.title)}
                        className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs p-1.5 rounded-lg border border-rose-800/60 cursor-pointer"
                        title="حذف الباب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons Inside This Unit */}
                  <div className="space-y-2 pr-2 sm:pr-4">
                    <div className="text-[11px] font-bold text-slate-400 font-quran">
                      الدروس المندرجة تحت هذا الباب ({unit.lessons?.length || 0} دروس):
                    </div>

                    {(!unit.lessons || unit.lessons.length === 0) ? (
                      <div className="text-xs text-slate-500 font-quran bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                        لا توجد دروس مضافة في هذا الباب بعد. اضغط على "+ إضافة درس" لإضافة محتوى دراسي.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {unit.lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id || lIdx}
                            className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 flex items-center justify-between gap-2 text-xs font-quran"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="font-bold text-slate-200 truncate">
                                {lesson.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setClassifierModalData({
                                    isOpen: true,
                                    courseId: currentSelectedCourse?.id,
                                    unitId: unit.id,
                                    lessonId: lesson.id,
                                  });
                                }}
                                className="text-slate-400 hover:text-emerald-400 p-1 transition-colors"
                                title="تصنيف ونقل هذا الدرس إلى حقيبة أو مستوى آخر"
                              >
                                <FolderSync className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setTargetUnitForLesson(unit.id);
                                  setEditingLesson(JSON.parse(JSON.stringify(lesson)));
                                  setIsEditingLesson(true);
                                }}
                                className="text-slate-400 hover:text-amber-300 p-1"
                                title="تعديل الدرس"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* Lesson Classifier & Movement Modal */}
      {classifierModalData.isOpen && (
        <LessonClassifierModal
          initialCourseId={classifierModalData.courseId}
          initialUnitId={classifierModalData.unitId}
          initialLessonId={classifierModalData.lessonId}
          onClose={() => setClassifierModalData({ isOpen: false })}
          onSuccess={(targetCId) => {
            setClassifierModalData({ isOpen: false });
            setSelectedBagId(targetCId);
            notifySuccess('تم بنجاح تحديث تصنيف ونقل الدرس!');
          }}
        />
      )}

      {/* 1. DELETE BAG CONFIRMATION MODAL */}
      {deleteTarget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setDeleteTarget(null)}
        >
          <div 
            className="bg-slate-900 border-2 border-rose-500/80 rounded-3xl p-6 sm:p-7 max-w-lg w-full text-slate-100 shadow-2xl space-y-5 dir-rtl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top red glow accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-700/60 flex items-center justify-center shrink-0 text-rose-400 shadow-lg">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black font-quran text-rose-200">
                  تأكيد حذف الحقيبة التعليمية
                </h3>
                <p className="text-xs text-slate-400 font-tajawal">
                  أنت على وشك حذف هذه الحقيبة بالكامل من المنصة التعليمية
                </p>
              </div>
            </div>

            {/* Target Bag Details Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/40">
                  {deleteTarget.badge || 'حقيبة تعليمية'}
                </span>
                <span className="text-xs text-slate-400 font-quran">
                  الأبواب: <strong>{deleteTarget.unitsCount ?? 0}</strong> | الدروس: <strong>{deleteTarget.lessonsCount ?? 0}</strong>
                </span>
              </div>
              <h4 className="text-base font-black font-quran text-slate-100">
                {deleteTarget.courseTitle}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-tajawal">
                💡 <strong>ملاحظة أمان:</strong> لن يتم فقدان محتويات هذه الحقيبة نهائياً؛ سيتم نقلها إلى <strong>«سلة المحذوفات»</strong> حيث يمكنك استعادتها بجميع أبوابها ودروسها في أي وقت بضغطة زر واحدة.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all font-quran cursor-pointer"
              >
                إلغاء والتراجع
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteBag}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 font-quran cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف الحقيبة الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DELETED BAGS ARCHIVE / TRASH MODAL */}
      {showTrashModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowTrashModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full text-slate-100 shadow-2xl space-y-5 dir-rtl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-quran text-slate-100">
                    سلة الحقائب المحذوفة ({deletedArchive.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    يمكنك استعادة أي حقيبة تم حذفها لتعود للمنصة بكامل محتوياتها
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowTrashModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of deleted bags */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {deletedArchive.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold font-quran text-slate-300">
                    سلة الحقائب المحذوفة فارغة
                  </p>
                  <p className="text-xs text-slate-500">
                    لم تقم بحذف أي حقيبة مؤخراً
                  </p>
                </div>
              ) : (
                deletedArchive.map((archived) => {
                  const uCount = archived.units?.length || 0;
                  const lCount = (archived.units || []).reduce(
                    (acc, u) => acc + (u.lessons?.length || 0),
                    0
                  );

                  return (
                    <div
                      key={archived.id}
                      className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/40">
                            {archived.badge || 'حقيبة'}
                          </span>
                          <h4 className="text-sm font-black font-quran text-slate-100">
                            {archived.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 font-quran">
                          الأبواب: <strong>{uCount}</strong> | الدروس: <strong>{lCount}</strong> | المستوى: {archived.levelText || 'عام'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleRestoreBag(archived.id, archived.title)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer font-quran shadow-sm"
                          title="استعادة الحقيبة وإعادتها لقائمة الحقائب النشطة"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>استرجاع الحقيبة</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من رغبتك في حذف حقيبة "${archived.title}" نهائياً من سلة المهملات؟`)) {
                              handlePermanentDelete(archived.id, archived.title);
                            }
                          }}
                          className="bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200 text-xs p-1.5 rounded-xl border border-slate-700 hover:border-rose-700 transition-colors cursor-pointer"
                          title="حذف نهائي لا يمكن التراجع عنه"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                إجمالي الحقائب في السلة: {deletedArchive.length}
              </span>
              <button
                onClick={() => setShowTrashModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl transition-colors font-quran cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
