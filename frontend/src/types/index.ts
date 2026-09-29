// ============================================================
// Smart City Site Planner — TypeScript Types
// ============================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Project {
  id: string;
  user_id?: string;
  name: string;
  city?: string;
  state?: string;
  location_name?: string;
  site_area_km2: number;
  coordinates?: { lat: number; lng: number; zoom?: number };
  description?: string;
  planning_org?: string;
  stage: ProjectStage;
  is_demo: boolean;
  schema_version: number;
  created_at: string;
  updated_at: string;
}

export type ProjectStage =
  | 'setup' | 'site' | 'problems' | 'objectives'
  | 'forma_workflow' | 'proposals' | 'analyses'
  | 'comparison' | 'forma_board' | 'revit'
  | 'final' | 'presentation' | 'complete';

export interface SiteInfo {
  project_id: string;
  boundary_coords?: [number, number][];
  site_limits_done: boolean;
  landscaping_done: boolean;
  buildings_done: boolean;
  transportation_done: boolean;
  context_notes?: string;
  local_context?: string;
  updated_at?: string;
}

export interface LocalProblem {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  category: ProblemCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  notes?: string;
  created_at?: string;
}

export type ProblemCategory =
  | 'mobility' | 'environment' | 'infrastructure'
  | 'social' | 'economic' | 'health' | 'other';

export interface DataSource {
  id: string;
  project_id: string;
  name: string;
  url?: string;
  description?: string;
  date_accessed?: string;
  geographic_scope?: string;
  notes?: string;
  created_at?: string;
}

export interface Objective {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  target?: string;
  rationale?: string;
  status: 'active' | 'achieved' | 'deferred';
  created_at?: string;
}

