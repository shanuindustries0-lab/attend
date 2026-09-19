# SHANU INDUSTRIES
## Enterprise Workforce Management & Payroll System
### Technical Architecture, Operations Manual & Handoff Documentation

**Version:** 1.0.0 (Production Release)  
**Lead Architect & Developer:** Harshit Sharma  
**Date:** September 2026  

---

## Table of Contents
1. [Executive Summary & Strategic Vision](#1-executive-summary--strategic-vision)
2. [System Architecture & Technology Stack](#2-system-architecture--technology-stack)
3. [Core Operational Modules](#3-core-operational-modules)
4. [Automated Compliance & Cron Infrastructure](#4-automated-compliance--cron-infrastructure)
5. [Enterprise Security & Cryptographic Protocols](#5-enterprise-security--cryptographic-protocols)
6. [Database Schema & Relationship Management](#6-database-schema--relationship-management)
7. [Environment Configuration & Secrets](#7-environment-configuration--secrets)
8. [Continuous Integration & Deployment (Vercel)](#8-continuous-integration--deployment-vercel)
9. [Disaster Recovery & Business Continuity](#9-disaster-recovery--business-continuity)
10. [Licensing, Intellectual Property & Support Agreement](#10-licensing-intellectual-property--support-agreement)
11. [About the Architect & Developer](#11-about-the-architect--developer)

---

## 1. Executive Summary & Strategic Vision

This comprehensive technical manual serves as the official architectural blueprint and operational handoff for the **Shanu Industries Employee Attendance & Payroll Platform**. 

Off-the-shelf software frequently forces enterprises to conform to rigid, standardized workflows that do not scale well with specialized factory operations. This bespoke platform was engineered from the ground up to map perfectly to the specific on-site realities, operational scale, and administrative workflows of Shanu Industries. 

By migrating from legacy, paper-based ledgers to this centralized, fault-tolerant digital ecosystem, Shanu Industries gains real-time, tamper-proof visibility into its workforce. The platform fundamentally eliminates administrative bottlenecks, automates complex financial logic, and enforces immutable data security protocols. 

---

## 2. System Architecture & Technology Stack

To guarantee enterprise-grade scalability and instantaneous load times, this platform was constructed using a modern, server-side rendered (SSR) web stack. This architecture ensures that computational heavy-lifting occurs on the server, delivering a lightweight, lightning-fast experience to the end-user's device.

| Core Technology | Implementation & Strategic Purpose |
| :--- | :--- |
| **Next.js 15 (App Router)** | The primary full-stack framework. Utilizes React Server Components and secure Server Actions to process data natively on the backend, dramatically reducing client-side load times. |
| **TypeScript** | Enforces strict, static code typing across the entire codebase. Eliminates silent runtime crashes and ensures complex data structures remain completely stable. |
| **Tailwind CSS** | A utility-first styling engine that guarantees the dashboard is 100% responsive, rendering flawlessly whether viewed on a dual-monitor office setup or a mobile device. |
| **Supabase (PostgreSQL)** | An open-source, scalable relational database serving as the platform's single source of truth. Handles complex relational data constraints and cryptographic hashing natively. |

---

## 3. Core Operational Modules

The platform is modularized into distinct, highly focused operational pillars, each engineered to abstract complexity away from the end-user.

* **Workforce Directory:** A highly responsive, searchable database encapsulating all active and archived personnel records. It features integrated automated linguistic transliteration (English to Hindi) to accommodate diverse administrative staff.
* **Intelligent Attendance Engine:** A visually intuitive grid interface enables site managers to execute bulk attendance marking (Present, Absent, Half-Day). It includes future-proofing logic to restrict marking for future dates and autonomously accounts for paid holidays.
* **Dynamic Payroll Calculator:** Replaces manual spreadsheet mathematics. The platform aggregates daily logs, cross-references them against individual custom daily wages, and calculates weekly or monthly payroll obligations instantly, including pro-rata deductions for half-days.
* **Data Locking (Immutable Audit Trail):** Once a week is finalized, authorized administrators can trigger a cryptographic "Lock," mathematically preventing retroactive tampering or accidental overwrites prior to payroll disbursement.

---

## 4. Automated Compliance & Cron Infrastructure

> **Strategic Advantage:** The platform executes mission-critical data backups entirely in the background, requiring zero active input from the user and ensuring total compliance with off-site record-keeping mandates.

* **Serverless Background Tasks:** Integrated scheduled tasks (Cron jobs) run autonomously on the edge network, completely independent of the client-side browser.
* **Google Drive API Integration:** Every night at precisely 10:00 PM (IST), the system securely compiles the current payroll and attendance data, formats it into an executive-grade Excel spreadsheet, and uploads it directly to the Shanu Industries management Google Drive folder for permanent, secure archiving.

---

## 5. Enterprise Security & Cryptographic Protocols

Security is fundamentally baked into the foundational layer of the application, utilizing techniques standard in global enterprise architectures.

* **Custom Cryptographic Authentication:** Standard email/password vectors are frequent targets for automated attacks. This platform utilizes a hidden, decoupled `admins` table. Passwords are mathematically hashed using PostgreSQL's advanced `pgcrypto` engine.
* **HTTP-Only Session Management:** Upon authentication, the system issues an encrypted `admin_session` cookie. This cookie is structurally invisible to client-side JavaScript, rendering cross-site scripting (XSS) session-hijacking virtually impossible.
* **Strict Row Level Security (RLS):** Database read/write policies are locked at the server level. The Supabase PostgreSQL instance will outright reject any query that does not originate from a verified backend Server Action carrying the master service key.

---

## 6. Database Schema & Relationship Management

The underlying database utilizes a highly normalized PostgreSQL schema designed for long-term data integrity and prevention of orphan records.

* **Foreign Key Constraints:** All attendance and payment records are strictly bound to their respective employee profiles via mathematically enforced foreign keys.
* **Cascading Deletions:** Built on advanced PostgreSQL relational mechanics, the platform allows administrators to seamlessly remove former employees. The database autonomously cascades this deletion (via the `ON DELETE CASCADE` SQL directive) to scrub historical attendance and payment records without triggering database crashes, keeping the underlying data structures lightweight.

---

## 7. Environment Configuration & Secrets

The platform relies on highly secure external APIs and database connections. These cryptographic keys must be securely injected into the host environment. 

> **CRITICAL WARNING:** Under no circumstances should these keys be shared via email, exposed to the client-side browser, or committed to the public GitHub repository.

| Variable Name | Required Value / Technical Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | The REST API endpoint connecting the frontend to the Supabase instance. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The public-facing routing key required exclusively for non-privileged client interactions. |
| `SUPABASE_SERVICE_ROLE_KEY` | The high-privilege master key used *only* by the Next.js backend. |
| `GOOGLE_CLIENT_EMAIL` | The designated Google Cloud Service Account email used to authorize the Drive API. |
| `GOOGLE_PRIVATE_KEY` | The strictly confidential RSA private key required to authorize Excel file uploads. |
| `CRON_SECRET` | A complex, randomized alphanumeric string used to authorize the Vercel cron job. |

---

## 8. Continuous Integration & Deployment (Vercel)

The platform utilizes Vercel for zero-configuration, edge-network hosting. Vercel provides a Continuous Integration and Continuous Deployment (CI/CD) pipeline.

1. **Initialization:** Navigate to the Vercel Dashboard, authenticate via the authorized GitHub account, and import the finalized `shanu-industries` repository. Set the framework to **Next.js**.
2. **Key Injection:** Input each variable from **Section 7** into the Vercel Environment Variables interface.
3. **Production Build:** Click **Deploy**. Vercel will autonomously provision an edge-network server, execute strict TypeScript compilation checks (`npm run build`), and issue a live, SSL-secured production URL.
4. **Autonomous Updates:** Should future feature expansions be required, validated code pushed directly to the `main` branch on GitHub will be silently intercepted by Vercel, compiled, and seamlessly deployed without interrupting end-user operations.

---

## 9. Disaster Recovery & Business Continuity

To ensure Shanu Industries experiences zero operational downtime, the platform is equipped with robust recovery mechanisms.

* **Point-in-Time Recovery (PITR):** The Supabase database is configured to take autonomous snapshots of the production data. In the event of catastrophic user error, the database can be rolled back to a specific minute in time.
* **Edge Network Redundancy:** Vercel hosts the application across a global edge network. If a localized server node experiences an outage, traffic is instantly rerouted to the next closest node.
* **Decentralized Data Archiving:** Because the nightly Cron jobs physically push Excel files to an external Google Drive, Shanu Industries retains full ownership and offline access to their payroll data regardless of the application's server status.

---

## 10. Licensing, Intellectual Property & Support Agreement

To ensure mutual protection, establish clear operational boundaries, and guarantee the long-term viability of the software, the handoff of this custom platform is governed by the following independent development clauses:

* **Intellectual Property Transfer:** Full intellectual property rights, unrestricted usage rights, and complete repository ownership of the customized codebase are transferred to Shanu Industries exclusively upon the settlement of the final project invoice. The developer retains the right to use abstracted, non-confidential code snippets for portfolio purposes.
* **Independent Contractor Status:** The developer operates strictly as an independent software contractor. This handoff concludes the primary project-based deliverable. No employer-employee relationship is established.
* **Warranty Limitation & Liability:** The platform has been rigorously tested for data integrity and security. The developer assumes no liability for operational delays, financial discrepancies, data loss, or systemic issues resulting from unauthorized third-party modifications to the Vercel environment, altered database schemas, or compromised environment variables post-handoff.
* **Future Expansions & SLA:** The underlying architecture is clean, highly modular, and designed to scale indefinitely. Future technical support, maintenance, cross-border payment gateway integrations, or feature development will fall outside the scope of this initial handoff and will be scoped under separate, mutually agreed-upon hourly tracking or project-based retainers.

---

## 11. About the Architect & Developer

**Harshit Sharma**  
*Independent Software Developer | Custom Platform & Architecture Specialist*

Harshit Sharma specializes in engineering bespoke digital infrastructure and high-performance web applications that bridge the gap between complex operational workflows and intuitive user experiences. Operating as an independent platform architect, he partners with a diverse portfolio of domestic and international clients to build proprietary systems that out-perform generic SaaS limitations.

By working directly with stakeholders, Harshit provides highly flexible engagement models—ranging from full-scale, end-to-end project deliverables (such as the Shanu Industries Employee Management Platform) to targeted architectural consulting, hourly system maintenance, and API integrations. His development philosophy prioritizes clean, strictly typed codebases, enterprise-grade security protocols, and seamless client handoffs that empower businesses to scale their operations with absolute confidence.

***

*End of Document. Prepared for Shanu Industries.*