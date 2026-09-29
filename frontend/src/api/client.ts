// ============================================================
// API Client — typed fetch functions for all endpoints
// ============================================================

import type {
  User, AuthResponse,
  Project, SiteInfo, LocalProblem, DataSource, Objective,
  Proposal, Analysis, FormaWorkflowStep, RevitWorkflow,
  FormaBoardFrame, FinalConcept, PresentationSlide, Walkthrough,
  TeamMember, ChecklistItem, ReadinessReport
} from '../types';

const BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('ssp_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options?.headers,
      },
      ...options,
    });

    const text = await res.text();
    if (!text || text.trim() === '') {
      if (!res.ok) {
        return { ok: false, error: `HTTP ${res.status} ${res.statusText || 'Error'}` };
      }
      return { ok: true, data: {} as T };
    }

    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return { ok: false, error: `Server returned non-JSON response (HTTP ${res.status})` };
    }

    if (!res.ok || (json && json.ok === false)) {
      return { ok: false, error: json?.error || `HTTP ${res.status}` };
    }
    return { ok: true, data: (json && 'data' in json ? json.data : json) as T };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

function get<T>(path: string) {
  return request<T>(path, { method: 'GET' });
}
function post<T>(path: string, body?: unknown) {
  return request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
}
function put<T>(path: string, body?: unknown) {
  return request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined });
}
function del<T>(path: string) {
  return request<T>(path, { method: 'DELETE' });
}

// ── Health ──
export const health = () => get<{ status: string }>('/health');