export interface Proposal {
  id: string;
  project_id: string;
  label: '1' | '2' | 'A' | 'B';
  name?: string;
  concept?: string;
  description?: string;
  planning_strategy?: string;
  transportation?: string;
  buildings?: string;
  landscaping?: string;
  density?: string;
  advantages?: string;
  tradeoffs?: string;
  notes?: string;
  status: 'draft' | 'complete';
  metrics: ProposalMetric[];
  images: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ProposalMetric {
  label: string;
  value: string;
  unit?: string;
}

export type AnalysisType =
  | 'area_metrics' | 'embodied_carbon' | 'sun_hours'
  | 'daylight' | 'wind' | 'microclimate' | 'noise' | 'solar_energy';

export type AnalysisStatus =
  | 'not_started'
  | 'evidence_required'
  | 'uploaded'
  | 'actual_forma_result'
  | 'user_entered'
  | 'documented_assumption'
  | 'reference'
  | 'source_data';

export type AnalysisProvenance =
  | 'forma' | 'user' | 'assumption' | 'reference' | 'source_data';

export interface Analysis {
  id: string;
  project_id: string;
  proposal_id: string;
  analysis_type: AnalysisType;
  finding?: string;
  design_response?: string;
  result_value?: string;
  result_unit?: string;
  status: AnalysisStatus;
  provenance: AnalysisProvenance;
  evidence_image_path?: string;
  source?: string;
  notes?: string;
  updated_at?: string;
}

export interface FormaWorkflowStep {
  id: string;
  project_id: string;
  step_index: number;
  step_name: string;
  step_description?: string;
  status: 'pending' | 'in_progress' | 'complete';
  notes?: string;
  evidence_path?: string;
  updated_at?: string;
}

export interface RevitWorkflow {
  project_id: string;
  building_name?: string;
  building_role?: string;
  forma_ref?: string;
  revit_ref?: string;
  export_status: WorkflowStatus;
  sync_status: WorkflowStatus;
  detailing_done: boolean;
  analysis_rerun: boolean;
  before_image?: string;
  after_image?: string;
  floor_plan_image?: string;
  model_3d_image?: string;
  facade_image?: string;
  notes?: string;
  updated_at?: string;
}

export type WorkflowStatus = 'pending' | 'in_progress' | 'complete';

export interface FormaBoardFrame {
  id: string;
  project_id: string;
  frame_index: number;
  frame_title: string;
  description?: string;
  image_paths: string[];
  metric_tags: string[];
  decision_notes?: string;
  notes?: string;
  updated_at?: string;
}

export interface FinalConcept {
  project_id: string;
  selected_proposal?: '1' | '2' | 'A' | 'B' | 'hybrid';
  rationale?: string;
  key_evidence?: string;
  tradeoffs?: string;
  planning_priorities?: string;
  notes?: string;
  updated_at?: string;
}

export interface PresentationSlide {
  id: string;
  project_id: string;
  slide_index: number;
  title: string;
  content_notes?: string;
  image_paths: string[];
  metrics: string[];
  status: 'empty' | 'draft' | 'complete';
  updated_at?: string;
}

export interface Walkthrough {
  project_id: string;
  video_path?: string;
  video_url?: string;
  thumbnail_path?: string;
  description?: string;
  sequence_notes?: string;
  updated_at?: string;
}

export interface TeamMember {
  id: string;
  project_id: string;
  name: string;
  role?: string;
  module?: string;
  responsibilities?: string;
  evidence?: string;
  created_at?: string;
}

export type ChecklistStatus = 'pending' | 'in_progress' | 'complete';

export interface ChecklistItem {
  project_id: string;
  item_key: string;
  status: ChecklistStatus;
  notes?: string;
  updated_at?: string;
}

export interface ReadinessReport {
  items: Record<string, boolean>;
  score: number;
  passed: number;
  total: number;
}

// ── UI State ──

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type ApiResponse<T> = {
  ok: true;
  data: T;
} | {
  ok: false;
  error: string;
};

// ── Label maps ──

export const ANALYSIS_LABELS: Record<AnalysisType, string> = {
  area_metrics: 'Area Metrics',
  embodied_carbon: 'Embodied Carbon',
  sun_hours: 'Sun Hours',
  daylight: 'Daylight Potential',
  wind: 'Wind Analysis',
  microclimate: 'Microclimate Analysis',
  noise: 'Noise Analysis',
  solar_energy: 'Solar Energy',
};

export const ANALYSIS_STATUS_LABELS: Record<AnalysisStatus, string> = {
  not_started: 'Not Started',
  evidence_required: 'Evidence Required',
  uploaded: 'Evidence Uploaded',
  actual_forma_result: 'Actual Forma Result',
  user_entered: 'User Entered Result',
  documented_assumption: 'Documented Assumption',
  reference: 'Reference',
  source_data: 'Source Data',
};

export const PROVENANCE_LABELS: Record<AnalysisProvenance, string> = {
  forma: 'Actual Forma Result',
  user: 'User Entered Result',
  assumption: 'Documented Assumption',
  reference: 'Reference Data',
  source_data: 'Source Data',
};

export const PROBLEM_CATEGORY_LABELS: Record<ProblemCategory, string> = {
  mobility: 'Mobility',
  environment: 'Environment',
  infrastructure: 'Infrastructure',
  social: 'Social',
  economic: 'Economic',
  health: 'Health',
  other: 'Other',
};

export const SIH_CHECKLIST_LABELS: Record<string, string> = {
  site_area_1km2: 'Site area ≥ 1.0 km² (1,000,000 m²) verified',
  site_boundary_polygon: 'Site boundary polygon defined and documented',
  site_context_analysis: 'Site context analysis completed (1 km radius)',
  local_problems_documented: 'Minimum 5 local urban problems documented',
  problem_evidence_sources: 'Evidence sources cited for each problem',
  objectives_defined: 'Planning objectives defined with measurable targets',
  design_option_1_concept: 'Design Option 1 concept and massing documented',
  design_option_2_concept: 'Design Option 2 concept and massing documented',
  option_1_metrics: 'Option 1 quantitative metrics captured (GFA, density, etc.)',
  option_2_metrics: 'Option 2 quantitative metrics captured',
  forma_sun_hours: 'Autodesk Forma sun hours analysis run for both options',
  forma_daylight: 'Autodesk Forma daylight analysis run for both options',
  forma_wind: 'Autodesk Forma wind analysis run for both options',
  forma_microclimate: 'Autodesk Forma microclimate analysis run for both options',
  forma_embodied_carbon: 'Autodesk Forma embodied carbon analysis run for both options',
  forma_area_metrics: 'Autodesk Forma area metrics captured for both options',
  comparison_completed: 'Comparative analysis table completed (Option 1 vs 2)',
  final_concept_selected: 'Final concept selected with documented rationale',
  final_concept_evidence: 'Key evidence and tradeoffs documented for final concept',
  revit_building_exported: 'Focal building exported from Forma to Revit',
  revit_detailing_done: 'Revit detailing completed for focal building',
  revit_analysis_rerun: 'Environmental analysis re-run after Revit detailing',
  presentation_slides_complete: 'Presentation deck (7 slides) completed',
  walkthrough_recorded: 'Site/design walkthrough video or sequence recorded',
  team_documented: 'Team members and individual module contributions documented',
};

