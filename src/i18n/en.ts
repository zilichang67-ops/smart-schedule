export type Locale = "en" | "zh" | "hi" | "es";
export type UserRole = "student" | "worker";

export interface Translations {
  // Header
  today: string;
  week: string;
  day: string;
  month: string;
  groups: string;
  reminders: string;
  sleep: string;
  profile: string;
  signOut: string;
  clearAll: string;
  delete: string;
  selected: string;

  // Dashboard
  smartSchedule: string;
  noActivities: string;
  noActivitiesForDay: string;
  noUnscheduled: string;
  noUnscheduledItems: string;
  generateSchedule: string;
  parseNotes: string;
  quickAdd: string;
  dailyNotes: string;
  dailyNotesPlaceholder: string;
  tryExample: string;
  parsing: string;

  // Timeline
  recurring: string;

  // Unscheduled Pool
  unscheduled: string;
  all: string;
  general: string;
  thisWeek: string;
  thisMonth: string;
  customRange: string;
  noGeneralItems: string;
  noItemsThisWeek: string;
  noItemsForMonth: string;
  noItemsInRange: string;
  nextWeeks: string;

  // Chat
  aiAssistant: string;
  chatPlaceholder: string;
  fixPlaceholder: string;
  thinking: string;
  welcomeMessage: string;

  // Modal
  editActivity: string;
  title: string;
  date: string;
  scheduled: string;
  unscheduledLabel: string;
  startTime: string;
  endTime: string;
  repeat: string;
  notes: string;
  cancel: string;
  save: string;
  never: string;
  everyDay: string;
  everyWeekday: string;
  weekly: string;
  monWedFri: string;
  tueThu: string;

  // Conflict
  timeConflict: string;
  conflictDesc: string;
  keepBoth: string;
  deleteExisting: string;

  // Toasts
  deleted: string;
  scheduled_: string;
  profileSaved: string;
  passwordUpdated: string;
  activities: string;

  // Auth
  welcomeBack: string;
  createAccount: string;
  signInDesc: string;
  signUpDesc: string;
  email: string;
  password: string;
  signIn: string;
  signUp: string;
  loading: string;
  noAccount: string;
  hasAccount: string;

  // Groups
  activityGroups: string;
  newGroupName: string;
  noGroups: string;
  noParent: string;

  // Sleep
  sleepHours: string;
  hideSleepBlock: string;
  sleepDesc: string;
  sleepStarts: string;
  wakeUp: string;
  resetDefault: string;

  // Profile
  displayName: string;
  appearance: string;
  appearanceDesc: string;
  dark: string;
  light: string;
  system: string;
  sceneColor: string;
  sceneDesc: string;
  changePassword: string;
  newPassword: string;
  confirmPassword: string;
  updatePassword: string;
  saveProfile: string;

  // Role
  profileRole: string;
  student: string;
  worker: string;
  studentDesc: string;
  workerDesc: string;

  // Forgot password
  forgotPassword: string;
  resetPassword: string;
  resetPasswordDesc: string;
  resetLinkSent: string;
  backToSignIn: string;
  enterNewPassword: string;
  confirmNewPassword: string;
  updateMyPassword: string;
  passwordUpdatedLogin: string;
  invalidResetLink: string;

  // Role-based AI hints
  aiHintStudent: string;
  aiHintWorker: string;
}

