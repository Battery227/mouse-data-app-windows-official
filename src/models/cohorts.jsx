// Cohort templates define schedule + required event types.
// You can edit/extend these later without rewriting the rest of the app.

export const DRUGS = [
  { value: "6-OHDA", label: "6-OHDA" },
  { value: "Saline", label: "Saline" },
];

export const TEST_TYPES = [
  { value: "RotaRod", label: "RotaRod" },
  { value: "OpenField", label: "Open Field" },
  { value: "NOR_Training", label: "Novel Object Recognition (Training)" },
  { value: "NOR_Test", label: "Novel Object Recognition (Testing)" },
  { value: "ZMT", label: "ZMT" },
  { value: "Sucrose", label: "Sucrose Preference" },
  { value: "TailSuspension", label: "Tail Suspension Test" },
  { value: "CalciumRecording", label: "Calcium Recording" },
  { value: "PIAZA_Sleep", label: "PIAZA Sleep Testing" },
  { value: "Custom", label: "Custom Test" },
];

export const EVENT_TYPES = [
  { value: "CARE", label: "Care (Handling / Feeding / Weight)" },
  { value: "INJECTION", label: "Injection (Virus / Drug)" },
  { value: "TEST", label: "Test / Recording" },
  { value: "KILL", label: "Kill" },
  { value: "NOTE", label: "Note" },
];

export const COHORTS = [
  {
    id: "A",
    name: "Cohort A",
    description: "Virus 21 days early → recover 3 weeks → drug + fiber → recording at 7/14/21 days depending on group → kill.",
    requires: {
      virus: true,
      postDrugCare: true,
    },
    groups: [
      { id: "A_G1", name: "Group 1", recordDay: 7 },
      { id: "A_G2", name: "Group 2", recordDay: 14 },
      { id: "A_G3", name: "Group 3", recordDay: 21 },
    ],
  },
  {
    id: "B",
    name: "Cohort B",
    description: "After drug injection: wait 3/10/17 days → 4 days of testing blocks (includes PIAZA sleep block).",
    requires: {
      virus: false,
      postDrugCare: true,
    },
    groups: [
      { id: "B_G1", name: "3d wait → 4d testing", waitDays: 3, testBlockDays: 4, blockType: "Testing" },
      { id: "B_G2", name: "10d wait → 4d PIAZA sleep", waitDays: 10, testBlockDays: 4, blockType: "PIAZA_Sleep" },
      { id: "B_G3", name: "17d wait → 4d testing", waitDays: 17, testBlockDays: 4, blockType: "Testing" },
    ],
  },
  {
    id: "C",
    name: "Cohort C",
    description: "Behavior after incubation 0/7/14 days. Behavior schedule: Day1 OF+RotaRod, Day2 NOR training, Day3 NOR test, Day4 ZMT, Day5 Sucrose, Day6 TST, Day7 kill.",
    requires: {
      virus: false,
      postDrugCare: false, // still may be used, but not required by template
    },
    groups: [
      { id: "C_G1", name: "0d incubation → behavior", incubationDays: 0 },
      { id: "C_G2", name: "7d incubation → behavior", incubationDays: 7 },
      { id: "C_G3", name: "14d incubation → behavior", incubationDays: 14 },
    ],
    behaviorSchedule: [
      { day: 1, tests: ["OpenField", "RotaRod"] },
      { day: 2, tests: ["NOR_Training"] },
      { day: 3, tests: ["NOR_Test"] },
      { day: 4, tests: ["ZMT"] },
      { day: 5, tests: ["Sucrose"] },
      { day: 6, tests: ["TailSuspension"] },
      { day: 7, tests: ["Kill"] },
    ],
  },
];

export function getCohort(cohortId) {
  return COHORTS.find(c => c.id === cohortId) || COHORTS[0];
}

export function getGroup(cohortId, groupId) {
  const c = getCohort(cohortId);
  return c.groups.find(g => g.id === groupId) || c.groups[0];
}
