export type TabParamList = {
  Today: undefined;
  Programs: undefined;
  Ranks: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  // Optional nested-screen param so callers pushed on top of the tab
  // navigator (e.g. TemplateDetail) can land on a specific tab — e.g.
  // navigate("Tabs", { screen: "Today" }) — instead of whichever tab
  // was last active.
  Tabs: { screen?: keyof TabParamList } | undefined;
  Login: undefined;
  // Everything the detail screen needs to run a task end-to-end without a
  // refetch — a today's-tasks row is small, so passing it whole is simpler
  // than re-deriving it from just an id (see ProofSubmission/index.tsx).
  ProofSubmission: {
    programId: string;
    templateBlockId: string;
    scheduledDate: string;
    label: string;
    task: string;
    proofType: import("./database").ProofType;
    xpValue: number;
    targetDurationMinutes: number | null;
    // Needed to know when today's *last* remaining block just got
    // completed (streak rollup rule — see applyTaskCompletionRollup).
    totalBlocksToday: number;
  };
  AccountProfile: undefined;
  TemplateDetail: { templateId?: string };
  CustomBuilder: undefined;
};
