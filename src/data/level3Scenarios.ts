
// src/data/level3Scenarios.ts

export interface PuzzlePiece {
  id: string;
  text: string;
  category: "violation" | "action";
  isCorrect: boolean;
}

export interface Scenario {
  title: string;
  description: string;
  pieces: PuzzlePiece[];
}

// Module 1 - Level 3 Scenarios
export const level3ScenariosModule1: Scenario[] = [
  {
    title: "Joint Pain in Both Knees",
    description:
      "A patient complains of joint pain in both knees.",
    pieces: [
      {
        id: "v1",
        text: "Arthralgia (Arthro- = joint, -algia = pain)",
        category: "violation",
        isCorrect: true,
      },
      {
        id: "v2",
        text: "Myalgia",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "v3",
        text: "Neuralgia",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "v4",
        text: "Chondritis",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "a1",
        text: "Identify affected joints",
        category: "action",
        isCorrect: true,
      },
      {
        id: "a2",
        text: "Prescribe antibiotics",
        category: "action",
        isCorrect: false,
      },
      {
        id: "a3",
        text: "Schedule surgery",
        category: "action",
        isCorrect: false,
      },
      {
        id: "a4",
        text: "Recommend imaging",
        category: "action",
        isCorrect: true,
      },
    ],
  },
  {
    title: "Abnormal Liver Enlargement on Ultrasound",
    description:
      "Doctor notes abnormal liver enlargement on ultrasound.",
    pieces: [
      {
        id: "s2v1",
        text: "Hepatomegaly (Hepato- = liver, -megaly = enlargement)",
        category: "violation",
        isCorrect: true,
      },
      {
        id: "s2v2",
        text: "Splenomegaly",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s2v3",
        text: "Hepatitis",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s2v4",
        text: "Nephromegaly",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s2a1",
        text: "Monitor liver function",
        category: "action",
        isCorrect: true,
      },
      {
        id: "s2a2",
        text: "Prescribe antacids",
        category: "action",
        isCorrect: false,
      },
      {
        id: "s2a3",
        text: "Perform ECG",
        category: "action",
        isCorrect: false,
      },
      {
        id: "s2a4",
        text: "Order blood tests",
        category: "action",
        isCorrect: true,
      },
    ],
  },
  {
    title: "Surgical Removal of the Appendix",
    description:
      "Surgical removal of the appendix is planned.",
    pieces: [
      {
        id: "s3v1",
        text: "Appendectomy (-ectomy = surgical removal)",
        category: "violation",
        isCorrect: true,
      },
      {
        id: "s3v2",
        text: "Appendicitis",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s3v3",
        text: "Gastrectomy",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s3a1",
        text: "Schedule appendectomy",
        category: "action",
        isCorrect: true,
      },
      {
        id: "s3a2",
        text: "Prescribe vitamins",
        category: "action",
        isCorrect: false,
      },
      {
        id: "s3a3",
        text: "Ignore symptoms",
        category: "action",
        isCorrect: false,
      },
    ],
  },
];