export const api = {
  // Auth
  auth: {
    signup: (fullName: string, email: string, password: string, confirmPassword?: string) =>
      post<AuthResponse>('/auth/signup', {
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword || password,
      }),
    login: (email: string, password: string) =>
      post<AuthResponse>('/auth/login', { email, password }),
    logout: () => post<{ message: string }>('/auth/logout'),
    me: () => get<User>('/auth/me'),
    forgotPassword: (email: string) =>
      post<{ message: string }>('/auth/forgot-password', { email }),
  },

  // Projects
  projects: {
    list: () => get<Project[]>('/projects'),
    get: (id: string) => get<Project>(`/projects/${id}`),
    create: (data: Partial<Project>) => post<Project>('/projects', data),
    update: (id: string, data: Partial<Project>) => put<Project>(`/projects/${id}`, data),
    delete: (id: string) => del<{ deleted: string }>(`/projects/${id}`),
    readiness: (id: string) => get<ReadinessReport>(`/projects/${id}/readiness`),
  },

  // Site
  site: {
    get: (pid: string) => get<SiteInfo>(`/projects/${pid}/site`),
    update: (pid: string, data: Partial<SiteInfo> & { site_area_km2?: number }) =>
      put<SiteInfo>(`/projects/${pid}/site`, data),
  },

  // Problems
  problems: {
    list: (pid: string) => get<LocalProblem[]>(`/projects/${pid}/problems`),
    create: (pid: string, data: Partial<LocalProblem>) =>
      post<LocalProblem>(`/projects/${pid}/problems`, data),
    update: (pid: string, id: string, data: Partial<LocalProblem>) =>
      put<LocalProblem>(`/projects/${pid}/problems/${id}`, data),
    delete: (pid: string, id: string) => del<{ deleted: string }>(`/projects/${pid}/problems/${id}`),
  },

  // Sources
  sources: {
    list: (pid: string) => get<DataSource[]>(`/projects/${pid}/sources`),
    create: (pid: string, data: Partial<DataSource>) =>
      post<DataSource>(`/projects/${pid}/sources`, data),
    update: (pid: string, id: string, data: Partial<DataSource>) =>
      put<DataSource>(`/projects/${pid}/sources/${id}`, data),
    delete: (pid: string, id: string) => del<{ deleted: string }>(`/projects/${pid}/sources/${id}`),
  },

  // Objectives
  objectives: {
    list: (pid: string) => get<Objective[]>(`/projects/${pid}/objectives`),
    create: (pid: string, data: Partial<Objective>) =>
      post<Objective>(`/projects/${pid}/objectives`, data),
    update: (pid: string, id: string, data: Partial<Objective>) =>
      put<Objective>(`/projects/${pid}/objectives/${id}`, data),
    delete: (pid: string, id: string) => del<{ deleted: string }>(`/projects/${pid}/objectives/${id}`),
  },

  // Proposals / Design Options
  proposals: {
    list: (pid: string) => get<Proposal[]>(`/projects/${pid}/proposals`),
    get: (pid: string, propId: string) => get<Proposal>(`/projects/${pid}/proposals/${propId}`),
    byLabel: (pid: string, label: '1' | '2' | 'A' | 'B') =>
      get<Proposal>(`/projects/${pid}/proposals/by-label/${label}`),
    update: (pid: string, propId: string, data: Partial<Proposal>) =>
      put<Proposal>(`/projects/${pid}/proposals/${propId}`, data),
  },

  // Analyses
  analyses: {
    list: (pid: string, proposalId?: string) =>
      get<Analysis[]>(`/projects/${pid}/analyses${proposalId ? `?proposal_id=${proposalId}` : ''}`),
    get: (pid: string, aid: string) => get<Analysis>(`/projects/${pid}/analyses/${aid}`),
    update: (pid: string, aid: string, data: Partial<Analysis>) =>
      put<Analysis>(`/projects/${pid}/analyses/${aid}`, data),
  },

  // Forma workflow
  forma: {
    list: (pid: string) => get<FormaWorkflowStep[]>(`/projects/${pid}/forma`),
    updateStep: (pid: string, stepId: string, data: Partial<FormaWorkflowStep>) =>
      put<FormaWorkflowStep>(`/projects/${pid}/forma/${stepId}`, data),
  },

  // Revit
  revit: {
    get: (pid: string) => get<RevitWorkflow>(`/projects/${pid}/revit`),
    update: (pid: string, data: Partial<RevitWorkflow>) =>
      put<RevitWorkflow>(`/projects/${pid}/revit`, data),
  },

  // Forma Board
  formaBoard: {
    list: (pid: string) => get<FormaBoardFrame[]>(`/projects/${pid}/forma-board`),
    updateFrame: (pid: string, frameId: string, data: Partial<FormaBoardFrame>) =>
      put<FormaBoardFrame>(`/projects/${pid}/forma-board/${frameId}`, data),
  },

  // Final concept
  final: {
    get: (pid: string) => get<FinalConcept>(`/projects/${pid}/final`),
    update: (pid: string, data: Partial<FinalConcept>) =>
      put<FinalConcept>(`/projects/${pid}/final`, data),
  },

  // Presentation
  presentation: {
    list: (pid: string) => get<PresentationSlide[]>(`/projects/${pid}/presentation`),
    updateSlide: (pid: string, slideId: string, data: Partial<PresentationSlide>) =>
      put<PresentationSlide>(`/projects/${pid}/presentation/${slideId}`, data),
  },

  // Walkthrough
  walkthrough: {
    get: (pid: string) => get<Walkthrough>(`/projects/${pid}/walkthrough`),
    update: (pid: string, data: Partial<Walkthrough>) =>
      put<Walkthrough>(`/projects/${pid}/walkthrough`, data),
  },

  // Team
  team: {
    list: (pid: string) => get<TeamMember[]>(`/projects/${pid}/team`),
    create: (pid: string, data: Partial<TeamMember>) =>
      post<TeamMember>(`/projects/${pid}/team`, data),
    update: (pid: string, mid: string, data: Partial<TeamMember>) =>
      put<TeamMember>(`/projects/${pid}/team/${mid}`, data),
    delete: (pid: string, mid: string) => del<{ deleted: string }>(`/projects/${pid}/team/${mid}`),
  },

  // Checklist
  checklist: {
    get: (pid: string) => get<Record<string, ChecklistItem>>(`/projects/${pid}/checklist`),
    update: (pid: string, data: Record<string, { status: string; notes?: string }>) =>
      put<Record<string, ChecklistItem>>(`/projects/${pid}/checklist`, data),
  },
};

// ── File upload ──
export async function uploadFile(file: File): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const form = new FormData();
  form.append('file', file);
  try {
    const token = localStorage.getItem('ssp_auth_token');
    const res = await fetch('/api/uploads', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const text = await res.text();
    if (!text || text.trim() === '') {
      return { ok: false, error: `HTTP ${res.status}: Empty server response` };
    }
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return { ok: false, error: `HTTP ${res.status}: Non-JSON response received` };
    }
    if (!res.ok || !json.ok) return { ok: false, error: json.error || 'Upload failed' };
    return { ok: true, url: json.data.url };
  } catch (e) {
    return { ok: false, error: 'Upload failed' };
  }
}
