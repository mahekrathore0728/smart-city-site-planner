// ============================================================
// Smart City Site Planner — TypeScript Types
// ============================================================

export interface Project {
  id: string;
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
  label: 'A' | 'B';
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
  | 'not_started' | 'evidence_required' | 'uploaded' | 'reviewed';

export type AnalysisProvenance =
  | 'forma' | 'user' | 'assumption' | 'reference';

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
  selected_proposal?: 'A' | 'B' | 'hybrid';
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
  microclimate: 'Microclimate',
  noise: 'Noise Analysis',
  solar_energy: 'Solar Energy',
};

export const ANALYSIS_STATUS_LABELS: Record<AnalysisStatus, string> = {
  not_started: 'Not Started',
  evidence_required: 'Evidence Required',
  uploaded: 'Evidence Uploaded',
  reviewed: 'Reviewed',
};

export const PROVENANCE_LABELS: Record<AnalysisProvenance, string> = {
  forma: 'Actual Forma Result',
  user: 'User Entered Result',
  assumption: 'Documented Assumption',
  reference: 'Reference / Source Data',
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
  site_area: 'Site Area ≥ 1 km²',
  site_limits: 'Site Limits Defined',
  context: 'Contextual Data Added',
  landscaping: 'Landscaping Included',
  buildings: 'Buildings Modeled',
  transportation: 'Transportation Network',
  proposal_a: 'Proposal A Created',
  proposal_b: 'Proposal B Created',
  analysis_area: 'Area Metrics Analysis',
  analysis_carbon: 'Embodied Carbon Analysis',
  analysis_sun: 'Sun Hours Analysis',
  analysis_daylight: 'Daylight Potential Analysis',
  analysis_wind: 'Wind Analysis',
  analysis_microclimate: 'Microclimate Analysis',
  analysis_noise: 'Noise Analysis',
  analysis_solar: 'Solar Energy Analysis',
  forma_board: 'Forma Board Comparison',
  office_building: 'Office Building Identified',
  revit_export: 'Revit Export Completed',
  revit_detailing: 'Revit Detailing Done',
  revit_sync: 'Revit → Forma Sync-Back',
  rendered_images: 'Rendered Images',
  walkthrough_30s: '30-Second Walkthrough Video',
  presentation_ppt: '5–7 Slide Presentation',
  final_review: 'Final Review Complete',
};