// Module 2 - Level 3 Scenarios
export const level3ScenariosModule2: Scenario[] = [
  {
    title: "Flu Shot During Annual Wellness Visit",
    description: "Patient receives a flu shot during an annual wellness visit.",
    pieces: [
      { id: "m2s1v1", text: "G0008 (flu shot admin)", category: "violation", isCorrect: true },
      { id: "m2s1v2", text: "G0444", category: "violation", isCorrect: false },
      { id: "m2s1v3", text: "99214", category: "violation", isCorrect: false },
      { id: "m2s1a1", text: "Q2038 (flu vaccine)", category: "action", isCorrect: true },
      { id: "m2s1a2", text: "A0429", category: "action", isCorrect: false },
      { id: "m2s1a3", text: "96372", category: "action", isCorrect: false },
    ],
  },
  {
    title: "New Patient Consultation, 30 Minutes",
    description: "New patient consult, 30-minute duration, moderate complexity.",
    pieces: [
      { id: "m2s2v1", text: "99203", category: "violation", isCorrect: true },
      { id: "m2s2v2", text: "99201", category: "violation", isCorrect: false },
      { id: "m2s2v3", text: "11400", category: "violation", isCorrect: false },
      { id: "m2s2a1", text: "Document moderate complexity", category: "action", isCorrect: true },
      { id: "m2s2a2", text: "Skip patient history", category: "action", isCorrect: false },
      { id: "m2s2a3", text: "Apply anesthesia code", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Established Patient for Minor Procedure",
    description: "Established patient seen for minor procedure with anesthesia.",
    pieces: [
      { id: "m2s3v1", text: "11400", category: "violation", isCorrect: true },
      { id: "m2s3v2", text: "99211", category: "violation", isCorrect: false },
      { id: "m2s3v3", text: "99406", category: "violation", isCorrect: false },
      { id: "m2s3a1", text: "Use minor surgical CPT code", category: "action", isCorrect: true },
      { id: "m2s3a2", text: "Assign HCPCS E/M code", category: "action", isCorrect: false },
      { id: "m2s3a3", text: "Apply inpatient code", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Ambulance Transport for Basic Life Support",
    description: "Ambulance transport required for basic life support.",
    pieces: [
      { id: "m2s4v1", text: "A0429", category: "violation", isCorrect: true },
      { id: "m2s4v2", text: "99284", category: "violation", isCorrect: false },
      { id: "m2s4v3", text: "11400", category: "violation", isCorrect: false },
      { id: "m2s4a1", text: "Include mileage if required", category: "action", isCorrect: true },
      { id: "m2s4a2", text: "Ignore transport service", category: "action", isCorrect: false },
      { id: "m2s4a3", text: "Bill consultation code", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Diabetes Management Follow-up Visit",
    description: "Follow-up visit for diabetes management, moderate MDM.",
    pieces: [
      { id: "m2s5v1", text: "99214", category: "violation", isCorrect: true },
      { id: "m2s5v2", text: "99212", category: "violation", isCorrect: false },
      { id: "m2s5v3", text: "99406", category: "violation", isCorrect: false },
      { id: "m2s5a1", text: "Support MDM with documentation", category: "action", isCorrect: true },
      { id: "m2s5a2", text: "Use inpatient code", category: "action", isCorrect: false },
      { id: "m2s5a3", text: "Omit vitals", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Smoking Cessation Counseling",
    description: "Smoking cessation counseling provided for 10 minutes.",
    pieces: [
      { id: "m2s6v1", text: "99406", category: "violation", isCorrect: true },
      { id: "m2s6v2", text: "99213", category: "violation", isCorrect: false },
      { id: "m2s6v3", text: "99201", category: "violation", isCorrect: false },
      { id: "m2s6a1", text: "Document time and counseling provided", category: "action", isCorrect: true },
      { id: "m2s6a2", text: "Use preventive screening code", category: "action", isCorrect: false },
      { id: "m2s6a3", text: "Apply anesthesia modifier", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Removal of Skin Lesion <0.5 cm on Arm",
    description: "Removal of benign skin lesion less than 0.5 cm on arm.",
    pieces: [
      { id: "m2s7v1", text: "11400", category: "violation", isCorrect: true },
      { id: "m2s7v2", text: "96372", category: "violation", isCorrect: false },
      { id: "m2s7v3", text: "99214", category: "violation", isCorrect: false },
      { id: "m2s7a1", text: "Verify lesion size and location", category: "action", isCorrect: true },
      { id: "m2s7a2", text: "Use psychiatric evaluation code", category: "action", isCorrect: false },
      { id: "m2s7a3", text: "Apply emergency code", category: "action", isCorrect: false },
    ],
  },
  {
    title: "In-Office Injectable Medication Administration",
    description: "Administration of injectable medication in-office.",
    pieces: [
      { id: "m2s8v1", text: "96372", category: "violation", isCorrect: true },
      { id: "m2s8v2", text: "G0008", category: "violation", isCorrect: false },
      { id: "m2s8v3", text: "11400", category: "violation", isCorrect: false },
      { id: "m2s8a1", text: "Document drug, route, and site", category: "action", isCorrect: true },
      { id: "m2s8a2", text: "Skip documentation", category: "action", isCorrect: false },
      { id: "m2s8a3", text: "Use inpatient infusion code", category: "action", isCorrect: false },
    ],
  },
];




// Module 3 - Level 3 Scenarios
export const level3ScenariosModule3: Scenario[] = [
  {
    title: "Backdated Entry by Technician",
    description: "A technician backdates an entry to make it look like it was recorded earlier.",
    pieces: [
      { id: "m3s1v1", text: "Contemporaneous", category: "violation", isCorrect: true },
      { id: "m3s1v2", text: "Accurate", category: "violation", isCorrect: false },
      { id: "m3s1v3", text: "Original", category: "violation", isCorrect: false },
      { id: "m3s1a1", text: "Record data at the time of activity", category: "action", isCorrect: true },
      { id: "m3s1a2", text: "Add duplicate entry", category: "action", isCorrect: false },
      { id: "m3s1a3", text: "Remove old record", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Logbook Entry Scratched Out",
    description: "A logbook has two entries, one of which is completely scratched out with no initials.",
    pieces: [
      { id: "m3s2v1", text: "Improper Error Correction", category: "violation", isCorrect: true },
      { id: "m3s2v2", text: "Missing Signature", category: "violation", isCorrect: false },
      { id: "m3s2v3", text: "Data Retention Violation", category: "violation", isCorrect: false },
      { id: "m3s2a1", text: "Use single-line strike-through with initials & date", category: "action", isCorrect: true },
      { id: "m3s2a2", text: "Use white ink", category: "action", isCorrect: false },
      { id: "m3s2a3", text: "Delete the entry", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Colleague's Password Used for Login",
    description: "A user logs into the software using their colleague's password to enter values.",
    pieces: [
      { id: "m3s3v1", text: "Attributable", category: "violation", isCorrect: true },
      { id: "m3s3v2", text: "Legible", category: "violation", isCorrect: false },
      { id: "m3s3v3", text: "Timely", category: "violation", isCorrect: false },
      { id: "m3s3a1", text: "Ensure unique login for each user", category: "action", isCorrect: true },
      { id: "m3s3a2", text: "Disable password requirements", category: "action", isCorrect: false },
      { id: "m3s3a3", text: "Re-enter data manually", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Batch Number Missing in Cleaning Records",
    description: "Cleaning records are signed, but the batch number of the cleaning agent is missing.",
    pieces: [
      { id: "m3s4v1", text: "Incomplete Record", category: "violation", isCorrect: true },
      { id: "m3s4v2", text: "Unauthorized Access", category: "violation", isCorrect: false },
      { id: "m3s4v3", text: "Deviation Not Filed", category: "violation", isCorrect: false },
      { id: "m3s4a1", text: "Add note referencing batch number, assess if re-cleaning needed", category: "action", isCorrect: true },
      { id: "m3s4a2", text: "Ignore missing info", category: "action", isCorrect: false },
      { id: "m3s4a3", text: "Shred the form", category: "action", isCorrect: false },
    ],
  },
  {
    title: "System Audit Trail for pH Data",
    description: "A system automatically logs pH data changes with user and timestamp.",
    pieces: [
      { id: "m3s5v1", text: "Audit Trail", category: "violation", isCorrect: true },
      { id: "m3s5v2", text: "Manual Log", category: "violation", isCorrect: false },
      { id: "m3s5v3", text: "Real-time Editing", category: "violation", isCorrect: false },
      { id: "m3s5a1", text: "Data Integrity", category: "action", isCorrect: true },
      { id: "m3s5a2", text: "Training SOP", category: "action", isCorrect: false },
      { id: "m3s5a3", text: "Equipment Qualification", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Streptococcal Bacterial Pneumonia Diagnosis",
    description: "A patient is diagnosed with bacterial pneumonia due to streptococcus.",
    pieces: [
      { id: "m3s6v1", text: "Use Additional Code", category: "violation", isCorrect: true },
      { id: "m3s6v2", text: "Bill only primary condition", category: "violation", isCorrect: false },
      { id: "m3s6v3", text: "Skip organism coding", category: "violation", isCorrect: false },
      { id: "m3s6a1", text: "Use combination code if available", category: "action", isCorrect: true },
      { id: "m3s6a2", text: "Apply modifier -25", category: "action", isCorrect: false },
      { id: "m3s6a3", text: "Code only streptococcus", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Left Radius Fracture, Initial Encounter",
    description: "Code S52.521 listed for a displaced fracture of the left radius; provider notes initial encounter.",
    pieces: [
      { id: "m3s7v1", text: "7th character 'A' for initial encounter", category: "violation", isCorrect: true },
      { id: "m3s7v2", text: "7th character 'D'", category: "violation", isCorrect: false },
      { id: "m3s7v3", text: "No 7th character needed", category: "violation", isCorrect: false },
      { id: "m3s7a1", text: "Apply correct 7th character to code", category: "action", isCorrect: true },
      { id: "m3s7a2", text: "Leave code as is", category: "action", isCorrect: false },
      { id: "m3s7a3", text: "Use unspecified fracture code", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Diabetes with Diabetic Nephropathy",
    description: "Diagnosis listed as Type 2 Diabetes with diabetic nephropathy.",
    pieces: [
      { id: "m3s8v1", text: "Combination code E11.2-", category: "violation", isCorrect: true },
      { id: "m3s8v2", text: "Separate codes for diabetes and nephropathy", category: "violation", isCorrect: false },
      { id: "m3s8v3", text: "Nephropathy only", category: "violation", isCorrect: false },
      { id: "m3s8a1", text: "Follow ICD-10 combo coding rule", category: "action", isCorrect: true },
      { id: "m3s8a2", text: "Use hypertension code instead", category: "action", isCorrect: false },
      { id: "m3s8a3", text: "Skip kidney complication", category: "action", isCorrect: false },
    ],
  },
];


export const level3ScenariosModule4: Scenario[] = [
  {
    title: "Colonoscopy with Biopsy",
    description: "A physician performs a colonoscopy with biopsy.",
    pieces: [
      { id: "m4s1v1", text: "Report CPT code for colonoscopy with biopsy", category: "violation", isCorrect: true },
      { id: "m4s1v2", text: "Code colonoscopy and biopsy separately", category: "violation", isCorrect: true },
      { id: "m4s1v3", text: "Use HCPCS vaccine code", category: "violation", isCorrect: false },
      { id: "m4s1a1", text: "Use CPT digestive section code including biopsy", category: "action", isCorrect: true },
      { id: "m4s1a2", text: "Avoid unbundling procedures", category: "action", isCorrect: true },
      { id: "m4s1a3", text: "Verify procedure details in operative note", category: "action", isCorrect: true },
      { id: "m4s1a4", text: "Submit two codes with modifier 59", category: "action", isCorrect: false },
    ],
  },
  {
    title: "E/M and Minor Procedure Same Day",
    description: "An E/M service was provided along with a minor surgical procedure on the same day.",
    pieces: [
      { id: "m4s2v1", text: "Missing Modifier 25", category: "violation", isCorrect: true },
      { id: "m4s2v2", text: "Incorrect E/M Level", category: "violation", isCorrect: false },
      { id: "m4s2v3", text: "Overdocumentation", category: "violation", isCorrect: true },
      { id: "m4s2a1", text: "Apply Modifier 25 to E/M code", category: "action", isCorrect: true },
      { id: "m4s2a2", text: "Ensure documentation supports separate service", category: "action", isCorrect: true },
      { id: "m4s2a3", text: "Avoid duplicate reporting of procedure", category: "action", isCorrect: true },
      { id: "m4s2a4", text: "Use Modifier 51 instead of 25", category: "action", isCorrect: false },
    ],
  },
  {
    title: "Flu Vaccine Coding",
    description: "A patient receives a flu vaccine in an outpatient clinic.",
    pieces: [
      { id: "m4s3v1", text: "Incorrect use of CPT for vaccine", category: "violation", isCorrect: true },
      { id: "m4s3v2", text: "Missing administration code", category: "violation", isCorrect: true },
      { id: "m4s3v3", text: "Incorrect diagnosis linkage", category: "violation", isCorrect: false },
      { id: "m4s3a1", text: "Use HCPCS code like Q2037 for vaccine", category: "action", isCorrect: true },
      { id: "m4s3a2", text: "Use CPT code like 90471 for administration", category: "action", isCorrect: true },
      { id: "m4s3a3", text: "Verify route and site of administration", category: "action", isCorrect: true },
      { id: "m4s3a4", text: "Only report administration code", category: "action", isCorrect: false },
    ],
  },
  {
    title: "MRI Interpretation by Radiologist",
    description: "A radiologist interprets an MRI scan ordered by another physician.",
    pieces: [
      { id: "m4s4v1", text: "Missing Modifier 26", category: "violation", isCorrect: true },
      { id: "m4s4v2", text: "Use of global code for interpretation only", category: "violation", isCorrect: true },
      { id: "m4s4v3", text: "Improper order documentation", category: "violation", isCorrect: false },
      { id: "m4s4a1", text: "Use Modifier 26 for professional component", category: "action", isCorrect: true },
      { id: "m4s4a2", text: "Ensure order and report linkage", category: "action", isCorrect: true },
      { id: "m4s4a3", text: "Avoid billing for technical component", category: "action", isCorrect: true },
      { id: "m4s4a4", text: "Apply Modifier 51", category: "action", isCorrect: false },
    ],
  },
];


// Default export for backward compatibility (Module 1 scenarios)
export const level3Scenarios = level3ScenariosModule1;
export default level3Scenarios;

/**
 * Utility to get Level 3 scenarios by module number.
 * @param moduleNumber 1 or 2
 */
export function getLevel3ScenariosByModule(moduleNumber: number): Scenario[] {
  if (moduleNumber === 3) return level3ScenariosModule3;
  if (moduleNumber === 2) return level3ScenariosModule2;
  return level3ScenariosModule1;
}

// Usage example for Module 2 - Level 3 Scenarios:
// import { getLevel3ScenariosByModule } from 'src/data/level3Scenarios';
// const scenarios = getLevel3ScenariosByModule(2);
