export type UserRole = 'admin' | 'academic_officer' | 'teacher';

export type EarlyChildhoodAgeGroup = 
  | 'Toddlers (1.5 - 2.5 yrs)'
  | 'Nursery (2.5 - 3.5 yrs)'
  | 'Pre-Kindergarten (3.5 - 4.5 yrs)'
  | 'Kindergarten 1 (4.5 - 5.5 yrs)'
  | 'Kindergarten 2 (5.5 - 6.5 yrs)';

export type EarlyChildhoodDomain = 
  | 'Language & Early Literacy'
  | 'Mathematics & Logic'
  | 'Sensory & Discovery Science'
  | 'Creative Arts & Music'
  | 'Physical & Motor Skills'
  | 'Social-Emotional Learning'
  | 'Khmer Language & Culture'
  | 'Mandarin Language Immersion';

export type LessonPlanStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'revision_requested';

export interface UserAccount {
  id: string;
  firebaseUid?: string;
  name: string;
  khmerName?: string;
  email: string;
  password?: string;
  avatar: string;
  role: UserRole;
  title: string;
  assignedClassId?: string;
  assignedClassName?: string;
  ageGroup?: EarlyChildhoodAgeGroup;
  phone?: string;
  roomNumber?: string;
  joinedYear?: string;
  bio?: string;
  status?: 'active' | 'suspended';
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: 'CREATE_PLAN' | 'UPDATE_PLAN' | 'SUBMIT_PLAN' | 'APPROVE_PLAN' | 'REVISE_PLAN' | 'DELETE_PLAN' | 'USER_SIGNUP' | 'USER_LOGIN' | 'ROLE_CHANGE' | 'DELETE_USER' | 'ADD_CLASSROOM' | 'UPDATE_CLASSROOM' | 'DELETE_CLASSROOM' | 'UPDATE_SCHOOL_PROFILE' | 'UPDATE_LOGO' | 'RESET_LOGO' | 'FORCE_SYNC' | 'PUSH_LIVE_UPDATE';
  details: string;
  targetId?: string;
}

export interface SchoolProfile {
  schoolNameKhmer: string;
  schoolNameEnglish: string;
  schoolAbbreviation: string;
  taglineKhmer: string;
  taglineEnglish: string;
  portalBadgeText: string;
  customLogoUrl: string | null;
  campus?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  academicYear: string;
  currentTerm: string;
  websiteUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Classroom {
  id: string;
  name: string;
  khmerName: string;
  code: string;
  ageGroup: EarlyChildhoodAgeGroup;
  leadTeacherId: string;
  leadTeacherName: string;
  assistantTeacherName: string;
  enrolledStudents: number;
  capacity: number;
  room: string;
  colorTheme: string;
  currentTheme: string;
}

export interface PlanAttachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'docx' | 'image' | 'xlsx' | 'pptx';
  url?: string;
  uploadedAt: string;
}

export interface LearningCenterItem {
  id: string;
  centerName: string;
  activityDescription: string;
  materials: string;
}

export interface TrilingualFocus {
  englishVocab: string[];
  khmerVocab: string[];
  chineseVocab: string[];
  songOrRhyme: string;
  storyBook: string;
}

export interface AdminReviewFeedback {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  date: string;
  comment: string;
  actionTaken: 'approved' | 'revision_requested' | 'comment_only';
  rubricScores?: {
    curriculumAlignment: number; // 1-5
    trilingualIntegration: number; // 1-5
    sensorySafety: number; // 1-5
    differentiation: number; // 1-5
  };
}

export interface SessionActivityRow {
  id: string;
  topicActivity: string;
  objectives: string;
  materialsSources: string;
  durationMins: number | string;
}

export interface OfficialSessionPlan {
  subject: string;
  activities: SessionActivityRow[];
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  teacherEmail: string;
  classId: string;
  className: string;
  ageGroup: EarlyChildhoodAgeGroup;
  weekNumber: number;
  term: string; // e.g., 'Term 1 - 2026'
  startDate: string;
  endDate: string;
  themeTitle: string;
  themeDescription: string;
  domains: EarlyChildhoodDomain[];
  learningObjectives: string[];
  circleTimeActivities: string;
  learningCenters: LearningCenterItem[];
  outdoorSensoryPlay: string;
  trilingualFocus: TrilingualFocus;
  assessmentMethods: string;
  materialsAndSupplies: string[];
  attachments: PlanAttachment[];
  status: LessonPlanStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  feedbackHistory: AdminReviewFeedback[];

  // Official Dewey Childcare House Format Template Fields
  planDate?: string;
  timeStart?: string;
  timeEnd?: string;
  warmUpCircleTime?: string;
  firstSession?: OfficialSessionPlan;
  secondSession?: OfficialSessionPlan;
  closing?: string;
}

export interface WeeklyComplianceRecord {
  teacherId: string;
  teacherName: string;
  className: string;
  avatar: string;
  status: 'submitted' | 'approved' | 'revision_requested' | 'missing' | 'draft';
  lessonPlanId?: string;
  submissionDate?: string;
}
