import type { LangCode } from "./region-types";
import type { CriticalityTier } from "@/types/incident-json";

export type TranslationKey =
  | "viewCrisisMap"
  | "organizerMap"
  | "gazaView"
  | "ukraineView"
  | "worldMap"
  | "refresh"
  | "home"
  | "crisisMap"
  | "openDetails"
  | "criticality"
  | "critical"
  | "needsSupport"
  | "cleanUp"
  | "hoverHint"
  | "clickHint"
  | "gazaArea"
  | "ukraineArea"
  | "zoomTo"
  | "noIncidents"
  | "incidentsInZone"
  | "zoneSummary"
  | "casualtiesEst"
  | "manpowerNeeded"
  | "mostRecentReport"
  | "offerToHelp"
  | "selectRegion"
  | "selectLanguage"
  | "gazaStrip"
  | "ukraine"
  | "location"
  | "openIncidents"
  | "noOpenIncidents"
  | "heroTitle"
  | "heroSubtitle"
  | "howItWorks"
  | "reportsMap"
  | "reportsMapDesc"
  | "triageVerify"
  | "triageVerifyDesc"
  | "assignTrack"
  | "assignTrackDesc"
  | "footerTagline"
  | "organizerLoginTitle"
  | "organizerLoginDesc"
  | "loginAsOrganizer"
  | "backToHome"
  | "loading"
  | "volunteer"
  | "volunteerSubtitle"
  | "safetyNoticeVolunteer"
  | "yourProfile"
  | "profileCreatedHint"
  | "summary"
  | "timeOfIncident"
  | "sinceIncident"
  | "radiusTriangulated"
  | "verificationInitial"
  | "verificationConfident"
  | "verificationVerified"
  | "posts"
  | "media"
  | "english"
  | "arabic"
  | "ukrainian"
  | "safetyNoticeDefault"
  | "createVolunteerProfile"
  | "createVolunteerHint"
  | "fullName"
  | "email"
  | "phoneOptional"
  | "skills"
  | "skillsHint"
  | "hasVehicle"
  | "availableNow"
  | "canTravelKm"
  | "creating"
  | "createProfile"
  | "backToMap"
  | "sourcePosts"
  | "recentReports"
  | "noReportsYet"
  | "removeIncident"
  | "reportedAt"
  | "injuriesReported"
  | "situationSummary"
  | "sourceExcerpt"
  | "regionSummary"
  | "overallState"
  | "priorityIncidents"
  | "resourceAllocation"
  | "manpowerSummary"
  | "additionalSupport"
  | "noRegionReport"
  | "backToOrganizerMap"
  | "lastUpdated"
  | "none";

