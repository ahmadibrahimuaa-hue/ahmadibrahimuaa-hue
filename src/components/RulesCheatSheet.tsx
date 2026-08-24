import React from 'react';
import { Bookmark, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Course } from '../types';

interface RulesCheatSheetProps {
  course?: Course;
}

export const RulesCheatSheet: React.FC<RulesCheatSheetProps> = ({ course }) => {
  const isIdgham = course?.id === 'idgham';
  const topicName = course?.shortTitle || course?.title || 'التقاء الساكنين';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-900 rounded-xl">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-quran text-slate-800">
              قواعد وضوابط سهلة للحفظ والتحصيل في {topicName}
            </h2>
            <p className="text-xs text-slate-500">
              أربـع قواعد ذهبية ومنظومات ميسرة لطلاب المعاهد والكليات لتذكر أحكام وضوابط {topicName}
            </p>
          </div>
        </div>
      </div>

      {/* Golden Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {isIdgham ? (
          <>
            {/* Idgham Rule 1 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-emerald-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-900 text-amber-300 text-xs flex items-center justify-center">1</span>
                <span>القاعدة الأولى: المتماثلان الصغير</span>
              </div>
              <p className="font-quran text-base text-slate-900 bg-amber-50 p-4 rounded-xl border border-amber-200 leading-loose">
                "كل حرفين اتفقا مخرجاً وصفة، وكان الأول منهما ساكناً والثاني متحركاً؛ فيجب إدغامه كاملاً تشديداً خالصاً."
              </p>
              <div className="text-xs text-slate-600 space-y-1 font-tajawal">
                <div className="font-bold text-slate-800">أمثلة سريعة للحفظ:</div>
                <ul className="list-disc pr-5 space-y-0.5">
                  <li>﴿وَقَد دَّخَلُوا﴾ ⇐ (وقَدَّخَلُوا)</li>
                  <li>﴿إِذ ذَّهَبَ﴾ ⇐ (إِذَّهَبَ)</li>
                  <li>﴿يُدْرِككُّمُ﴾ ⇐ (يُدْرِكُّمُ)</li>
                </ul>
              </div>
            </div>

            {/* Idgham Rule 2 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-amber-500 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center">2</span>
                <span>القاعدة الثانية: المتجانسان الصغير</span>
              </div>
              <p className="font-quran text-base text-slate-900 bg-amber-50 p-4 rounded-xl border border-amber-200 leading-loose">
                "كل حرفين اتفقا مخرجاً واختلفا صفة، وكان الأول ساكناً أدغم لحفص في 6 مواضع كاملة وموضع ناقص (الطاء قبل التاء)."
              </p>
              <div className="text-xs text-slate-600 space-y-1 font-tajawal">
                <div className="font-bold text-slate-800">أمثلة سريعة للحفظ:</div>
                <ul className="list-disc pr-5 space-y-0.5">
                  <li>﴿ارْكَب مَّعَنَا﴾ (باء في ميم - كامل)</li>
                  <li>﴿يَلْهَث ذَّلِكَ﴾ (ثاء في ذال - كامل)</li>
                  <li>﴿بَسَطتَ﴾ (طاء في تاء - ناقص مع بقاء الإطباق)</li>
                </ul>
              </div>
            </div>

            {/* Idgham Rule 3 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-purple-900 text-white text-xs flex items-center justify-center">3</span>
                <span>القاعدة الثالثة: المتقاربان الصغير</span>
              </div>
              <p className="font-quran text-base text-slate-900 bg-amber-50 p-4 rounded-xl border border-amber-200 leading-loose">
                "كل حرفين تقاربا مخرجاً وصفة أدغم لحفص في: اللام في الراء، والقاف في الكاف (ألم نخلقكم)، ولام أل الشمسية."
              </p>
              <div className="text-xs text-slate-600 space-y-1 font-tajawal">
                <div className="font-bold text-slate-800">أمثلة سريعة للحفظ:</div>
                <ul className="list-disc pr-5 space-y-0.5">
                  <li>﴿وَقُل رَّبِّ﴾ ⇐ (وَقُرَّبِّ)</li>
                  <li>﴿أَلَمْ نَخْلُقكُّم﴾ (قاف في كاف)</li>
                  <li>﴿الشَّمْسُ﴾ (إدغام لام أل في الشين)</li>
                </ul>
              </div>
            </div>

            {/* Idgham Rule 4 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-rose-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-rose-900 text-white text-xs flex items-center justify-center">4</span>
                <span>القاعدة الرابعة: الاستثناءات والوجوه الجائزة</span>
              </div>
              <p className="font-quran text-base text-slate-900 bg-amber-50 p-4 rounded-xl border border-amber-200 leading-loose">
                "يجب الإظهار لحفص في الفواتح ﴿يس وَالْقُرْآنِ﴾ و﴿ن وَالْقَلَمِ﴾ وصلاً، ويجوز السكت مع الإظهار أو الإدغام في ﴿مَالِيَهْ هَلَكَ﴾."
              </p>
              <div className="text-xs text-slate-600 space-y-1 font-tajawal">
                <div className="font-bold text-slate-800">أمثلة سريعة للحفظ:</div>
                <ul className="list-disc pr-5 space-y-0.5">
                  <li>﴿يس وَالْقُرْآنِ﴾ (إظهار مطلق وصلاً)</li>
                  <li>﴿ن وَالْقَلَمِ﴾ (إظهار مطلق وصلاً)</li>
                  <li>﴿مَالِيَهْ ۝ هَلَكَ﴾ (السكت مع الإظهار وهو المقدم)</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Rule 1 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-emerald-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-900 text-amber-300 text-xs flex items-center justify-center">1</span>
                <span>القاعدة الذهبية الأولى: الأصل هو الكسر</span>
              </div>
              <p className="font-quran text-base text-slate-900 bg-amber-50 p-4 rounded-xl border border-amber-200 leading-loose">
                "الأصل العريض في التخلص من التقاء الساكنين في الحرف الصحيح والتنوين هو التحريك بالكسر العارض."
              </p>
              <div className="text-xs text-slate-600 space-y-1 font-tajawal">
                <div className="font-bold text-slate-800">أمثلة سريعة للحفظ:</div>
                <ul className="list-disc pr-5 space-y-0.5">
                  <li>﴿قُلِ ادْعُوا اللَّهَ﴾ (كسر لام قل)</li>
                  <li>﴿أَنِ اعْبُدُوا اللَّهَ﴾ (كسر نون أن)</li>
                  <li>﴿أَحَدٌ ۝ اللَّهُ﴾ ⇐ (أَحَدُنِ اللَّهُ) (كسر تنوين أحد)</li>
                </ul>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-amber-500 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center">2</span>
                <span>القاعدة الذهبية الثانية: استثناءات الفتح</span>
              </div>
              <p className="font-quran text-base text-slate-900 bg-amber-50 p-4 rounded-xl border border-amber-200 leading-loose">
                "يُفتح الساكن الأول عارضاً للتخفيف في ثلاثة مواضع محصورة: نون (مِنْ) الجارة، تاء الإثنين، وميم آل عمران وصلاً."
              </p>
              <div className="text-xs text-slate-600 space-y-1 font-tajawal">
                <div className="font-bold text-slate-800">أمثلة سريعة للحفظ:</div>
                <ul className="list-disc pr-5 space-y-0.5">
                  <li>﴿وَمِنَ النَّاسِ﴾ (فتح نون مِنْ)</li>
                  <li>﴿قَالَتَا أَتَيْنَا﴾ (فتح التاء لألف الإثنين)</li>
                  <li>﴿الم (1) اللَّهُ﴾ ⇐ (المَ اللَّهُ) وصلاً (فتح ميم آل عمران)</li>
                </ul>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-purple-900 text-white text-xs flex items-center justify-center">3</span>
                <span>القاعدة الذهبية الثالثة: استثناءات الضم</span>
              </div>
              <p className="font-quran text-base text-slate-900 bg-amber-50 p-4 rounded-xl border border-amber-200 leading-loose">
                "يُضم الساكن الأول عارضاً للتجانس في موضعين: واو الجماعة اللينة، وميم الجمع."
              </p>
              <div className="text-xs text-slate-600 space-y-1 font-tajawal">
                <div className="font-bold text-slate-800">أمثلة سريعة للحفظ:</div>
                <ul className="list-disc pr-5 space-y-0.5">
                  <li>﴿وَعَصَوُا الرَّسُولَ﴾ (ضم واو الجماعة اللينة)</li>
                  <li>﴿عَلَيْكُمُ الْقِتَالُ﴾ (ضم ميم الجمع)</li>
                </ul>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-rose-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-rose-900 text-white text-xs flex items-center justify-center">4</span>
                <span>القاعدة الذهبية الرابعة: حذف حروف المد</span>
              </div>
              <p className="font-quran text-base text-slate-900 bg-amber-50 p-4 rounded-xl border border-amber-200 leading-loose">
                "إذا كان الساكن الأول حرف مد (ألف، واو، ياء) يُحذف لفظاً لا خطاً وصلاً للتخلص من التقاء الساكنين."
              </p>
              <div className="text-xs text-slate-600 space-y-1 font-tajawal">
                <div className="font-bold text-slate-800">أمثلة سريعة للحفظ:</div>
                <ul className="list-disc pr-5 space-y-0.5">
                  <li>﴿وَقَالُوا الْحَقَّ﴾ ⇐ تقرأ: (وَقَالُلْ حَقَّ)</li>
                  <li>﴿فِي الْأَرْضِ﴾ ⇐ تقرأ: (فِلَارْضِ)</li>
                  <li>﴿وَقَالَا الْحَمْدُ﴾ ⇐ تقرأ: (وَقَالَلْ حَمْدُ)</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Classical Tajweed Poems Box */}
      <div className={`rounded-2xl p-6 sm:p-8 border shadow-xl space-y-6 text-amber-100 ${
        isIdgham
          ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 border-purple-800'
          : 'bg-emerald-950 border-emerald-800'
      }`}>
        <div className={`flex items-center gap-2 text-amber-400 font-bold text-lg border-b pb-3 ${
          isIdgham ? 'border-purple-800/80' : 'border-emerald-800'
        }`}>
          <Sparkles className="w-6 h-6" />
          <span>المنظومات العلمية الأصيلة (الجزرية، تحفة الأطفال، الشاطبية) في باب {topicName}:</span>
        </div>

        {isIdgham ? (
          <div className="space-y-6">
            {/* Tuhfat Al-Atfal */}
            <div className="bg-purple-900/40 border border-purple-700/60 p-5 rounded-xl space-y-2">
              <div className="text-amber-300 font-bold text-sm flex items-center gap-2 font-tajawal">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>أولاً: من منظومة تحفة الأطفال (للإمام الجمزوري) - باب المثلين والمتقاربين والمتجانسين:</span>
              </div>
              <div className="font-quran text-center text-base sm:text-lg leading-loose text-slate-100 space-y-1">
                <p>إِنْ فِي المَخَارِجِ وَالصِّفَاتِ اتَّفَقَا ... حَرْفَانِ فَالْمِثْلاَنِ فِيهِمَا أَحَقّ</p>
                <p>وَإِنْ يَكُونَا مَخْرَجاً تَقَارَبَا ... وَفِي الصِّفَاتِ اخْتَلَفَا يُلَقَّبَا</p>
                <p>مُتَقَارِبَيْنِ أَوْ يَكُونَا اتَّفَقَا ... فِي مَخْرَجٍ دُونَ الصِّفَاتِ حُقِّقَا</p>
                <p>بِالْمُتَجَانِسَيْنِ ثُمَّ إِنْ سَكَنْ ... أَوَّلُ كُلٍّ فَالصَّغِيرَ سَمِّيَنْ</p>
              </div>
            </div>

            {/* Al-Jazariyya */}
            <div className="bg-emerald-900/50 border border-emerald-800/80 p-5 rounded-xl space-y-2">
              <div className="text-amber-300 font-bold text-sm flex items-center gap-2 font-tajawal">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>ثانياً: من المقدمة الجزرية (للإمام ابن الجزري) - باب الإدغام والتجانس:</span>
              </div>
              <div className="font-quran text-center text-base sm:text-lg leading-loose text-slate-100 space-y-1">
                <p>وَأَوَّلَىْ مِثْلٍ وَجِنْسٍ إنْ سَكَنْ ... أَدْغِمْ كَـ (قُل رَّبِّ) وَ(بَل لَّا) وَأَبِنْ</p>
                <p>فِي (يَوْمِ مَعْ قَالُوا وَهُمْ) وَ(قُلْ نَعَمْ) ... (سَبِّحْهُ) (فَالْتَقَمَهُ) (أَغْلِلْ) (أَطَعْنَا) وَاعْتَصَمْ</p>
                <p>وَبَيِّنِ الإِطْبَاقَ مِنْ (أَحَاطتُّ) مَعْ ... (بَسَطتَ) وَالإِذْلاَقَ كَـ (نَخْلُقكُّمْ) وَقَعْ</p>
              </div>
            </div>

            {/* Al-Shatibiyya */}
            <div className="bg-emerald-900/50 border border-emerald-800/80 p-5 rounded-xl space-y-2">
              <div className="text-amber-300 font-bold text-sm flex items-center gap-2 font-tajawal">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>ثالثاً: من منظومة الشاطبية (حرز الأماني) - باب حروف قربت مخارجها:</span>
              </div>
              <div className="font-quran text-center text-base sm:text-lg leading-loose text-slate-100 space-y-1">
                <p>وَفيِ إِدْغَامِ ذَالِ إِذْ وَدَالِ قَدْ ... وَتَاءِ أَتَتْ مَعْ هَلْ وَبَلْ أُدْغِمَتْ لَدَى</p>
                <p>وَفِي (يَلْهَثْ) بَيَانٌ ثُمَّ (ارْكَبْ مَّعَنَا) شَفَا ... وَفِي (مَالِيَهْ هَلَكَ) السَّكْتُ يُصْطَفَى</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Al-Jazariyya */}
            <div className="bg-emerald-900/50 border border-emerald-800/80 p-5 rounded-xl space-y-2">
              <div className="text-amber-300 font-bold text-sm flex items-center gap-2 font-tajawal">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>أولاً: من المقدمة الجزرية (للإمام ابن الجزري) - باب الساكنين والتحريك:</span>
              </div>
              <div className="font-quran text-center text-base sm:text-lg leading-loose text-slate-100 space-y-1">
                <p>وَوَصْلُ كُلِّ ساكِنَيْنِ يُكْسَرُ ... إلاَّ كَـ (مِنْ) فَالْفَتْحُ فِيهِ يُؤْثَرُ</p>
                <p>وَمِيمُ آلِ عِمْرَانَ افتَحَنَّ مَعْ جَلَا ... وَضُمَّ مِيمَ الجَمْعِ وَالواوَ لِمَنْ تَلَا</p>
                <p>وَإِنْ تَلَا السَّاكِنَ حَرْفُ مَدِّ ... فَاحْذِفْهُ لَفْظاً وصْلاً بِغَيْرِ رَدِّ</p>
              </div>
            </div>

            {/* Tuhfat Al-Atfal & Shatibiyya */}
            <div className="bg-emerald-900/50 border border-emerald-800/80 p-5 rounded-xl space-y-2">
              <div className="text-amber-300 font-bold text-sm flex items-center gap-2 font-tajawal">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>ثانياً: من الشاطبية والمنظومات التجويدية المحررة:</span>
              </div>
              <div className="font-quran text-center text-base sm:text-lg leading-loose text-slate-100 space-y-1">
                <p>وإِنْ يَلْتَقِ السَّاكِنَانِ فِي حَالِ الوَصَلْ ... فَكْسْرُ أَوَّلِ الهِجَاءِ قَدْ نَزَلْ</p>
                <p>إلاَّ بِـ (مِنْ) فَالْفَتْحُ فِيهَا بَيِّنُ ... وَتَاءُ إثْنَيْنِ بِفَتْحٍ تُقْرَنُ</p>
                <p>وَمِيمُ آلِ عِمْرَانَ افْتَحْ وَصْلاَ ... وَالطُّولُ وَالقَصْرُ بِهَا قَدْ حُلاَ</p>
                <p>وَضُمَّ مِيمَ جَمْعِهِمْ وَوَاوَ لِينْ ... لِجَمْعِ مَنْ صَحَّحَهُ المَاهِرُونَ</p>
                <p>وَحَرْفُ مَدٍّ إنْ تَلَاهُ السَّاكِنُ ... يُسْقَطُ لَفْظاً وَهُوَ رَسْماً ثَابِتُ</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
