import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Bookmark, Copy, Check, X, Sparkles, BookOpen, 
  ChevronDown, ChevronUp, Layers, HelpCircle, ArrowUpRight, Volume2, ShieldCheck
} from 'lucide-react';

export interface TajweedRuleItem {
  id: string;
  title: string;
  category: 'sakinan' | 'idgham' | 'makharij_sifaat' | 'noon_tanween' | 'meem_sakinah' | 'mudood' | 'lam_raa' | 'waqf_rasm';
  categoryLabel: string;
  condition: string;
  letters?: string;
  ruling: string; // الحكم الصوتي
  mechanism: string; // كيفية النطق / طريقة التطبيق
  examples: Array<{
    quranText: string;
    surahInfo?: string;
    explanation?: string;
  }>;
  importantNote?: string;
  evidenceMatn?: string; // الشاهد من التحفة أو الجزرية
  tags: string[];
}

export const TAJWEED_CHEAT_SHEET_DATA: TajweedRuleItem[] = [
  // 1. التقاء الساكنين
  {
    id: 'sakinan_kasr',
    title: 'التخلص من التقاء الساكنين بالكسر العارض',
    category: 'sakinan',
    categoryLabel: 'التقاء الساكنين',
    condition: 'إذا التقى ساكنان بين كلمتين، وكان الساكن الأول حرفاً صحيحاً أو تنويناً، فالأصل عند العرب وحفص هو تحريكه بالكسر.',
    ruling: 'تحريك الساكن الأول بالكسر العارض وصلاً وسقوطه وقفاً.',
    mechanism: 'يُنطق الحرف الأول مكسوراً كسرة خفيفة دون مد، وتسقط همزة الوصل في الكلمة الثانية.',
    examples: [
      { quranText: 'قُلِ ادْعُوا اللَّهَ', surahInfo: 'الإسراء: 110', explanation: 'اللام في (قُل) ساكنة تحركت بالكسر لالتقائها مع الدال الساكنة.' },
      { quranText: 'قُلِ انظُرُوا', surahInfo: 'يونس: 101', explanation: 'كسر لام (قل) وصلاً للتخلص من التقاء الساكنين.' },
      { quranText: 'عَادًا الْأُولَىٰ', surahInfo: 'النجم: 50', explanation: 'تنوين (عاداً) ينطق نوناً ساكنة مكسورة وصلاً (عادَنِ الأولى).' },
      { quranText: 'أَنِ امْشُوا', surahInfo: 'ص: 6', explanation: 'نون (أن) الساكنة حُرّكت بالكسر وصلاً لالتقاء الساكنين.' },
    ],
    importantNote: 'الكسر هو الأصل العام في التخلص من التقاء الساكنين في اللغة العربية لأن الكسرة أخف من الضمة وحركتها غير مستثقلة.',
    evidenceMatn: 'وحَرِّكِ السَّاكِنَ بالْكَسْرِ كَفَى ... كَقَوْلِهِ: قُلِ ادْعُ ذَا التُّقَى عُرِفَا',
    tags: ['كسر عارض', 'التقاء الساكنين', 'تنوين', 'نون التنوين', 'بين كلمتين']
  },
  {
    id: 'sakinan_fath',
    title: 'التخلص من التقاء الساكنين بالفتح العارض',
    category: 'sakinan',
    categoryLabel: 'التقاء الساكنين',
    condition: 'مواضع مخصوصة ضُبطت بالفتح العارض بدلاً من الكسر التماساً للخفة، وهي: (مِن) الجارة، وتاء التأنيث المتصلة بألف الاثنين، وفاتحة آل عمران وصلاً.',
    ruling: 'تحريك الساكن الأول بالفتح العارض وصلاً.',
    mechanism: 'فتح الحرف الأول فتحة محكمة لخفة الفتحة ودفعاً لتوالي الكسرات أو الثقل.',
    examples: [
      { quranText: 'مِنَ الْمُؤْمِنِينَ', surahInfo: 'الأحزاب: 23', explanation: 'فتحت نون (مِن) الجارة لخفة الفتح بعد الميم المكسورة.' },
      { quranText: 'قَالَتَا أَتَيْنَا طَائِعِينَ', surahInfo: 'فصلت: 11', explanation: 'فتحت تاء التأنيث الساكنة لمناسبة ألف الاثنين.' },
      { quranText: 'الم ۚ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ', surahInfo: 'آل عمران: 1-2', explanation: 'فتح ميم (الم) وصلاً بلفظ الجلالة لمنع التقاء الساكنين مع جواز مدها 6 أو 2.' },
    ],
    importantNote: 'إذا وُصلت (الم) بلفظ الجلالة في آل عمران، جاز في الميم وجهان: المد الطويل (6 حركات) مراعاةً للأصل، أو القصر (حركتان) اعتداداً بالحركة العارضة.',
    tags: ['فتح عارض', 'من الجارة', 'آل عمران', 'قالتا', 'خفة الفتح']
  },
  {
    id: 'sakinan_damm',
    title: 'التخلص من التقاء الساكنين بالضم العارض',
    category: 'sakinan',
    categoryLabel: 'التقاء الساكنين',
    condition: 'يُتخلص بالضم العارض في موضعين قياسيين: واو اللين الدالة على جمع المذكر، وميم الجمع.',
    ruling: 'تحريك الساكن الأول بالضم العارض وصلاً.',
    mechanism: 'ضم الواو اللينة أو ميم الجمع وصلاً لمجانسة حركة الجمع وتفادي اللبس بالمفرد.',
    examples: [
      { quranText: 'فَتَمَنَّوُا الْمَوْتَ', surahInfo: 'البقرة: 95', explanation: 'ضمت واو اللين الدالة على الجمع للتخلص من التقاء الساكنين.' },
      { quranText: 'عَلَيْكُمُ الْقِتَالُ', surahInfo: 'البقرة: 216', explanation: 'ضمت ميم الجمع وصلاً للتخلص من التقاء الساكنين.' },
      { quranText: 'اشْتَرَوُا الضَّلَالَةَ', surahInfo: 'البقرة: 16', explanation: 'ضم واو الجمع اللينة وصلاً.' },
    ],
    importantNote: 'واو اللين لغير الجمع تُكسر على الأصل مثل: ﴿أَوِ انقُصْ مِنْهُ﴾، بينما واو الجمع تُضم حصراً.',
    tags: ['ضم عارض', 'واو اللين', 'ميم الجمع', 'جمع المذكر']
  },
  {
    id: 'sakinan_hadhf_madd',
    title: 'التخلص بحذف حرف المد لفظاً وصلاً',
    category: 'sakinan',
    categoryLabel: 'التقاء الساكنين',
    condition: 'إذا كان الساكن الأول حرف مد (ألف أو واو مدية أو ياء مدية) في آخر الكلمة، وجاء بعده حرف ساكن في أول الكلمة التالية.',
    ruling: 'حذف حرف المد في اللفظ وصلاً مع إثباته في الرسم والوقف.',
    mechanism: 'الانتقال المباشر من الحرف المحرك قبل حرف المد إلى الساكن الثاني في الكلمة التالية دون تمطيط صوت المد.',
    examples: [
      { quranText: 'وَقَالَا الْحَمْدُ لِلَّهِ', surahInfo: 'النمل: 15', explanation: 'سقوط ألف (وقالا) وصلاً، فيُنطق: (وقَالَ لْحمد).' },
      { quranText: 'حَاضِرِي الْمَسْجِدِ الْحَرَامِ', surahInfo: 'البقرة: 196', explanation: 'حذف ياء (حاضري) وصلاً: (حاضرِ لْمسجد).' },
      { quranText: 'قَالُوا اتَّخَذَ اللَّهُ', surahInfo: 'البقرة: 116', explanation: 'حذف واو (قالوا) وصلاً: (قالُ تَّخذ).' },
    ],
    importantNote: 'إذا وقف القارئ على الكلمة الأولى، عاد حرف المد إلى الظهور حركتين (مد طبيعي) لزوال موجب الحذف وهو التقاء الساكنين.',
    tags: ['حذف حرف المد', 'حرف مد', 'سقوط وصلا', 'إثبات وقفا']
  },
  {
    id: 'sakinan_single_word',
    title: 'التقاء الساكنين في كلمة واحدة (المد اللازم)',
    category: 'sakinan',
    categoryLabel: 'التقاء الساكنين',
    condition: 'أن يلي حرفَ المدِ سكونٌ أصلي في نفس الكلمة وصلاً ووقفاً.',
    ruling: 'يُغتفر التقاء الساكنين بمد حرف المد ست حركات وجوباً (المد اللازم).',
    mechanism: 'مد الصوت بحرف المد 6 حركات ليكون المد فاصلاً زمنياً بين الساكنين يمنع ثقل النطق.',
    examples: [
      { quranText: 'وَلَا الضَّالِّينَ', surahInfo: 'الفاتحة: 7', explanation: 'التقى حرف المد (الألف) مع اللام الساكنة الأولى من اللام المشددة.' },
      { quranText: 'ءَالْآنَ وَقَدْ عَصَيْتَ', surahInfo: 'يونس: 91', explanation: 'مد لازم كلمي مخفف، التقت الألف باللام الساكنة.' },
      { quranText: 'الْحَاقَّةُ', surahInfo: 'الحاقة: 1', explanation: 'مد لازم كلمي مثقل 6 حركات.' },
    ],
    importantNote: 'المد اللازم هو الموضع الوحيد الذي يلتقي فيه ساكنان في كلمة واحدة وصلاً في القرآن الكريم.',
    tags: ['مد لازم', 'كلمة واحدة', 'مثقل', 'مخفف', '6 حركات']
  },

  // 2. أحكام الإدغام
  {
    id: 'idgham_mithlayn',
    title: 'إدغام المتماثلين (المثلين) الصغير',
    category: 'idgham',
    categoryLabel: 'أحكام الإدغام',
    condition: 'أن يتحد الحرفان مخرجاً وصفةً واسماً ورسماً، ويكون الحرف الأول ساكناً والثاني متحركاً.',
    letters: 'أي حرفين متماثلين (ب مع ب، ت مع ت، د مع د، ك مع ك...) ما عدا حروف المد.',
    ruling: 'وجوب الإدغام الكامل بتشديد الحرف الثاني تشديداً تاماً.',
    mechanism: 'إدخال الحرف الأول في الثاني بحيث يرتفع عنهما المخرج ارتفاعة واحدة مشددة.',
    examples: [
      { quranText: 'اضْرِب بِّعَصَاكَ', surahInfo: 'البقرة: 60', explanation: 'إدغام الباء الساكنة في الباء المتحركة.' },
      { quranText: 'فَمَا رَبِحَت تِّجَارَتُهُمْ', surahInfo: 'البقرة: 16', explanation: 'إدغام التاء الساكنة في التاء المتحركة.' },
      { quranText: 'يُدْرِككُّمُ الْمَوْتُ', surahInfo: 'النساء: 78', explanation: 'إدغام الكاف الساكنة في الكاف المتحركة.' },
      { quranText: 'وَقَد دَّخَلُوا', surahInfo: 'المائدة: 61', explanation: 'إدغام الدال الساكنة في الدال المتحركة.' },
    ],
    importantNote: 'يُستثنى من الإدغام: حرف المد إذا تلاه مثله متحرك نحو: ﴿آمَنُوا وَعَمِلُوا﴾ و﴿فِي يَوْمٍ﴾ حفظاً للمد من الزوال.',
    evidenceMatn: 'إنْ فِي الصِّفَاتِ وَالمَخَارِجِ اتَّفَقْ ... حَرْفَانِ فَالْمِثْلاَنِ فِيهِمَا أَحَقّ',
    tags: ['متماثلين', 'مثلين', 'صغير', 'اضرب بعصاك', 'استثناء المد']
  },
  {
    id: 'idgham_mutajanisayn',
    title: 'إدغام المتجانسين الصغير',
    category: 'idgham',
    categoryLabel: 'أحكام الإدغام',
    condition: 'أن يتحد الحرفان في المخرج الخاص ويختلفا في بعض الصفات، ويكون الأول ساكناً والثاني متحركاً.',
    letters: 'مجموعات مخرجية: (ت، د، ط)، (ذ، ظ، ث)، (ب، م).',
    ruling: 'الإدغام؛ ويكون كاملاً في أغلب المواضع، وناقصاً في الطاء مع التاء.',
    mechanism: 'قلب الحرف الأول إلى جنس الثاني وإدغامه فيه مع بقاء صفة الإطباق والاستعلاء في الطاء مع التاء (إدغام ناقص).',
    examples: [
      { quranText: 'أُجِيبَت دَّعْوَتُكُمَا', surahInfo: 'يونس: 89', explanation: 'إدغام التاء في الدال إدغاماً كاملاً.' },
      { quranText: 'قَد تَّبَيَّنَ الرُّشْدُ', surahInfo: 'البقرة: 256', explanation: 'إدغام الدال في التاء إدغاماً كاملاً.' },
      { quranText: 'هَمَّت طَّائِفَةٌ', surahInfo: 'آل عمران: 69', explanation: 'إدغام التاء في الطاء إدغاماً كاملاً.' },
      { quranText: 'بَسَطتَ إِلَيَّ يَدَكَ', surahInfo: 'المائدة: 28', explanation: 'إدغام ناقص: تبسط الطاء في التاء مع استعلاء وإطباق دون قلقلة.' },
      { quranText: 'يَلْهَث ذَّلِكَ', surahInfo: 'الأعراف: 176', explanation: 'إدغام الثاء في الذال وصلاً عند حفص.' },
      { quranText: 'ارْكَب مَّعَنَا', surahInfo: 'هود: 42', explanation: 'إدغام الباء في الميم مع غنة كاملة.' },
    ],
    importantNote: 'في ﴿بَسَطتَ﴾ و﴿أَحَطتُ﴾ الإدغام ناقص، فتحافظ على استعلاء وإطباق الطاء دون أن تقلقلها، ثم تفتح التاء المستفلة.',
    evidenceMatn: 'وَإِنْ يَكُونَا مَخْرَجًا تَقَارَبَا ... وَفِي الصِّفَاتِ اخْتَلَفَا يُلَقَّبَا: مُتَقَارِبَيْنِ، أَوْ يَكُونَا اتَّفَقَا ... فِي مَخْرَجٍ دُونَ الصِّفَاتِ حُقِّقَا: بِالْمُتَجَانِسَيْنِ',
    tags: ['متجانسين', 'بسطت', 'اركب معنا', 'يلهث ذلك', 'إدغام ناقص']
  },
  {
    id: 'idgham_mutaqaribayn',
    title: 'إدغام المتقاربين الصغير',
    category: 'idgham',
    categoryLabel: 'أحكام الإدغام',
    condition: 'أن يتقارب الحرفان مخرجاً وصفةً، ويكون الأول ساكناً والثاني متحركاً.',
    letters: 'اللام والراء، القاف والكاف.',
    ruling: 'وجوب الإدغام عند حفص.',
    mechanism: 'إدخال اللام في الراء إدغاماً تاماً بلا غنة، وإدخال القاف في الكاف (والوجه المقدم فيه الإدغام الكامل).',
    examples: [
      { quranText: 'وَقُل رَّبِّ ارْحَمْهُمَا', surahInfo: 'الإسراء: 24', explanation: 'إدغام اللام الساكنة في الراء إدغاماً كاملاً.' },
      { quranText: 'بَل رَّفَعَهُ اللَّهُ', surahInfo: 'النساء: 158', explanation: 'إدغام لام (بل) في الراء.' },
      { quranText: 'أَلَمْ نَخْلُقكُّم مِّن مَّاءٍ مَّهِينٍ', surahInfo: 'المرسلات: 20', explanation: 'إدغام القاف في الكاف، والمقدم إدغام كامل مشدد الكاف (نخلُكُّم).' },
    ],
    importantNote: 'يُستثنى لحفص موضع ﴿كَلَّا بَلْ ۜ رَانَ﴾ بسبب وجوب السكت اللطيف المانع من الإدغام.',
    tags: ['متقاربين', 'وقل رب', 'نخلقكم', 'سكت بل ران']
  },

  // 3. النون الساكنة والتنوين
  {
    id: 'noon_izhar',
    title: 'الإظهار الحلقي للنون الساكنة والتنوين',
    category: 'noon_tanween',
    categoryLabel: 'النون والتنوين',
    condition: 'أن تقع النون الساكنة أو التنوين قبل أحد حروف الحلق الستة.',
    letters: 'الهمزة، الهاء، العين، الحاء، الغين، الخاء (أخي هاك علماً حازه غير خاسر).',
    ruling: 'إظهار النون الساكنة والتنوين إظهاراً تاماً دون زيادة غنة ولا سكت.',
    mechanism: 'إخراج النون من مخرجها (طرف اللسان) والحرف الحلقي من مخرجه بوضوح تام دون تطنين.',
    examples: [
      { quranText: 'مَنْ آمَنَ', surahInfo: 'البقرة: 62', explanation: 'نون ساكنة بعدها همزة.' },
      { quranText: 'مِنْهُمْ', surahInfo: 'آل عمران: 110', explanation: 'نون ساكنة بعدها هاء في كلمة واحدة.' },
      { quranText: 'عَلِيمٌ حَكِيمٌ', surahInfo: 'النساء: 26', explanation: 'تنوين بعده حاء.' },
      { quranText: 'مِنْ غِلٍّ', surahInfo: 'الحجر: 47', explanation: 'نون ساكنة بعدها غين.' },
    ],
    importantNote: 'سبب الإظهار هو البُعد الشديد بين مخرج النون (طرف اللسان) ومخرج حروف الحلق، وصعوبة الإدغام أو الإخفاء مع التباعد.',
    evidenceMatn: 'فَالْأَوَّلُ الإِظْهَارُ قَبْلَ أَحْرُفِ ... لِلْحَلْقِ سِتٌّ رُتِّبَتْ فَلْتَعْرِفِ: هَمْزٌ فَهَاءٌ ثُمَّ عَيْنٌ حَاءُ ... مُهْمَلَتَانِ ثُمَّ غَيْنٌ خَاءُ',
    tags: ['إظهار حلقي', 'نون ساكنة', 'تنوين', 'حروف الحلق', 'بعد المخرج']
  },
  {
    id: 'noon_idgham',
    title: 'إدغام النون الساكنة والتنوين (بغنة وبغير غنة)',
    category: 'noon_tanween',
    categoryLabel: 'النون والتنوين',
    condition: 'أن تقع النون الساكنة في آخر الكلمة أو التنوين وتليها حروف كلمة (يرملون).',
    letters: 'بغنة في (ينمو: ي، ن، م، و)، وبغير غنة في (ل، ر).',
    ruling: 'إدغام بغنة أكمل ما تكون (حركتان)، أو إدغام كامل بغير غنة.',
    mechanism: 'قلب النون الساكنة أو التنوين إلى جنس الحرف التالي وإدغامه فيه وصلاً.',
    examples: [
      { quranText: 'مَن يَقُولُ', surahInfo: 'البقرة: 8', explanation: 'إدغام بغنة ناقص مع الياء.' },
      { quranText: 'مِّن مَّالٍ', surahInfo: 'المؤمنون: 55', explanation: 'إدغام بغنة كامل مع الميم.' },
      { quranText: 'مِن لَّدُنْهُ', surahInfo: 'الكهف: 2', explanation: 'إدغام بغير غنة كامل مع اللام.' },
      { quranText: 'غَفُورٌ رَّحِيمٌ', surahInfo: 'البقرة: 173', explanation: 'إدغام تنوين في الراء بغير غنة.' },
    ],
    importantNote: 'يشترط لإدغام النون الساكنة أن تكون في كلمتين؛ فإن التقت في كلمة واحدة وجب الإظهار المطلق في 4 كلمات قرآنية: (دُنْيَا، صِنْوَانٌ، قِنْوَانٌ، بُنْيَانٌ).',
    evidenceMatn: 'وَالثَّانِ إِدْغَامٌ بِسِتَّةٍ أَتَتْ ... فِي يَرْمُلُونَ عِنْدَهُمْ قَدْ ثَبَتَتْ ... لَكِنَّهَا قِسْمَانِ: قِسْمٌ يُدْغَمَا ... فِيهِ بِغُنَّةٍ بِيَنْمُو عُلِمَا ... إِلاَّ إِذَا كَانَا بِكِلْمَةٍ فَلاَ ... تُدْغِمْ كَدُنْيَا ثُمَّ صِنْوَانٍ تَلاَ',
    tags: ['إدغام بغنة', 'إدغام بغير غنة', 'يرملون', 'إظهار مطلق', 'دنيا قنوان']
  },
  {
    id: 'noon_iqlab',
    title: 'الإقلاب للنون الساكنة والتنوين',
    category: 'noon_tanween',
    categoryLabel: 'النون والتنوين',
    condition: 'أن تقع النون الساكنة أو التنوين قبل حرف الباء حصراً.',
    letters: 'حرف الباء (ب).',
    ruling: 'قلب النون أو التنوين ميماً مخفاة بغنة حركتين.',
    mechanism: 'قلب النون ميماً مع تلامس خفيف للشفتين دون كزّ شديد وإخراج غنة من الخيشوم.',
    examples: [
      { quranText: 'مِن بَعْدِ', surahInfo: 'البقرة: 27', explanation: 'قلب النون الساكنة ميماً قبل الباء.' },
      { quranText: 'أَنبِئْهُم', surahInfo: 'البقرة: 33', explanation: 'إقلاب في كلمة واحدة.' },
      { quranText: 'سَمِيعٌ بَصِيرٌ', surahInfo: 'الإسراء: 1', explanation: 'إقلاب التنوين ميماً قبل الباء.' },
    ],
    importantNote: 'علامة الإقلاب في المصحف الشريف هي وضع ميم صغيرة قائمة (مـ) فوق النون الساكنة أو بدلاً من الحركة الثانية للتنوين.',
    evidenceMatn: 'وَالثَّالِثُ الإِقْلاَبُ عِنْدَ الْبَاءِ ... مِيمًا بِغُنَّةٍ مَعَ الإِخْفَاءِ',
    tags: ['إقلاب', 'قلب', 'ميم مخفاة', 'باء', 'تلامس الشفتين']
  },
  {
    id: 'noon_ikhfa',
    title: 'الإخفاء الحقيقي للنون الساكنة والتنوين',
    category: 'noon_tanween',
    categoryLabel: 'النون والتنوين',
    condition: 'أن تقع النون الساكنة أو التنوين قبل أحرف الإخفاء الخمسة عشر.',
    letters: 'ص، ذ، ث، ك، ج، ش، ق، س، د، ط، ز، ف، ت، ض، ظ (أوائل كلمات: صف ذا ثنا كم جاد شخص قد سما دم طيبا زد في تقى ضع ظالما).',
    ruling: 'ستر ذات النون وإبقاء صفتها (الغنة) بمقدار حركتين عند مخرج الحرف التالي.',
    mechanism: 'وضع اللسان مهيأً عند مخرج حرف الإخفاء التالي دون إلصاقه بمخرج النون، مع سريان الغنة من الخيشوم.',
    examples: [
      { quranText: 'مِن قَبْلِ', surahInfo: 'البقرة: 25', explanation: 'إخفاء نون مع غنة مفخمة لمجاورة حرف القاف المستعلي.' },
      { quranText: 'أَنتُمْ', surahInfo: 'البقرة: 22', explanation: 'إخفاء نون مع غنة مرققة لمجاورة التاء المستفلة.' },
      { quranText: 'مِن دُونِ اللَّهِ', surahInfo: 'البقرة: 23', explanation: 'إخفاء نون مع الدال.' },
      { quranText: 'مَاءً ثَجَّاجًا', surahInfo: 'النبأ: 14', explanation: 'إخفاء التنوين مع الثاء.' },
    ],
    importantNote: 'قاعدة الغنة في الإخفاء: تتبع الغنة ما بعدها تفخيماً وترقيقاً؛ فإذا تلاها حرف استعلاء (ص، ض، ط، ظ، ق) فخمت، ومع باقي الحروف رققت.',
    evidenceMatn: 'وَالرَّابِعُ الإِخْفَاءُ عِنْدَ الْفَاضِلِ ... مِنَ الحُرُوفِ وَاجِبٌ لِلْفَاضِلِ ... فِي خَمْسَةٍ مِنْ بَعْدِ عَشْرٍ رَمْزُهَا ... فِي كِلْمِ هَذَا البَيْتِ قَد ضَمَّنْتُهَا',
    tags: ['إخفاء حقيقي', 'غنة مفخمة', 'غنة مرققة', '15 حرفا', 'ستر النون']
  },

  // 4. الميم الساكنة
  {
    id: 'meem_ikhfa_shafawi',
    title: 'الإخفاء الشفوي للميم الساكنة',
    category: 'meem_sakinah',
    categoryLabel: 'الميم الساكنة',
    condition: 'أن تقع الميم الساكنة في آخر الكلمة ويليها حرف الباء في أول الكلمة التالية.',
    letters: 'حرف الباء (ب).',
    ruling: 'إخفاء الميم الساكنة مع الغنة بمقدار حركتين.',
    mechanism: 'تلامس الشفتين برفق مع إخراج غنة خيشومية حركتين دون إطباق قاسٍ ولا فرجة مفرطة.',
    examples: [
      { quranText: 'تَرْمِيهِم بِحِجَارَةٍ', surahInfo: 'الفيل: 4', explanation: 'ميم ساكنة بعدها باء.' },
      { quranText: 'يَعْتَصِم بِاللَّهِ', surahInfo: 'آل عمران: 101', explanation: 'إخفاء شفوي للميم الساكنة مع الباء.' },
      { quranText: 'وَمَا هُم بِمُؤْمِنِينَ', surahInfo: 'البقرة: 8', explanation: 'إخفاء شفوي بغنة حركتين.' },
    ],
    importantNote: 'سُمي شفوياً لأن الميم والباء تخرجان معاً من الشفتين.',
    evidenceMatn: 'فَالْأَوَّلُ الإِخْفَاءُ عِنْدَ الْبَاءِ ... وَسَمِّهِ الشَّفْوِيَّ لِلْقُرَّاءِ',
    tags: ['إخفاء شفوي', 'ميم ساكنة', 'باء', 'شفتين', 'ترميهم بحجارة']
  },
  {
    id: 'meem_izhar_shafawi',
    title: 'الإظهار الشفوي للميم الساكنة',
    category: 'meem_sakinah',
    categoryLabel: 'الميم الساكنة',
    condition: 'أن تقع الميم الساكنة قبل أي حرف من أحرف الهجاء الـ 26 عدا الميم والباء.',
    letters: 'جميع الحروف الهجائية عدا (م، ب).',
    ruling: 'وجوب إظهار الميم الساكنة إظهاراً بيانياً جلياً من الشفتين دون سكت ولا تمطيط غنة.',
    mechanism: 'إطباق الشفتين على الميم إطباقاً طبيعياً مع أصل الغنة المتأصلة فيها دون زيادة.',
    examples: [
      { quranText: 'أَنْعَمْتَ عَلَيْهِمْ', surahInfo: 'الفاتحة: 7', explanation: 'إظهار شفوي للميم في (أنعمت) وفي (عليهم).' },
      { quranText: 'لَهُمْ فِيهَا', surahInfo: 'البقرة: 25', explanation: 'إظهار شفوي شديد العناية مع الفاء.' },
      { quranText: 'عَلَيْهِمْ وَلَا الضَّالِّينَ', surahInfo: 'الفاتحة: 7', explanation: 'إظهار شفوي شديد العناية مع الواو.' },
    ],
    importantNote: 'احذر أشد الحذر من إخفاء الميم الساكنة عند الواو أو الفاء؛ لاتحاد المخرج مع الواو وقربه مع الفاء.',
    evidenceMatn: 'وَاحْذَرْ لَدَى وَاوٍ وَفَا أَنْ تَخْتَفِي ... لِقُرْبِهَا وَلاتِّحَادِ فَاعْرِفِ',
    tags: ['إظهار شفوي', 'تحذير الواو والفاء', 'أنعمت عليهم', '26 حرفا']
  },

  // 5. المخارج والصفات
  {
    id: 'makharij_five_general',
    title: 'المخارج العامة الخمسة للحروف',
    category: 'makharij_sifaat',
    categoryLabel: 'المخارج والصفات',
    condition: 'المخارج الكلية الرئيسة التي يتفرع عنها سبعة عشر مخرجاً خاصاً عند الجمهور (الخليل وابن الجزري).',
    ruling: 'تحديد موضع خروج كل حرف بدقة لتمييزه عن غيره، وحفظ البنية الصوتية للقرآن.',
    mechanism: 'الجوف (مخرج تقديري لحروف المد)، الحلق (3 مخارج)، اللسان (10 مخارج لـ 18 حرفاً)، الشفتان (مخرجان لـ 4 أحرف)، الخيشوم (مخرج الغنة).',
    examples: [
      { quranText: 'الجوف: ﴿نُوحِيهَا﴾', explanation: 'جمع حروف المد الثلاثة: الواو، الياء، الألف.' },
      { quranText: 'الحلق: ﴿ءَ، هـ، ع، ح، غ، خ﴾', explanation: 'أقصى، وسط، أدنى الحلق.' },
      { quranText: 'اللسان: ﴿ق، ك، ج، ش، ي، ض، ل، ن، ر، ط، د، ت، ص، ز، س، ظ، ذ، ث﴾', explanation: 'أعظم مخارج الحروف وأشملها.' },
    ],
    importantNote: 'مذهب سيبويه والشاطبي: المخارج 16 بإسقاط الجوف؛ ومذهب الفراء والجرمي: 14 مخرجاً بجعل اللام والنون والراء من مخرج واحد.',
    evidenceMatn: 'مَخَارِجُ الحُرُوفِ سَبْعَةَ عَشَرْ ... عَلَى الَّذِي يَخْتَارُهُ مَنِ اخْتَبَرْ: لِلْجَوْفِ أَلِفٌ وَأُخْتَاهَا وَهِي ... حُرُوفُ مَدٍّ لِلْهَوَاءِ تَنْتَهِي',
    tags: ['المخارج الخمسة', 'الجوف', 'الحلق', 'اللسان', 'الشفتان', 'الخيشوم', '17 مخرجا']
  },
  {
    id: 'sifaat_mutadaddah',
    title: 'الصفات الذاتية المتضادة (عشر صفات)',
    category: 'makharij_sifaat',
    categoryLabel: 'المخارج والصفات',
    condition: 'صفات ذاتية للحرف لا تفارقه أبداً ويكون لكل صفة ضدها المقابل.',
    ruling: 'إعطاء كل حرف حقه ومستحقه من هذه الصفات بدقة عند السكون والحركة.',
    mechanism: '1. الهمس (فحثه شخص سكت) ↔ الجهر. 2. الشدة (أجد قط بكت) والتوسط (لن عمر) ↔ الرخاوة. 3. الاستعلاء (خص ضغط قظ) ↔ الاستفال. 4. الإطباق (ص، ض، ط، ظ) ↔ الانفتاح. 5. الإذلاق (فر من لب) ↔ الإصمات.',
    examples: [
      { quranText: 'الهمس: ﴿فَتَارِكُوكَ﴾', explanation: 'جريان النفس مع حروف الهمس عند سكونها.' },
      { quranText: 'الشدة والتوسط: ﴿قَدْ﴾ ﴿الْحَمْدُ﴾', explanation: 'انحباس الصوت في الشدة، وجريانه الجزئي في (لن عمر).' },
      { quranText: 'الإطباق: ﴿الصِّرَاطَ﴾', explanation: 'تلاصق طائفة من اللسان بالحَنَك الأعلى مع الصاد والطاء.' },
    ],
    importantNote: 'الحروف المطبقة الأربعة (ص، ض، ط، ظ) هي أقوى حروف الاستعلاء تفخيماً، وأقواها على الإطلاق حرف الطاء.',
    evidenceMatn: 'صِفَاتُهَا جَهْرٌ وَرِخْوٌ مُسْتَفِلْ ... مُنْفَتِحٌ مُصْمَتَةٌ وَالضِّدَّ قُلْ: مَهْمُوسُهَا: فَحَثَّهُ شَخْصٌ سَكَتْ ... شَدِيدُهَا لَفْظُ: أَجِدْ قَطٍ بَكَتْ',
    tags: ['صفات متضادة', 'همس', 'جهر', 'شدة ورخاوة', 'استعلاء واستفال', 'إطباق']
  },
  {
    id: 'sifaat_ghayr_mutadaddah',
    title: 'الصفات الذاتية التي لا ضد لها',
    category: 'makharij_sifaat',
    categoryLabel: 'المخارج والصفات',
    condition: 'صفات تميز أحرفاً بعينها دون أن يكون لها نقيض يقابلها في باقي الحروف.',
    letters: 'الصفير (ص، ز، س)، القلقلة (قطب جد)، اللين (الواو والياء الساكنتان المفتوح ما قبلهما)، الانحراف (ل، ر)، التكرير (ر - ويجب ستره وتجنب إكثاره)، التفشي (ش)، الاستطالة (ض)، الخفاء (حروف المد والهاء).',
    ruling: 'إظهار هذه الصفات بحسب مواضع الحروف لتحقيق كمال الأداء القرآني.',
    mechanism: 'اهتزاز المخرج في القلقلة، امتداد الصوت في الاستطالة مع الضاد، انتشار الهواء في التفشي مع الشين.',
    examples: [
      { quranText: 'القلقلة: ﴿الْفَلَقِ﴾ ﴿وَتَبَّ﴾', explanation: 'نبرة صوتية واضحة عند سكون حروف (قطب جد).' },
      { quranText: 'الاستطالة: ﴿وَلَا الضَّالِّينَ﴾', explanation: 'امتداد مخرج حافة اللسان بالضاد من الأمام إلى الخلف.' },
      { quranText: 'التفشي: ﴿الشَّيْطَانُ﴾', explanation: 'انتشار الهواء داخل الفم مع الشين.' },
    ],
    importantNote: 'صفة التكرير في الراء ذكرت لتُجتنب ولا يُبالغ فيها بحيث لا تتكرر طرقة طرف اللسان أكثر من مرة واحدة.',
    tags: ['صفات لا ضد لها', 'قلقلة', 'استطالة', 'تفشي', 'تكرير', 'صفير', 'لين']
  },

  // 6. أحكام المدود
  {
    id: 'madd_wajeb_muttasil',
    title: 'المد الواجب المتصل',
    category: 'mudood',
    categoryLabel: 'أحكام المدود',
    condition: 'أن يأتي حرف المد والهمزة بعده في كلمة واحدة متصلين.',
    letters: 'الألف، الواو المدية، الياء المدية وبعدها همزة في نفس الكلمة.',
    ruling: 'وجوب مده 4 أو 5 حركات وصلاً لحفص، ويجوز 6 حركات إذا كانت الهمزة متطرفة موقوفاً عليها.',
    mechanism: 'إطالة الصوت بحرف المد قبل الهمزة ليتمكن اللسان من نطق الهمزة الشديدة بسهولة.',
    examples: [
      { quranText: 'إِذَا جَاءَ نَصْرُ اللَّهِ', surahInfo: 'النصر: 1', explanation: 'مد متصل لوجود الهمزة بعد الألف في كلمة (جاء).' },
      { quranText: 'وَالسَّمَاءِ وَالطَّارِقِ', surahInfo: 'الطارق: 1', explanation: 'مد متصل 4 أو 5 حركات، أو 6 وقفاً.' },
      { quranText: 'سُوءَ الْعَذَابِ', surahInfo: 'البقرة: 49', explanation: 'مد متصل مع الواو.' },
      { quranText: 'سِيئَتْ وُجُوهُ', surahInfo: 'الملك: 27', explanation: 'مد متصل مع الياء.' },
    ],
    importantNote: 'سُمي واجباً لإجماع كافة القراء على مده زيادة على الطبيعي (أكثر من حركتين).',
    evidenceMatn: 'فَوَاجِبٌ إِنْ جَاءَ هَمْزٌ بَعْدَ مَدّ ... فِي كِلْمَةٍ وَذَا بِمُتَّصِلٍ يُعَدّ',
    tags: ['مد واجب متصل', '4 حركات', '5 حركات', 'همزة في كلمة واحدة', 'السماء جاء']
  },
  {
    id: 'madd_jaez_munfasil',
    title: 'المد الجائز المنفصل',
    category: 'mudood',
    categoryLabel: 'أحكام المدود',
    condition: 'أن يكون حرف المد في آخر الكلمة الأولى، وتكون همزة القطع في أول الكلمة الثانية التي تليها مباشرة.',
    ruling: 'جواز مده 4 أو 5 حركات لحفص من طريق الشاطبية، وجواز قصره حركتين من طريق طيبة النشر.',
    mechanism: 'مد حرف المد وصلاً بمقدار 4 أو 5 حركات، فإن وُقف على الكلمة الأولى سقط السبب وعاد مداً طبيعياً بحركتين.',
    examples: [
      { quranText: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', surahInfo: 'الكوثر: 1', explanation: 'الألف في (إنا) والهمزة في (أعطيناك).' },
      { quranText: 'قُوا أَنفُسَكُمْ', surahInfo: 'التحريم: 6', explanation: 'الواو في (قوا) والهمزة في (أنفسكم).' },
      { quranText: 'وَفِي أَنفُسِكُمْ', surahInfo: 'الذاريات: 21', explanation: 'الياء في (وفي) والهمزة في (أنفسكم).' },
    ],
    importantNote: 'يلحق بالمنفصل: مد الصلة الكبرى عندما تأتي هاء الضمير المفرد المذكر الغائب بعدها همزة قطع مثل: ﴿يَحْسَبُ أَنَّ مَالَهُۥٓ أَخْلَدَهُۥ﴾.',
    evidenceMatn: 'وَجَائِزٌ مَدٌّ وَقَصْرٌ إِنْ فُصِلْ ... كُلٌّ بِكِلْمَةٍ وَهَذَا المُنْفَصِلْ',
    tags: ['مد جائز منفصل', 'صلة كبرى', 'إنا أعطيناك', 'كلمتين', 'الشاطبية']
  },
  {
    id: 'madd_arid_lin',
    title: 'المد العارض للسكون ومد اللين',
    category: 'mudood',
    categoryLabel: 'أحكام المدود',
    condition: 'أن يأتي بعد حرف المد أو حرف اللين حرف متحرك في آخر الكلمة سكن لأجل الوقف عارضاً.',
    ruling: 'جواز مده 2 أو 4 أو 6 حركات وقفاً، ويمد حركتين فقط وصلاً للمد العارض ولا مد في اللين وصلاً.',
    mechanism: 'توسيع زمن حرف المد أو اللين عند الوقف استعانةً بالمد على إتمام سكون الحرف الأخير.',
    examples: [
      { quranText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝', surahInfo: 'الفاتحة: 2', explanation: 'مد عارض للسكون في الياء عند الوقف على النون.' },
      { quranText: 'الرَّحْمَٰنِ الرَّحِيمِ ۝', surahInfo: 'الفاتحة: 3', explanation: 'مد عارض للسكون 2 أو 4 أو 6 حركات.' },
      { quranText: 'مِنْ خَوْفٍ ۝', surahInfo: 'قريش: 4', explanation: 'مد لين عارض في الواو الساكنة المفتوح ما قبلها.' },
      { quranText: 'لِإِيلَافِ قُرَيْشٍ ۝', surahInfo: 'قريش: 1', explanation: 'مد لين عارض في الياء الساكنة المفتوح ما قبلها.' },
    ],
    importantNote: 'قاعدة التسوية: يجب المساواة بين مقادير المدود العارضة في التلاوة الواحدة؛ فلا تقف على كلمة بحركتين وأخرى بأربع وأخرى بست في نفس القراءة.',
    tags: ['مد عارض للسكون', 'مد اللين', 'العالمين', 'خوف', 'قريش', 'وقف']
  },

  // 7. اللامات والراءات
  {
    id: 'lam_shamseeyah_qamareeyah',
    title: 'أحكام لام التعريف (الـ): شمسية وقمرية',
    category: 'lam_raa',
    categoryLabel: 'اللامات والراءات',
    condition: 'لام ساكنة زائدة عن بنية الكلمة تدخل على الأسماء النكرة لتعريفها.',
    letters: 'القمرية في 14 حرفاً: (ابغ حجك وخف عقيمه). والشمسية في 14 حرفاً: (طب ثم صل رحماً تفز...).',
    ruling: 'الإظهار القمري الجلي مع حروف القمرية، والإدغام الشمسي الكامل مع حروف الشمسية.',
    mechanism: 'نطق اللام واضحة ساكنة مع القمرية، وتجاوز اللام وتشديد الحرف الذي يليها مباشرة مع الشمسية.',
    examples: [
      { quranText: 'الْقَمَرُ ۝ الْحَمْدُ ۝ الْعَلِيمُ', explanation: 'لام قمرية مظهرة لوقوعها قبل القاف والحاء والعين.' },
      { quranText: 'الشَّمْسُ ۝ الصَّلَاةُ ۝ الرَّحْمَٰنُ', explanation: 'لام شمسية مدغمة في الشين والصاد والراء.' },
    ],
    importantNote: 'علامة اللام القمرية في المصحف وضع رأس خاء صغيرة (سكون) فوق اللام، بينما الشمسية تكون مجردة من الحركة والحرف بعدها مشدداً.',
    tags: ['لام قمرية', 'لام شمسية', 'ابغ حجك وخف عقيمه', 'إدغام شمسي', 'إظهار قمري']
  },
  {
    id: 'raa_tafkheem_tarqeeq',
    title: 'أحكام الراء تفخيماً وترقيقاً وجواز الوجهين',
    category: 'lam_raa',
    categoryLabel: 'اللامات والراءات',
    condition: 'الأصل في الراء التفخيم إن كانت مفتوحة أو مضمومة، والترقيق إن كانت مكسورة، ولها حالات دقيقة عند سكونها.',
    ruling: 'التفخيم في 8 حالات، الترقيق في 4 حالات، جواز الوجهين في حالتين.',
    mechanism: 'توجيه ضغط الهواء وتصعيد الصوت إلى قبة الحنك الأعلى عند التفخيم، واستفال اللسان عند الترقيق.',
    examples: [
      { quranText: 'تفخيم: ﴿رَبَّنَا﴾ ﴿رُزِقْنَا﴾ ﴿قُرْآنٌ﴾', explanation: 'مفتوحة أو مضمومة أو ساكنة بعد ضم.' },
      { quranText: 'ترقيق: ﴿رِزْقًا﴾ ﴿فِرْعَوْنَ﴾', explanation: 'مكسورة أو ساكنة بعد كسر أصلي.' },
      { quranText: 'جواز الوجهين: ﴿فِرْقٍ﴾ وصلاً', explanation: 'ساكنة بعد كسر وبعدها حرف استعلاء مكسور (والترقيق أرجح).' },
      { quranText: 'جواز الوجهين: ﴿مِصْرَ﴾ ﴿الْقِطْرِ﴾ وقفاً', explanation: 'ساكنة وقبلها حرف استعلاء ساكن قبله كسر (التفخيم أرجح في مصر والترقيق في القطر).' },
    ],
    importantNote: 'إذا سكنت الراء بعد كسر وجاء بعدها حرف استعلاء مفتوح في نفس الكلمة وجب تفخيمها مثل: ﴿قِرْطَاسٍ﴾ و﴿فِرْقَةٍ﴾ و﴿مِرْصَادًا﴾.',
    evidenceMatn: 'وَرَقِّقِ الرَّاءَ إِذَا مَا كُسِرَتْ ... كَذَاكَ بَعْدَ الْكَسْرِ حَيْثُ سَكَنَتْ ... إِنْ لَمْ تَكُنْ مِنْ قَبْلِ حَرْفِ اسْتِعْلاَ ... أَوْ كَانَتِ الكَسْرَةُ لَيْسَتْ أَصْلاَ',
    tags: ['أحكام الراء', 'تفخيم الراء', 'ترقيق الراء', 'جواز الوجهين', 'فرقة قرطاس']
  },

  // 8. الوقف والابتداء
  {
    id: 'waqf_signs',
    title: 'علامات الوقف وضوابطه في المصحف الشريف',
    category: 'waqf_rasm',
    categoryLabel: 'الوقف والابتداء',
    condition: 'رموز اصطلاحية وضعها علماء الضبط القرآني للدلالة على جواز الوقف ومراتبه.',
    ruling: 'اتباع مراد المعنى القرآني وتجنب الوقف القبيح الذي يوهم غير المراد.',
    mechanism: 'قطع الصوت على آخر الكلمة زمناً يتنفس فيه القارئ بنية استئناف القراءة مع تسكين الحرف الأخير.',
    examples: [
      { quranText: '(مـ): الوقف اللازم ﴿إِنَّمَا يَسْتَجِيبُ الَّذِينَ يَسْمَعُونَ ۘ وَالْمَوْتَىٰ يَبْعَثُهُمُ اللَّهُ﴾', explanation: 'وجوب الوقف لئلا يوهم الوصل معنى غير مراد.' },
      { quranText: '(لا): النهي عن الوقف ﴿الَّذِينَ تَتَوَفَّاهُمُ الْمَلَائِكَةُ طَيِّبِينَ ۙ يَقُولُونَ﴾', explanation: 'النهي عن الوقف لتعلق ما بعده به إعراباً ومعنى.' },
      { quranText: '(ج): الوقف الجائز المستوي الطرفين', explanation: 'جواز الوقف والوصل على السواء.' },
      { quranText: '(صلى): الوصل أولى مع جواز الوقف', explanation: 'الوصل أرجح مع صحة المعنى عند الوقف.' },
      { quranText: '(قلى): الوقف أولى مع جواز الوصل', explanation: 'الوقف أرجح لتمام المعنى.' },
      { quranText: '(∴ ∴): تعانق الوقف (المعانقة)', explanation: 'إذا وقفت على الموضع الأول لا تقف على الثاني، كقوله تعالى: ﴿لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ﴾.' },
    ],
    importantNote: 'لا يوجد في القرآن الكريم وقف واجب يأثم القارئ بتركه، ولا حرام يأثم بفعله، إلا ما أفسد المعنى قصداً وعمداً.',
    tags: ['علامات الوقف', 'وقف لازم', 'قلى صلى', 'تعانق الوقف', 'مصحف المدينة']
  },
  {
    id: 'hamzat_wasl_ibtidah',
    title: 'حركات همزة الوصل عند الابتداء بها',
    category: 'waqf_rasm',
    categoryLabel: 'الوقف والابتداء',
    condition: 'همزة تثبت عند الابتداء وتسقط وصلاً، تقع في أول الأسماء والأفعال والحروف.',
    ruling: 'الضم أو الكسر أو الفتح بحسب الكلمة ونوعها.',
    mechanism: '1. في الأفعال: تضم إذا كان ثالث الفعل مضموماً ضماً أصلياً (اُدْعُ، اُخْرُجْ)؛ وتكسر إذا كان ثالثه مفتوحاً (اِذْهَبْ) أو مكسوراً (اِرْجِعْ) أو مضموماً ضماً عارضاً (اِبْنُوا، اِمْشُوا). 2. في الأسماء: تكسر دائماً (اِبْن، اِمْرَأَة، اِسْم، اِثْنَان). 3. في لام التعريف: تفتح دائماً (اَلْحَمْد).',
    examples: [
      { quranText: 'اُدْعُ إِلَىٰ سَبِيلِ رَبِّكَ', surahInfo: 'النحل: 125', explanation: 'ضم همزة الوصل لأن الحرف الثالث (العين) مضموم ضماً أصلياً.' },
      { quranText: 'اِقْرَأْ بِاسْمِ رَبِّكَ', surahInfo: 'العلق: 1', explanation: 'كسر همزة الوصل لأن ثالث الفعل (الراء) مفتوح.' },
      { quranText: 'اِبْنُوا عَلَيْهِم بُنْيَانًا', surahInfo: 'الكهف: 21', explanation: 'كسر همزة الوصل لأن الضمة في النون عارضة والأصل (ابْنِيُوا).' },
    ],
    importantNote: 'الضم العارض يكون في 5 أفعال بالقرآن: (ابْنُوا، امْشُوا، اقْضُوا، ائْتُوا، امْضُوا) وتبدأ فيها جميعاً بالكسر وليس بالضم.',
    evidenceMatn: 'وَابْدَأْ بِهَمْزِ الْوَصْلِ مِنْ فِعْلٍ بِضَمْ ... إِنْ كَانَ ثَالِثٌ مِنَ الْفِعْلِ يُضَمّ ... وَاكْسِرْهُ حَالَ الْكَسْرِ وَالْفَتْحِ وَفِي ... الأَسْمَاءِ غَيْرَ اللاَّمِ كَسْرُهَا وَفِي',
    tags: ['همزة الوصل', 'ابتداء', 'ضم أصلي', 'ضم عارض', 'ادع اذهب']
  }
];

interface RulesCheatSheetProps {
  isOpen?: boolean;
  onClose?: () => void;
  mode?: 'modal' | 'embedded';
  defaultCategory?: string;
}

export const RulesCheatSheet: React.FC<RulesCheatSheetProps> = ({
  isOpen = true,
  onClose,
  mode = 'modal',
  defaultCategory = 'all',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  const categories = useMemo(() => [
    { id: 'all', label: 'جميع الأحكام', icon: '✨' },
    { id: 'sakinan', label: 'التقاء الساكنين', icon: '🔗' },
    { id: 'idgham', label: 'أحكام الإدغام', icon: '🔄' },
    { id: 'makharij_sifaat', label: 'المخارج والصفات', icon: '🎙️' },
    { id: 'noon_tanween', label: 'النون والتنوين', icon: '🌱' },
    { id: 'meem_sakinah', label: 'الميم الساكنة', icon: '💠' },
    { id: 'mudood', label: 'أحكام المدود', icon: '〰️' },
    { id: 'lam_raa', label: 'اللامات والراءات', icon: '⚖️' },
    { id: 'waqf_rasm', label: 'الوقف والرسم', icon: '📜' },
  ], []);

  const filteredRules = useMemo(() => {
    let list = TAJWEED_CHEAT_SHEET_DATA;
    if (selectedCategory !== 'all') {
      list = list.filter((r) => r.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((r) => 
        r.title.toLowerCase().includes(q) ||
        r.condition.toLowerCase().includes(q) ||
        r.mechanism.toLowerCase().includes(q) ||
        (r.letters && r.letters.toLowerCase().includes(q)) ||
        (r.importantNote && r.importantNote.toLowerCase().includes(q)) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        r.examples.some(e => e.quranText.includes(q) || (e.explanation && e.explanation.includes(q)))
      );
    }
    return list;
  }, [selectedCategory, searchTerm]);

  const handleCopyExample = async (rule: TajweedRuleItem, text: string) => {
    try {
      const formatted = `📖 حكم تجويدي: ${rule.title}\nالقاعدة: ${rule.condition}\nالمثال القرآني: ﴿${text}﴾\nمنصة الحقائب التجويدية المعتمدة.`;
      await navigator.clipboard.writeText(formatted);
      setCopiedId(rule.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
      setCopiedId(rule.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const content = (
    <div className="space-y-6 font-tajawal dir-rtl text-slate-800">
      {/* Header & Title Section */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 rounded-3xl p-6 text-white border border-emerald-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-bold font-quran">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>دليل المراجعة السريعة والمطويّة التجويدية المعتمدة</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-quran text-amber-100 tracking-wide">
              مطوية أحكام التجويد السريعة (Rules Cheat Sheet)
            </h1>

            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
              مرجع تفاعلي مركز ومحقق للبحث الفوري عن قواعد التجويد، والشروط والضوابط الدقيقة، ومواضع الرسم العثماني، مع الأمثلة والشواهد لجميع الحقائب التعليمية.
            </p>
          </div>

          {mode === 'modal' && onClose && (
            <button
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-2xl transition-all cursor-pointer shrink-0 border border-slate-700/60"
              title="إغلاق المطوية"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search & Fast Filter Input */}
        <div className="mt-5 relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-amber-400 absolute right-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن أي حكم، أو حرف، أو كلمة قرآنية، أو ضابط تجويدي (مثال: كسر عارض، قطب جد، همزة وصل، إخفاء...)"
              className="w-full bg-slate-900/95 text-white pr-12 pl-12 py-3.5 rounded-2xl border-2 border-emerald-600/70 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 text-xs sm:text-sm shadow-inner placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs / Filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 font-quran">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>تصفية الأحكام حسب الأبواب التجويدية:</span>
          </div>
          <span className="text-xs text-slate-500 font-bold">
            عدد النتائج: <strong className="text-emerald-800 font-sans">{filteredRules.length}</strong> حكم
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-quran whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-amber-300 border-emerald-700 shadow-md scale-102 font-extrabold'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      {filteredRules.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-300 space-y-3">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mx-auto text-xl">
            🔍
          </div>
          <h3 className="font-bold font-quran text-slate-800 text-base">
            لم يتم العثور على أي حكم مطابق لعبارة البحث "{searchTerm}"
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            تأكد من كتابة الكلمات بدقة، أو اختر تصنيفاً آخر، أو اضغط زر مسح البحث لاستعراض جميع الأحكام.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer font-quran"
          >
            استعراض كافة الأحكام
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => {
            const isExpanded = expandedRuleId === rule.id;
            return (
              <div
                key={rule.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Category Chip & Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full font-quran inline-flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-emerald-600" />
                      <span>{rule.categoryLabel}</span>
                    </span>

                    <button
                      onClick={() => handleCopyExample(rule, rule.examples[0]?.quranText || rule.title)}
                      className="text-xs text-slate-500 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
                      title="نسخ ملخص الحكم ومثاله القرآني"
                    >
                      {copiedId === rule.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10px] text-emerald-600 font-bold">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">نسخ</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-extrabold font-quran text-slate-900 leading-snug">
                    {rule.title}
                  </h3>

                  {/* Condition / Rule */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-emerald-800 block mb-0.5 font-quran">الضابط والشرط:</strong>
                    {rule.condition}
                  </div>

                  {/* Letters or Ruling if present */}
                  {rule.letters && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-600">
                      <span className="font-bold text-slate-800 font-quran shrink-0">الحروف المشمولة:</span>
                      <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 font-quran font-bold text-[11px]">
                        {rule.letters}
                      </span>
                    </div>
                  )}

                  {/* Quranic Examples Section */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-600 font-quran block">
                      أمثلة من القرآن الكريم (بالرسم العثماني):
                    </span>
                    <div className="space-y-1.5">
                      {rule.examples.slice(0, isExpanded ? rule.examples.length : 2).map((ex, idx) => (
                        <div
                          key={idx}
                          className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-quran text-sm font-black text-emerald-950 block">
                              ﴿ {ex.quranText} ﴾
                            </span>
                            {ex.explanation && (
                              <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                                {ex.explanation}
                              </span>
                            )}
                          </div>
                          {ex.surahInfo && (
                            <span className="text-[10px] bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full shrink-0 font-quran">
                              {ex.surahInfo}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Section (Important Notes & Matn Evidence) */}
                  {isExpanded && (
                    <div className="pt-2 space-y-2 border-t border-slate-100 animate-fadeIn text-xs">
                      {rule.importantNote && (
                        <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 text-amber-950">
                          <strong className="block font-quran text-amber-900 mb-0.5 font-bold">
                            ⚠️ تنبيه وتوجيه دقيق:
                          </strong>
                          {rule.importantNote}
                        </div>
                      )}

                      {rule.evidenceMatn && (
                        <div className="bg-slate-900 text-amber-200 p-2.5 rounded-xl border border-amber-400/40 font-quran text-center text-xs shadow-inner">
                          <span className="text-[10px] text-slate-400 block mb-1">الشاهد من المتون المنظومة:</span>
                          « {rule.evidenceMatn} »
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 pt-1">
                        {rule.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Expand / Collapse toggle */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                    className="text-emerald-800 hover:text-emerald-950 font-bold font-quran flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>إخفاء التفاصيل والشاهد</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>عرض التنبيهات والشاهد المنظوم ({rule.examples.length} أمثلة)</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-slate-400 font-quran">
                    طريقة النطق: {rule.mechanism.slice(0, 24)}...
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (mode === 'embedded') {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-tajawal dir-rtl no-print animate-fadeIn">
      <div className="bg-slate-50 border border-emerald-700/60 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl overflow-hidden my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        {content}
      </div>
    </div>
  );
};
