export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failure' | 'warning';
}

export interface SODViolation {
  id: string;
  conflictType: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  users: string[];
  description: string;
  detectionDate: string;
  status: 'Open' | 'In Review' | 'Resolved';
  systems: string[];
  mitigatingControls: string;
}

export interface FraudAlert {
  id: string;
  alertType: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  timestamp: string;
  amount?: number;
  accountId?: string;
  userId: string;
  pattern: string;
  status: 'New' | 'Investigating' | 'Confirmed' | 'False Positive';
  confidence: number;
}

export interface AccessPermission {
  id: string;
  userId: string;
  userName: string;
  system: string;
  role: string;
  permissions: string[];
  grantDate: string;
  expiryDate?: string;
  status: 'Active' | 'Expired' | 'Revoked' | 'Pending';
  lastAccessed: string;
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Review Required';
}

export interface StatutoryFiling {
  id: string;
  regulationType: 'SEBI' | 'MCA' | 'GST' | 'Income Tax';
  filingName: string;
  dueDate: string;
  submissionDate?: string;
  status: 'Draft' | 'In Progress' | 'Submitted' | 'Overdue' | 'Acknowledged';
  assignedTo: string;
  amount?: number;
  notes?: string;
  attachments?: string[];
}

export interface AuditFinding {
  id: string;
  findingTitle: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Closed' | 'Reopened';
  owner: string;
  auditDate: string;
  targetClosureDate: string;
  actualClosureDate?: string;
  rootCause: string;
  correctiveAction: string;
  department: string;
}