import { ProjectData } from '../types';

export const INITIAL_PROJECTS: Record<string, ProjectData> = {
  telemedicine_app: {
    id: 'telemedicine_app',
    title: 'HealthTech Telemedicine & Prescription Platform',
    description: 'HIPAA-compliant telemedicine platform with WebRTC peer-to-peer video consultations, automated prescription generation, and Stripe healthcare billing.',
    methodology: 'Agile / Scrum',
    sprint_duration_weeks: 2,
    team_members: [
      { name: 'Ananya Sharma', role: 'Fullstack Lead', capacity_hours: 40 },
      { name: 'Rohan Verma', role: 'Frontend Engineer', capacity_hours: 35 },
      { name: 'Priya Nair', role: 'Backend & Cloud Lead', capacity_hours: 40 },
      { name: 'Siddharth Das', role: 'Security & QA Specialist', capacity_hours: 30 }
    ],
    epics: [
      {
        id: 'EPIC-1',
        title: 'HIPAA Patient Onboarding & Authentication Guardrails',
        priority: 'High',
        description: 'Biometric MFA, AES-256 data at rest, consent record retention.'
      },
      {
        id: 'EPIC-2',
        title: 'Real-time WebRTC Video Consultation Core',
        priority: 'Urgent',
        description: 'Adaptive bitrate P2P video stream, STUN/TURN traversal, e2e encryption.'
      },
      {
        id: 'EPIC-3',
        title: 'Digital Prescription & Pharmacy Webhook Dispatch',
        priority: 'Medium',
        description: 'Automated drug-drug contraindication warnings and signed PDF generation.'
      }
    ],
    tasks: [
      {
        id: 'TASK-101',
        epic_id: 'EPIC-1',
        title: 'Multi-Factor Auth (MFA) via SMS & Authenticator TOTP',
        user_story: 'As a patient, I want to authenticate via 2FA so that my sensitive health records remain protected against credential attacks.',
        acceptance_criteria: 'Given user credentials, When OTP is transmitted, Then token is verified within 60s and grants JWT session with 15m expiry.',
        assignee: 'Priya Nair',
        status: 'Done',
        story_points: 5,
        estimated_hours: 20,
        actual_hours: 18,
        priority: 'High',
        due_date: '2026-11-01',
        dependencies: []
      },
      {
        id: 'TASK-102',
        epic_id: 'EPIC-1',
        title: 'Patient Medical History Intake Profile & HIPAA Consent',
        user_story: 'As a patient, I want to upload past medical records and sign informed consent digitally so the consulting doctor is pre-briefed.',
        acceptance_criteria: 'Given new patient session, When documents are uploaded, Then AES-256 encryption at rest is applied and audit log is persisted.',
        assignee: 'Rohan Verma',
        status: 'In Progress',
        story_points: 3,
        estimated_hours: 15,
        actual_hours: 12,
        priority: 'Medium',
        due_date: '2026-11-04',
        dependencies: ['TASK-101']
      },
      {
        id: 'TASK-103',
        epic_id: 'EPIC-2',
        title: 'WebRTC Peer-to-Peer Video Consultation Engine',
        user_story: 'As a doctor, I want crystal clear peer-to-peer video streaming with screen sharing so I can conduct clinical consults remotely.',
        acceptance_criteria: 'Given doctor and patient in consultation room, When WebRTC handshake completes, Then stream latency < 200ms with E2E DTLS-SRTP.',
        assignee: 'Ananya Sharma',
        status: 'Blocked',
        story_points: 8,
        estimated_hours: 32,
        actual_hours: 30,
        priority: 'Urgent',
        due_date: '2026-11-05',
        dependencies: ['TASK-102'],
        blocker_reason: 'Waiting on STUN/TURN server firewall clearance from DevOps security infrastructure.'
      },
      {
        id: 'TASK-104',
        epic_id: 'EPIC-2',
        title: 'Encrypted Video Recording & AWS S3 Compliant Vault',
        user_story: 'As a clinic administrator, I want patient-consented consultation streams archived securely for 90 days for regulatory audits.',
        acceptance_criteria: 'Given consent flag is true, When video stream ends, Then raw stream is transcoded to H.264 and stored in isolated KMS-encrypted S3 bucket.',
        assignee: 'Priya Nair',
        status: 'To Do',
        story_points: 5,
        estimated_hours: 20,
        actual_hours: 0,
        priority: 'Medium',
        due_date: '2026-11-10',
        dependencies: ['TASK-103']
      },
      {
        id: 'TASK-105',
        epic_id: 'EPIC-3',
        title: 'Digital Prescription Builder with Drug Conflict Engine',
        user_story: 'As a physician, I want automated drug-drug interaction warnings when prescribing medicines so patient pharmacological safety is assured.',
        acceptance_criteria: 'Given doctor selects Medication A and Medication B, When contraindication exists in FDA database, Then high-severity modal appears.',
        assignee: 'Ananya Sharma',
        status: 'To Do',
        story_points: 8,
        estimated_hours: 30,
        actual_hours: 0,
        priority: 'High',
        due_date: '2026-11-15',
        dependencies: []
      },
      {
        id: 'TASK-106',
        epic_id: 'EPIC-3',
        title: 'Pharmacy Partner Webhook & Signed PDF Dispatch',
        user_story: 'As a pharmacist, I want to receive cryptographically signed prescription PDFs directly via webhook so fulfillments start immediately.',
        acceptance_criteria: 'Given prescription is finalized, When doctor hits sign, Then webhook fires with payload HMAC signature and returns HTTP 200 in < 2s.',
        assignee: 'Siddharth Das',
        status: 'To Do',
        story_points: 3,
        estimated_hours: 14,
        actual_hours: 0,
        priority: 'Low',
        due_date: '2026-11-18',
        dependencies: ['TASK-105']
      }
    ],
    risks: [
      {
        id: 'RSK-01',
        category: 'Infrastructure',
        description: 'STUN/TURN server latency degradation on 4G cellular links causing WebRTC packet loss.',
        probability: 4,
        impact: 5,
        score: 20,
        severity: 'Critical',
        mitigation_strategy: 'Deploy adaptive bitrate encoding (VP9/AV1) with automated instant fallback to audio-only mode.',
        owner: 'Ananya Sharma',
        status: 'Active'
      },
      {
        id: 'RSK-02',
        category: 'Compliance',
        description: 'HIPAA external audit finding unencrypted diagnostic telemetry in centralized logs.',
        probability: 2,
        impact: 5,
        score: 10,
        severity: 'Moderate',
        mitigation_strategy: 'Implement automated regex sanitization middleware to strip all PHI/PII tokens prior to ingestion.',
        owner: 'Siddharth Das',
        status: 'Monitoring'
      },
      {
        id: 'RSK-03',
        category: 'Resource Workload',
        description: 'Fullstack Lead (Ananya Sharma) allocated 62h across concurrent video and prescription modules.',
        probability: 4,
        impact: 4,
        score: 16,
        severity: 'Critical',
        mitigation_strategy: 'Reallocate Task-105 frontend UI modules to Rohan Verma and assign 1 contract specialist.',
        owner: 'AI Project Coordinator',
        status: 'Active'
      }
    ]
  },
  fintech_kyc: {
    id: 'fintech_kyc',
    title: 'Fintech Instant Credit & KYC Disbursal App',
    description: 'AI-powered biometric face liveness and Aadhaar/PAN instant verification pipeline with under-5-minute loan underwriting.',
    methodology: 'Kanban / Continuous Delivery',
    sprint_duration_weeks: 2,
    team_members: [
      { name: 'Devansh Gupta', role: 'Senior ML Engineer', capacity_hours: 40 },
      { name: 'Meera Sen', role: 'Backend & Payments Lead', capacity_hours: 40 },
      { name: 'Karan Kapoor', role: 'Mobile Lead (Flutter)', capacity_hours: 35 }
    ],
    epics: [
      { id: 'EPIC-1', title: 'OCR & Biometric Liveness Verification', priority: 'Urgent' },
      { id: 'EPIC-2', title: 'Credit Underwriting Alternate Data Scoring', priority: 'High' },
      { id: 'EPIC-3', title: 'NPCI e-Mandate & Instant Bank Disbursal', priority: 'High' }
    ],
    tasks: [
      {
        id: 'TASK-201',
        epic_id: 'EPIC-1',
        title: 'Mobile Camera OCR for PAN and Driving License',
        user_story: 'As a loan applicant, I want my identity documents auto-extracted so I never have to type manual details.',
        acceptance_criteria: 'Given clear photo capture, When on-device OCR runs, Then field accuracy is > 98% and returns parsed JSON within 1.5s.',
        assignee: 'Devansh Gupta',
        status: 'Done',
        story_points: 5,
        estimated_hours: 20,
        actual_hours: 16,
        priority: 'High',
        due_date: '2026-11-02'
      },
      {
        id: 'TASK-202',
        epic_id: 'EPIC-1',
        title: 'Active Face Liveness & Anti-Spoofing Detection',
        user_story: 'As a risk officer, I want automated passive/active liveness detection to prevent synthetic deepfakes and impersonation attacks.',
        acceptance_criteria: 'Given webcam feed, When applicant performs challenge, Then anti-spoofing score > 0.95 certifies live human presence.',
        assignee: 'Devansh Gupta',
        status: 'In Progress',
        story_points: 8,
        estimated_hours: 30,
        actual_hours: 24,
        priority: 'Urgent',
        due_date: '2026-11-06',
        dependencies: ['TASK-201']
      },
      {
        id: 'TASK-203',
        epic_id: 'EPIC-3',
        title: 'NPCI e-Mandate UPI Autopay Integration',
        user_story: 'As a lender, I want recurring auto-debit set up before loan disbursal to ensure seamless scheduled repayments.',
        acceptance_criteria: 'Given verified bank account, When user authorizes UPI autopay, Then mandate ID is registered with payment gateway.',
        assignee: 'Meera Sen',
        status: 'Blocked',
        story_points: 5,
        estimated_hours: 25,
        actual_hours: 15,
        priority: 'High',
        due_date: '2026-11-08',
        blocker_reason: 'Awaiting bank sandbox credential renewal and sponsor bank KYC approval.'
      }
    ],
    risks: [
      {
        id: 'RSK-101',
        category: 'Regulatory',
        description: 'RBI revised digital lending directive mandating isolated VPC onshore data audits.',
        probability: 3,
        impact: 5,
        score: 15,
        severity: 'High',
        mitigation_strategy: 'Provision AWS Mumbai (ap-south-1) isolated VPC setup with data residency certificates.',
        owner: 'Meera Sen',
        status: 'Active'
      }
    ]
  }
};