const TRANSLATIONS: Record<LangCode, Record<TranslationKey, string>> = {
  en: {
    viewCrisisMap: "View Crisis Map",
    organizerMap: "Organizer Map",
    gazaView: "Gaza view",
    ukraineView: "Ukraine view",
    worldMap: "World map",
    refresh: "Refresh",
    home: "Home",
    crisisMap: "Crisis Map",
    openDetails: "Open details",
    criticality: "Criticality (by time since incident)",
    critical: "Critical",
    needsSupport: "Moderate",
    cleanUp: "Clean Up",
    hoverHint: "Hover a marker for summary",
    clickHint: "Click Open details for full panel",
    gazaArea: "Click the Gaza area or use Gaza view to zoom in",
    ukraineArea: "Click the Ukraine area or use Ukraine view to zoom in",
    zoomTo: "Zoom to",
    noIncidents: "No incidents mapped in this zone.",
    incidentsInZone: "Incidents in this zone",
    zoneSummary: "Zone summary",
    casualtiesEst: "Casualties (est.)",
    manpowerNeeded: "Manpower needed",
    mostRecentReport: "Most recent report",
    offerToHelp: "Offer to help",
    selectRegion: "Select region",
    selectLanguage: "Select language",
    gazaStrip: "Gaza Strip",
    ukraine: "Ukraine",
    location: "Location",
    openIncidents: "Open Incidents",
    noOpenIncidents: "No open incidents",
    heroTitle: "Coordinate relief when it matters most",
    heroSubtitle:
      "AidLink helps local organizers triage emergency reports, verify incidents, and safely assign volunteers during crises—earthquakes, conflict zones, building collapses, and more.",
    howItWorks: "How it works",
    reportsMap: "Reports & Map",
    reportsMapDesc:
      "Emergency reports are ingested and displayed on a live map. Organizers review and verify before acting.",
    triageVerify: "Triage & Verify",
    triageVerifyDesc:
      "Raw data is untrusted until reviewed. Organizers verify incidents, mark duplicates, and prioritize by severity.",
    assignTrack: "Assign & Track",
    assignTrackDesc:
      "Volunteers are assigned by organizers. Check-in codes ensure accurate counts. Safety first—no ad-hoc deployments.",
    footerTagline: "AidLink — Hackathon MVP • Crisis Response Coordination",
    organizerLoginTitle: "Organizer Map",
    organizerLoginDesc:
      "This map is for relief organizers. Log in to manage incidents and volunteers.",
    loginAsOrganizer: "Log in as Organizer (Demo)",
    backToHome: "← Back to home",
    loading: "Loading",
    volunteer: "Volunteer",
    volunteerSubtitle:
      "Create your profile and offer to help at an incident. An organizer will review and may confirm your assignment.",
    safetyNoticeVolunteer:
      "Interested does not mean assigned. An organizer may review and confirm you. Do not enter unsafe zones without authorization.",
    yourProfile: "Your Profile",
    profileCreatedHint:
      "Profile created. You can now offer to help at incidents below.",
    summary: "Summary",
    timeOfIncident: "Time of incident",
    sinceIncident: "since incident",
    radiusTriangulated: "~{n} km radius (triangulated)",
    verificationInitial: "Initial reports",
    verificationConfident: "Confident",
    verificationVerified: "Verified",
    posts: "Posts",
    media: "Media",
    english: "English",
    arabic: "العربية",
    ukrainian: "Українська",
    safetyNoticeDefault:
      "Assignments should be reviewed by organizers. Do not enter unsafe zones without authorization or training.",
    createVolunteerProfile: "Create Volunteer Profile",
    createVolunteerHint: "Your information helps organizers match you with the right tasks.",
    fullName: "Full Name",
    email: "Email",
    phoneOptional: "Phone (optional)",
    skills: "Skills",
    skillsHint: "Select at least one skill",
    hasVehicle: "Has vehicle",
    availableNow: "Available now",
    canTravelKm: "Can travel (km)",
    creating: "Creating...",
    createProfile: "Create Profile",
    backToMap: "← Back to map",
    sourcePosts: "Source posts",
    recentReports: "Recent inbound reports",
    noReportsYet: "No linked social or field reports in the database yet.",
    removeIncident: "Remove Incident",
    reportedAt: "Reported at",
    injuriesReported: "Injuries (reported estimate)",
    situationSummary: "Situation summary",
    sourceExcerpt: "Source excerpt",
    regionSummary: "Region Summary",
    overallState: "Overall State",
    priorityIncidents: "Priority Incidents",
    resourceAllocation: "Resource Allocation",
    manpowerSummary: "Manpower Summary",
    additionalSupport: "Additional Support",
    noRegionReport: "No region report available.",
    backToOrganizerMap: "Back to Organizer Map",
    lastUpdated: "Last updated",
    none: "None",
  },
  ar: {
    viewCrisisMap: "عرض خريطة الأزمات",
    organizerMap: "خريطة المنظمين",
    gazaView: "عرض غزة",
    ukraineView: "عرض أوكرانيا",
    worldMap: "خريطة العالم",
    refresh: "تحديث",
    home: "الرئيسية",
    crisisMap: "خريطة الأزمات",
    openDetails: "فتح التفاصيل",
    criticality: "الحرجة (حسب وقت الحادث)",
    critical: "حرج",
    needsSupport: "متوسط",
    cleanUp: "تنظيف",
    hoverHint: "مرر فوق العلامة للملخص",
    clickHint: "انقر فتح التفاصيل للوحة الكاملة",
    gazaArea: "انقر على منطقة غزة أو استخدم عرض غزة للتكبير",
    ukraineArea: "انقر على منطقة أوكرانيا أو استخدم عرض أوكرانيا للتكبير",
    zoomTo: "تكبير إلى",
    noIncidents: "لا توجد حوادث في هذه المنطقة.",
    incidentsInZone: "الحوادث في هذه المنطقة",
    zoneSummary: "ملخص المنطقة",
    casualtiesEst: "الإصابات (تقدير)",
    manpowerNeeded: "الحاجة إلى القوى العاملة",
    mostRecentReport: "أحدث تقرير",
    offerToHelp: "عرض المساعدة",
    selectRegion: "اختر المنطقة",
    selectLanguage: "اختر اللغة",
    gazaStrip: "قطاع غزة",
    ukraine: "أوكرانيا",
    location: "الموقع",
    openIncidents: "الحوادث المفتوحة",
    noOpenIncidents: "لا توجد حوادث مفتوحة",
    heroTitle: "تنسيق الإغاثة عندما يهم الأمر",
    heroSubtitle:
      "يساعد AidLink المنظمين المحليين في فرز تقارير الطوارئ والتحقق من الحوادث وتعيين المتطوعين بأمان أثناء الأزمات — الزلازل ومناطق النزاعات وانهيارات المباني والمزيد.",
    howItWorks: "كيف يعمل",
    reportsMap: "التقارير والخريطة",
    reportsMapDesc:
      "يتم استلام تقارير الطوارئ وعرضها على خريطة حية. يراجع المنظمون ويتحققون قبل التصرف.",
    triageVerify: "الفرز والتحقق",
    triageVerifyDesc:
      "البيانات الأولية غير موثوقة حتى المراجعة. يتحقق المنظمون من الحوادث ويحددون المكررات ويعطون الأولوية حسب الخطورة.",
    assignTrack: "التعيين والمتابعة",
    assignTrackDesc:
      "يتم تعيين المتطوعين من قبل المنظمين. أكواد تسجيل الدخول تضمن دقة الأرقام. السلامة أولاً.",
    footerTagline: "AidLink — نسخة تجريبية • تنسيق استجابة الأزمات",
    organizerLoginTitle: "خريطة المنظمين",
    organizerLoginDesc:
      "هذه الخريطة لمنظمي الإغاثة. سجّل الدخول لإدارة الحوادث والمتطوعين.",
    loginAsOrganizer: "تسجيل الدخول كمنظم (تجريبي)",
    backToHome: "← العودة للرئيسية",
    loading: "جاري التحميل",
    volunteer: "متطوع",
    volunteerSubtitle:
      "أنشئ ملفك الشخصي واعرض المساعدة في حادثة. سيراجع المنظم وقد يؤكد تعيينك.",
    safetyNoticeVolunteer:
      "الاهتمام لا يعني التعيين. قد يراجع المنظم ويؤكدك. لا تدخل مناطق غير آمنة دون إذن.",
    yourProfile: "ملفك الشخصي",
    profileCreatedHint:
      "تم إنشاء الملف. يمكنك الآن عرض المساعدة في الحوادث أدناه.",
    summary: "ملخص",
    timeOfIncident: "وقت الحادث",
    sinceIncident: "منذ الحادث",
    radiusTriangulated: "نصف قطر ~{n} كم (مثلث)",
    verificationInitial: "تقارير أولية",
    verificationConfident: "واثق",
    verificationVerified: "موثق",
    posts: "منشورات",
    media: "وسائط",
    english: "English",
    arabic: "العربية",
    ukrainian: "Українська",
    safetyNoticeDefault:
      "يجب مراجعة التعيينات من قبل المنظمين. لا تدخل مناطق غير آمنة دون إذن أو تدريب.",
    createVolunteerProfile: "إنشاء ملف متطوع",
    createVolunteerHint: "معلوماتك تساعد المنظمين على مطابقتك بالمهام المناسبة.",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phoneOptional: "الهاتف (اختياري)",
    skills: "المهارات",
    skillsHint: "اختر مهارة واحدة على الأقل",
    hasVehicle: "لديه مركبة",
    availableNow: "متاح الآن",
    canTravelKm: "يمكن السفر (كم)",
    creating: "جاري الإنشاء...",
    createProfile: "إنشاء الملف",
    backToMap: "← العودة للخريطة",
    sourcePosts: "المصادر",
    recentReports: "التقارير الواردة الأخيرة",
    noReportsYet: "لا توجد تقارير مرتبطة في قاعدة البيانات بعد.",
    removeIncident: "إزالة الحادث",
    reportedAt: "تاريخ التقرير",
    injuriesReported: "الإصابات (تقدير التقرير)",
    situationSummary: "ملخص الوضع",
    sourceExcerpt: "مقتطف المصدر",
    regionSummary: "ملخص المنطقة",
    overallState: "الحالة العامة",
    priorityIncidents: "الحوادث ذات الأولوية",
    resourceAllocation: "تخصيص الموارد",
    manpowerSummary: "ملخص القوى العاملة",
    additionalSupport: "الدعم الإضافي",
    noRegionReport: "لا يوجد تقرير للمنطقة.",
    backToOrganizerMap: "العودة لخريطة المنظمين",
    lastUpdated: "آخر تحديث",
    none: "لا شيء",
  },
  uk: {
    viewCrisisMap: "Переглянути карту кризи",
    organizerMap: "Карта організаторів",
    gazaView: "Вигляд Гази",
    ukraineView: "Вигляд України",
    worldMap: "Карта світу",
    refresh: "Оновити",
    home: "Головна",
    crisisMap: "Карта кризи",
    openDetails: "Відкрити деталі",
    criticality: "Критичність (за часом з моменту інциденту)",
    critical: "Критично",
    needsSupport: "Помірний",
    cleanUp: "Завершено",
    hoverHint: "Наведіть на маркер для підсумку",
    clickHint: "Натисніть «Відкрити деталі» для повної панелі",
    gazaArea: "Натисніть на область Гази або використайте вигляд Гази для збільшення",
    ukraineArea: "Натисніть на область України або використайте вигляд України для збільшення",
    zoomTo: "Збільшити до",
    noIncidents: "У цій зоні немає інцидентів.",
    incidentsInZone: "Інциденти в цій зоні",
    zoneSummary: "Підсумок зони",
    casualtiesEst: "Жертви (орієнт.)",
    manpowerNeeded: "Потреба в персоналі",
    mostRecentReport: "Останній звіт",
    offerToHelp: "Пропонувати допомогу",
    selectRegion: "Оберіть регіон",
    selectLanguage: "Оберіть мову",
    gazaStrip: "Сектор Газа",
    ukraine: "Україна",
    location: "Розташування",
    openIncidents: "Відкриті інциденти",
    noOpenIncidents: "Немає відкритих інцидентів",
    heroTitle: "Координуйте допомогу, коли це найважливіше",
    heroSubtitle:
      "AidLink допомагає місцевим організаторам сортувати звіти про надзвичайні ситуації, перевіряти інциденти та безпечно призначати волонтерів під час криз — землетруси, зони конфліктів, обвали будівель тощо.",
    howItWorks: "Як це працює",
    reportsMap: "Звіти та карта",
    reportsMapDesc:
      "Звіти про надзвичайні ситуації надходять і відображаються на живій карті. Організатори переглядають і перевіряють перед діями.",
    triageVerify: "Сортування та перевірка",
    triageVerifyDesc:
      "Сирі дані ненадійні до перегляду. Організатори перевіряють інциденти, позначають дублікати та визначають пріоритети за ступенем важливості.",
    assignTrack: "Призначення та відстеження",
    assignTrackDesc:
      "Волонтерів призначають організатори. Коди реєстрації забезпечують точність підрахунків. Безпека понад усе.",
    footerTagline: "AidLink — Демо версія • Координація реагування на кризи",
    organizerLoginTitle: "Карта організаторів",
    organizerLoginDesc:
      "Ця карта для організаторів допомоги. Увійдіть, щоб керувати інцидентами та волонтерами.",
    loginAsOrganizer: "Увійти як організатор (демо)",
    backToHome: "← На головну",
    loading: "Завантаження",
    volunteer: "Волонтер",
    volunteerSubtitle:
      "Створіть профіль і запропонуйте допомогу при інциденті. Організатор перегляне та може підтвердити ваше призначення.",
    safetyNoticeVolunteer:
      "Зацікавленість не означає призначення. Організатор може переглянути та підтвердити вас. Не заходите в небезпечні зони без дозволу.",
    yourProfile: "Ваш профіль",
    profileCreatedHint:
      "Профіль створено. Тепер ви можете запропонувати допомогу в інцидентах нижче.",
    summary: "Підсумок",
    timeOfIncident: "Час інциденту",
    sinceIncident: "з моменту інциденту",
    radiusTriangulated: "~{n} км радіус (триангуляція)",
    verificationInitial: "Початкові звіти",
    verificationConfident: "Впевнено",
    verificationVerified: "Підтверджено",
    posts: "Пости",
    media: "Медіа",
    english: "English",
    arabic: "العربية",
    ukrainian: "Українська",
    safetyNoticeDefault:
      "Призначення мають переглядати організатори. Не заходите в небезпечні зони без дозволу чи підготовки.",
    createVolunteerProfile: "Створити профіль волонтера",
    createVolunteerHint: "Ваша інформація допомагає організаторам підібрати вам відповідні завдання.",
    fullName: "Повне ім'я",
    email: "Email",
    phoneOptional: "Телефон (необов'язково)",
    skills: "Навички",
    skillsHint: "Виберіть принаймні одну навичку",
    hasVehicle: "Є транспорт",
    availableNow: "Доступний зараз",
    canTravelKm: "Можу поїхати (км)",
    creating: "Створення...",
    createProfile: "Створити профіль",
    backToMap: "← Назад до карти",
    sourcePosts: "Джерела",
    recentReports: "Останні вхідні звіти",
    noReportsYet: "Поки немає пов’язаних звітів у базі даних.",
    removeIncident: "Видалити інцидент",
    reportedAt: "Дата звіту",
    injuriesReported: "Поранення (орієнтовно)",
    situationSummary: "Підсумок ситуації",
    sourceExcerpt: "Витяг з джерела",
    regionSummary: "Підсумок регіону",
    overallState: "Загальний стан",
    priorityIncidents: "Пріоритетні інциденти",
    resourceAllocation: "Розподіл ресурсів",
    manpowerSummary: "Підсумок персоналу",
    additionalSupport: "Додаткова підтримка",
    noRegionReport: "Звіт по регіону відсутній.",
    backToOrganizerMap: "Назад до карти організаторів",
    lastUpdated: "Оновлено",
    none: "Немає",
  },
};

export function t(
  lang: LangCode,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  let str = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}

const CRITICALITY_KEYS: Record<CriticalityTier, TranslationKey> = {
  critical: "critical",
  "needs support": "needsSupport",
  cleanup: "cleanUp",
};

export function getCriticalityLabel(lang: LangCode, tier: CriticalityTier): string {
  return t(lang, CRITICALITY_KEYS[tier]);
}
