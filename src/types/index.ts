// Contract and Analysis Types

export interface Contract {
  id: string;
  name: string;
  content: string;
  uploadedAt: string;
  category: ContractCategory;
  status: ContractStatus;
  tags: string[];
  fileSize: number;
  analysis?: ContractAnalysis;
}

export type ContractCategory = 
  | 'labor' 
  | 'sales' 
  | 'rental' 
  | 'service' 
  | 'partnership' 
  | 'other';

export type ContractStatus = 'active' | 'expired' | 'pending' | 'terminated';

export interface ContractAnalysis {
  summary: string;
  keyTerms: KeyTerm[];
  importantDates: ImportantDate[];
  obligations: Obligation[];
  risks: RiskItem[];
  analyzedAt: string;
}

export interface KeyTerm {
  term: string;
  definition: string;
  section: string;
}

export interface ImportantDate {
  date: string;
  description: string;
  type: 'start' | 'end' | 'deadline' | 'renewal' | 'other';
}

export interface Obligation {
  party: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: RiskCategory;
  suggestion: string;
  section: string;
}

export type RiskCategory = 
  | 'liability' 
  | 'termination' 
  | 'penalty' 
  | 'hidden_cost' 
  | 'ambiguity' 
  | 'compliance' 
  | 'other';

// Comparison Types
export interface ContractComparison {
  id: string;
  contract1Id: string;
  contract2Id: string;
  differences: Difference[];
  summary: string;
  recommendations: string[];
  comparedAt: string;
}

export interface Difference {
  aspect: string;
  contract1Value: string;
  contract2Value: string;
  significance: 'major' | 'minor';
  recommendation?: string;
}

// Chat Types
export interface ChatSession {
  id: string;
  contractId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: string;
}

// Reality Comparison Types
export interface RealitySituation {
  id: string;
  contractId: string;
  description: string;
  issues: RealityIssue[];
  createdAt: string;
}

export interface RealityIssue {
  clause: string;
  currentSituation: string;
  gap: string;
}

export interface RealityAnalysis {
  id: string;
  situationId: string;
  gaps: GapAnalysis[];
  suggestions: Suggestion[];
  analyzedAt: string;
}

export interface GapAnalysis {
  clause: string;
  expected: string;
  actual: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface Suggestion {
  issue: string;
  suggestion: string;
  legalBasis?: string;
  priority: 'high' | 'medium' | 'low';
}

// Settings Types
export interface Settings {
  apiProvider: 'openai' | 'gemini';
  apiKey: string;
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
}

// Category labels in Vietnamese
export const CATEGORY_LABELS: Record<ContractCategory, string> = {
  labor: 'Hợp đồng lao động',
  sales: 'Hợp đồng mua bán',
  rental: 'Hợp đồng thuê/cho thuê',
  service: 'Hợp đồng dịch vụ',
  partnership: 'Hợp đồng hợp tác',
  other: 'Khác',
};

export const STATUS_LABELS: Record<ContractStatus, string> = {
  active: 'Đang hiệu lực',
  expired: 'Đã hết hạn',
  pending: 'Chờ ký',
  terminated: 'Đã chấm dứt',
};

export const RISK_SEVERITY_LABELS: Record<RiskItem['severity'], string> = {
  critical: 'Nghiêm trọng',
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
};

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  liability: 'Trách nhiệm pháp lý',
  termination: 'Điều khoản chấm dứt',
  penalty: 'Phạt vi phạm',
  hidden_cost: 'Chi phí ẩn',
  ambiguity: 'Điều khoản mơ hồ',
  compliance: 'Tuân thủ pháp luật',
  other: 'Khác',
};