export const en: Translations = {
  today: "Today",
  week: "Week",
  day: "Day",
  month: "Month",
  groups: "Groups",
  reminders: "Reminders",
  sleep: "Sleep",
  profile: "Profile",
  signOut: "Sign Out",
  clearAll: "Clear All",
  delete: "Delete",
  selected: "selected",

  smartSchedule: "Smart Schedule",
  noActivities: "No activities yet",
  noActivitiesForDay: "No activities for this day",
  noUnscheduled: "No unscheduled items",
  noUnscheduledItems: "No unscheduled items",
  generateSchedule: "Generate Schedule",
  parseNotes: "Parse Notes",
  quickAdd: "Quick Add",
  dailyNotes: "Daily Notes",
  dailyNotesPlaceholder: "Paste your messy daily notes here...",
  tryExample: "Try example notes",
  parsing: "Parsing...",

  recurring: "recurring",

  unscheduled: "Unscheduled",
  all: "All",
  general: "General",
  thisWeek: "Week",
  thisMonth: "Month",
  customRange: "Range",
  noGeneralItems: "No general items",
  noItemsThisWeek: "No items this week",
  noItemsForMonth: "No items for this month",
  noItemsInRange: "No items in this range",
  nextWeeks: "Next",

  aiAssistant: "AI Scheduling Assistant",
  chatPlaceholder: "e.g. Delete all for Friday",
  fixPlaceholder: "Fix",
  thinking: "Thinking...",
  welcomeMessage: "Hey! I'm your schedule assistant. Tell me about your activities, or ask me to modify, delete, or schedule unscheduled items.",

  editActivity: "Edit Activity",
  title: "Title",
  date: "Date",
  scheduled: "Scheduled",
  unscheduledLabel: "Unscheduled",
  startTime: "Start Time",
  endTime: "End Time",
  repeat: "Repeat",
  notes: "Notes",
  cancel: "Cancel",
  save: "Save",
  never: "Never",
  everyDay: "Every day",
  everyWeekday: "Every weekday",
  weekly: "Weekly (same day)",
  monWedFri: "Mon, Wed, Fri",
  tueThu: "Tue, Thu",

  timeConflict: "Time Conflict",
  conflictDesc: "This activity overlaps with an existing event. What would you like to do?",
  keepBoth: "Keep Both Activities",
  deleteExisting: "Delete Existing & Add New",

  deleted: "Deleted",
  scheduled_: "Scheduled",
  profileSaved: "Profile saved!",
  passwordUpdated: "Password updated!",
  activities: "activities",

  welcomeBack: "Welcome back",
  createAccount: "Create your account",
  signInDesc: "Sign in to access your schedule",
  signUpDesc: "Sign up to start organizing your day",
  email: "Email",
  password: "Password",
  signIn: "Sign In",
  signUp: "Sign Up",
  loading: "Loading...",
  noAccount: "Don't have an account?",
  hasAccount: "Already have an account?",

  activityGroups: "Activity Groups",
  newGroupName: "New group name",
  noGroups: "No groups yet. Create one above.",
  noParent: "No parent (top-level)",

  sleepHours: "Sleep Hours",
  hideSleepBlock: "Hide sleep time block",
  sleepDesc: "Activities during sleep hours won't appear on your calendar.",
  sleepStarts: "Sleep starts",
  wakeUp: "Wake up",
  resetDefault: "Reset to 22:00–06:00",

  displayName: "Display Name",
  appearance: "Appearance",
  appearanceDesc: "Switch between dark and light mode",
  dark: "Dark",
  light: "Light",
  system: "System",
  sceneColor: "Scene Color Theme",
  sceneDesc: "Changes the accent color across the app",
  changePassword: "Change Password",
  newPassword: "New password",
  confirmPassword: "Confirm password",
  updatePassword: "Update Password",
  saveProfile: "Save Profile",

  // Role
  profileRole: "Profile Role",
  student: "Student",
  worker: "Worker / Professional",
  studentDesc: "Optimized for classes, homework, and study schedules",
  workerDesc: "Optimized for meetings, projects, and deep work blocks",

  // Forgot password
  forgotPassword: "Forgot Password?",
  resetPassword: "Reset Password",
  resetPasswordDesc: "Enter your email and we'll send you a reset link",
  resetLinkSent: "Reset link sent! Please check your inbox.",
  backToSignIn: "Back to Sign In",
  enterNewPassword: "Enter New Password",
  confirmNewPassword: "Confirm New Password",
  updateMyPassword: "Update My Password",
  passwordUpdatedLogin: "Password updated! Please sign in.",
  invalidResetLink: "Invalid or expired reset link. Please request a new one.",

  // Role-based AI hints
  aiHintStudent: "e.g. Math homework at 4pm, study for chemistry exam",
  aiHintWorker: "e.g. Team standup at 10am, deep work block 2-4pm",
};
