# Full-Stack-Security-Compliance-Framework-For-Next-Generation-System-Management-Solution

> **Enterprise-Ready Security, Compliance, and Risk Intelligence for Modern HPC, Cloud, and Hybrid Environments**

In today’s digital landscape, security compliance is critical for protecting sensitive data and ensuring resilient infrastructure. This project delivers a unified Full Stack Security Compliance Framework that automates assessment, monitoring, and remediation across domains like healthcare, banking, defense, and quantum systems.

By integrating Wazuh, Lynis, and OpenSCAP into a centralized pipeline, the framework provides real-time insights, structured reporting, and intelligent remediation. The Model Context Protocol (MCP) engine, enhanced by a Groq LLM, transforms raw alerts into actionable, context-aware recommendations aligned with standards such as CIS.

Key features include secure SSH-based scans, automated data collection, interactive dashboards, and flexible reporting—supporting both industry and custom compliance frameworks. The solution is modular, scalable, and designed for zero-downtime updates, addressing both current and next-generation cybersecurity needs.

---

This repository delivers a modular, production-grade platform for continuous security monitoring, compliance assessment, and actionable reporting. Designed for research labs, enterprise clusters, and distributed edge deployments, it unifies:

- A modern React + TypeScript frontend (Vite, Tailwind CSS, Zustand, Recharts, Lucide React)
- A robust Node.js/Express backend with seamless Wazuh, Lynis, and OpenSCAP integrations
- Real-time dashboards, multi-framework compliance, and automated regulatory reporting
- Sector-specific research, professional documentation, and ready-to-use configuration

**Directory Overview:**
- `src/` — Frontend application and UI components
- `server/` — Backend API, security tool integrations, and persistent data storage
- `research/` — Industry compliance research and sector analysis
- `Documentation/` — Project reports and presentations
- `public/` — Static assets
- Configuration files for code quality, build, and type safety

This framework is extensible, audit-ready, and engineered for operational excellence—empowering organizations to stay compliant, resilient, and proactive in the face of evolving threats.

_Not just compliant. Audit-ready. Attack-resistant. Smart-driven._

A real-time risk intelligence system that integrates top tools — **Wazuh**, **OpenSCAP**, and **Lynis** — to monitor every endpoint, node, and remote asset. But it goes beyond alerting.

## 🌐 Lynis & OpenSCAP: Remote Node Assessment via SSH
For systems where agents aren’t viable — edge nodes, satellites, or isolated HPC clusters — we use:
- **Lynis** for remote auditing over SSH (configurations, permissions, kernel settings)
- **OpenSCAP** for SCAP-compliant scans across remote environments

✅ These tools ensure even SSH-only assets stay compliant and auditable — no local install needed.

## 🛡 Wazuh: Server-Level Monitoring
Wazuh is deployed on each compute node or critical server. It provides:
- Real-time intrusion detection
- File integrity monitoring
- Behavioral alerts at the system level
- Continuous log analysis from core services

✅ Perfect for tracking live threats, unauthorized changes, or runtime anomalies on local infrastructure.

## 🧠 MCP Protocol Engine: Context-Aware Risk Intelligence
At the heart is **MCP** — our Model Context Protocol — a smart engine that takes noisy alerts and transforms them into prioritized, context-aware risks mapped directly to frameworks like NIST, ISO 27001, SOC2, and more.

We use top-tier tools – Wazuh, OpenSCAP, and Lynis – to continuously monitor your HPC compute nodes and remote systems. They generate JSON-based logs that feed into a central API and Local Database, where they are normalized and stored.

The real shift happens with our MCP Protocol Engine:
- Adds context to raw logs
- Applies risk scoring based on CVSS + asset value
- Maps them to compliance frameworks (NIST, ISO, HIPAA, etc.)
- Validates every output before triggering actions
- Instantly flags high-risk logins, enforces MFA, and blocks attackers from exploiting leaked credentials (like the ones seen in the recent 16 billion password leak affecting Google, Apple, and more)
- Supports zero-downtime updates, so security never pauses

## 📊 Actionable Intelligence & Outputs
Finally, we surface this intelligence through:
- Interactive dashboards
- Regulatory reports
- Actionable outputs – such as triggering auto-remediation or alerting CISOs

---

Below you’ll find a detailed breakdown of features, architecture, setup, and operational guidance for the platform.

## 🌟 Key Features

### 🔧 **Security Tool Integrations**
- **Wazuh Integration**: Real-time security monitoring, agent management, and SIEM capabilities
- **Lynis Integration**: System hardening and security auditing
- **OpenSCAP Integration**: Security compliance scanning and vulnerability assessment
- **SSH Remote Access**: Connect to remote servers for security tool execution (external functionality)

### 📊 **Compliance Frameworks**
- **PCI-DSS**: Payment Card Industry Data Security Standard
- **GDPR**: General Data Protection Regulation
- **HIPAA**: Health Insurance Portability and Accountability Act
- **NIST 800-53**: National Institute of Standards and Technology Security Controls

### 📈 **Advanced Monitoring & Reporting**
- **Real-time Agent Monitoring**: Live system status, processes, and network activity
- **Security Configuration Assessment (SCA)**: Detailed security rule evaluation with expandable descriptions
- **File Integrity Monitoring**: Track file changes and system modifications
- **Network Security Analysis**: Port monitoring, interface statistics, and protocol analysis
- **Hardware & OS Profiling**: Comprehensive system information gathering

### 📋 **Export & Reporting**
- **Interactive HTML Reports**: Comprehensive security reports with pie charts, tables, and expandable sections
- **JSON Data Export**: Raw data export for integration with other tools
- **Professional Styling**: Dark-themed, responsive reports with modern UI/UX
- **Complete Data Sets**: Dashboard shows limited records (20) for performance, HTML exports include ALL data

### 🎨 **User Interface**
- **Modern React Frontend**: Built with TypeScript, Tailwind CSS, and Vite
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Live data refresh and status monitoring
- **Interactive Dashboards**: Dynamic charts, tables, and visualizations

## 🏗️ Architecture

### **Frontend Stack**
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern, responsive styling
- **Zustand** for lightweight state management
- **Recharts** for interactive data visualizations
- **Lucide React** for consistent iconography

### **Backend Stack**
- **Node.js** with Express.js REST API
- **Axios** for HTTP client communications
- **CORS** enabled for cross-origin requests
- **JWT Token Management** for Wazuh API authentication

### **Security Tools Integration**
- **Wazuh API**: Direct integration with Wazuh SIEM platform
- **Lynis**: Local system security auditing
- **OpenSCAP**: Compliance and vulnerability scanning

## 🎥 Video Demonstrations

<p align="center">
  <img src="https://github.com/user-attachments/assets/37a67353-ab5f-48ac-8869-6463ccd588b1" alt="DEMO" width="600"/>
</p>




## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Lynis** installed on the system (for local auditing)
- **Wazuh Server** (for security monitoring integration)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/JDeep1234/Full-Stack-Security-Compliance-Framework-For-Next-Generation-System-Management-Solution.git your-repo-name
cd your-repo-name
```

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Install backend dependencies:**
```bash
cd server
npm install
cd ..
```

### Running the Application

#### Development Mode (Recommended)

**Option 1: Run both frontend and backend concurrently**
```bash
npm run dev:all
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

#### Production Mode

1. **Build the frontend:**
```bash
npm run build
```

2. **Start the backend:**
```bash
cd server
npm start
```

### Access Points

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 🔧 Configuration

### Wazuh Integration Setup

1. **Navigate to Tool Integrations** in the application
2. **Click "Configure"** for the Wazuh integration
3. **Enter your Wazuh API credentials:**
   - **API URL**: `https://your-wazuh-server:55000`
   - **Username**: Your Wazuh API username
   - **Password**: Your Wazuh API password
4. **Click "Connect & Configure"** to establish the connection

### Lynis Integration

Lynis integration requires the tool to be installed locally:

**Debian/Ubuntu:**
```bash
sudo apt-get update
sudo apt-get install lynis
```

**RHEL/CentOS/Fedora:**
```bash
sudo dnf install lynis
# or for older versions:
sudo yum install epel-release
sudo yum install lynis
```

**macOS:**
```bash
brew install lynis
```

## 📁 Project Structure

```
HPE-CTY-Project/
├── final/
│   ├── .git/                              # Git repository
│   ├── .gitignore                         # Git ignore file
│   ├── README.md                          # Project documentation
│   ├── index.html                         # Main HTML entry point
│   ├── package.json                       # Frontend dependencies
│   ├── package-lock.json                  # Lock file for dependencies
│   ├── spec.yaml                          # API specification
│   │
│   ├── Configuration Files/
│   │   ├── eslint.config.js               # ESLint configuration
│   │   ├── postcss.config.js              # PostCSS configuration
│   │   ├── tailwind.config.js             # Tailwind CSS configuration
│   │   ├── tsconfig.json                  # TypeScript configuration
│   │   ├── tsconfig.app.json              # TypeScript app configuration
│   │   ├── tsconfig.node.json             # TypeScript node configuration
│   │   └── vite.config.ts                 # Vite build configuration
│   │
│   ├── public/                            # Static assets
│   │   └── shield-icon.svg                # Application icon
│   │
│   ├── src/                               # Frontend source code
│   │   ├── App.tsx                        # Main React component
│   │   ├── main.tsx                       # Application entry point
│   │   ├── index.css                      # Global styles
│   │   ├── vite-env.d.ts                  # Vite environment types
│   │   │
│   │   ├── components/                    # Reusable React components
│   │   │   ├── dashboard/                 # Dashboard-specific components
│   │   │   │   ├── ComplianceSummary.tsx  # Compliance overview widget
│   │   │   │   ├── RecentAssessments.tsx  # Recent assessments widget
│   │   │   │   ├── ThreatSummary.tsx      # Threat summary widget
│   │   │   │   └── ToolStatus.tsx         # Tool status widget
│   │   │   │
│   │   │   ├── layout/                    # Layout components
│   │   │   │   ├── Header.tsx             # Application header
│   │   │   │   ├── Layout.tsx             # Main layout wrapper
│   │   │   │   └── Sidebar.tsx            # Navigation sidebar
│   │   │   │
│   │   │   └── wazuh/                     # Wazuh integration components
│   │   │       ├── AgentMetrics.tsx       # Agent metrics display
│   │   │       ├── AgentSelector.tsx      # Agent selection component
│   │   │       ├── ComplianceOverview.tsx # Compliance overview
│   │   │       ├── PortsTable.tsx         # Network ports table
│   │   │       ├── ProcessesTable.tsx     # Running processes table
│   │   │       ├── SCAResults.tsx         # Security Configuration Assessment
│   │   │       ├── SystemInformation.tsx  # System information display
│   │   │       └── *.json                 # Sample data files
│   │   │
│   │   ├── data/                          # Application data and configurations
│   │   │   └── dataStore/                 # Static data and development datasets
│   │   │
│   │   ├── pages/                         # Page components
│   │   │   ├── Dashboard.tsx              # Main dashboard page
│   │   │   ├── HistoricalData.tsx         # Historical data analysis
│   │   │   ├── NotFound.tsx               # 404 error page
│   │   │   ├── OpenSCAPReport.tsx         # OpenSCAP reporting
│   │   │   ├── ScheduledAssessments.tsx   # Assessment scheduling
│   │   │   ├── Settings.tsx               # Application settings
│   │   │   ├── ToolIntegrations.tsx       # Security tool integrations
│   │   │   ├── WazuhConfig.tsx            # Wazuh configuration
│   │   │   ├── WazuhResult.tsx            # Wazuh results display
│   │   │   ├── AssessmentResults.tsx      # Assessment results
│   │   │   ├── ComplianceFrameworks.tsx   # Compliance frameworks
│   │   │   ├── CustomFrameworks.tsx       # Custom framework creation
│   │   │   └── [legacy files]             # Development iterations
│   │   │
│   │   ├── store/                         # State management
│   │   │   ├── appStore.ts                # Application state store
│   │   │   └── complianceStore.ts         # Compliance data store
│   │   │
│   │   └── types/                         # TypeScript type definitions
│   │       └── compliance.ts              # Compliance-related types
│   │
│   ├── server/                            # Backend server
│   │   ├── package.json                   # Server dependencies
│   │   ├── package-lock.json              # Server lock file
│   │   ├── server.js                      # Express server main file
│   │   ├── wazuhService.js                # Wazuh API integration service
│   │   ├── lynisService.js                # Lynis security audit service
│   │   │
│   │   ├── data/                          # Server data storage
│   │   │   └── wazuh/                     # Wazuh data files
│   │   │       ├── 000_network_ports.json # Network ports data
│   │   │       ├── 000_system_info.json  # System information
│   │   │       └── data/                  # Historical data files
│   │   │           └── *.json             # Timestamped data files
│   │   │
│   │   ├── reports/                       # Generated reports
│   │   │   └── wazuh-security-report-*.html # Wazuh security reports
│   │   │
│   │   └── lynisReports/                  # Lynis audit reports
│   │       └── report.json                # Lynis report data
│   │
│   ├── research/                          # Research and documentation
│   │   ├── Healthcare-sector.md           # Healthcare compliance research
│   │   ├── banking-sector-compliance.md   # Banking sector compliance
│   │   ├── defence-sector.md              # Defense sector requirements
│   │   ├── hpc.md                         # High-Performance Computing
│   │   └── telecom-security-compliance.md # Telecom security standards
│   │
│   └── Documentation/                     # Project documentation
│       ├── Report.pdf                     # Project report
│       └── Final_Presentation.pdf         # Final presentation
```

## 🔍 Features Deep Dive

### Wazuh Security Dashboard

**Agent Management:**
- Real-time agent status monitoring
- IPv4/IPv6 address resolution with smart prioritization
- Hardware profiling (CPU, RAM, storage)
- Operating system information

**Security Monitoring:**
- **Running Processes**: Monitor active system processes (Dashboard: top 20, HTML export: unlimited)
- **Network Ports**: Track open ports and listening services (Dashboard: top 20, HTML export: unlimited)
- **File Integrity**: Monitor file changes and modifications (Dashboard: top 20, HTML export: unlimited)
- **Network Interfaces**: Interface statistics and traffic analysis
- **Security Configuration Assessment**: Detailed rule evaluation with compliance mapping

**Compliance Assessment:**
- Multi-framework compliance scoring (PCI-DSS, GDPR, HIPAA, NIST)
- Interactive pie charts with pass/fail/not-applicable breakdowns
- Detailed rule descriptions, rationale, and remediation steps
- Expandable/collapsible rule sections for detailed analysis

### HTML Export System

**Comprehensive Reports Include:**
- **Executive Summary**: Compliance status across all frameworks
- **System Information**: Complete hardware, OS, and network details
- **Security Assessment**: All SCA rules with detailed descriptions
- **Process Analysis**: Complete process list with resource usage
- **Network Security**: All open ports and interface statistics
- **File Integrity**: Complete file change history
- **Professional Styling**: Dark theme, responsive design, print-friendly

**Export Features:**
- **Unlimited Data**: HTML exports contain complete datasets (no 20-record limits)
- **Interactive Elements**: Expandable sections, sortable tables
- **Professional Formatting**: Corporate-ready styling with proper typography
- **Self-contained**: Single HTML file with embedded CSS and JavaScript

### Performance Optimizations

**Dashboard Performance:**
- Limited to 20 records per section for fast loading
- Real-time data refresh capabilities
- Efficient API calls with proper error handling
- Smart caching and state management

**Export Performance:**
- Separate API calls for unlimited data
- Optimized HTML generation
- Efficient data processing and formatting

## 🔌 API Endpoints

### Wazuh Integration

```
POST   /api/tools/wazuh/configure          # Configure Wazuh connection
GET    /api/tools/wazuh/status             # Check connection status
GET    /api/tools/wazuh/agents             # List all agents
GET    /api/tools/wazuh/agents/:id/hardware # Agent hardware info
GET    /api/tools/wazuh/agents/:id/os       # Agent OS information
GET    /api/tools/wazuh/agents/:id/processes # Agent processes (limit configurable)
GET    /api/tools/wazuh/agents/:id/ports    # Agent network ports
GET    /api/tools/wazuh/agents/:id/sca      # Security Configuration Assessment
GET    /api/tools/wazuh/agents/:id/syscheck # File integrity monitoring
GET    /api/tools/wazuh/agents/:id/netiface # Network interface statistics
```

### Lynis Integration

```
POST   /api/tools/lynis/run               # Execute Lynis scan
GET    /api/tools/lynis/report            # Get scan results
GET    /api/tools/lynis/status            # Check scan status
```

### System Health

```
GET    /api/health                        # System health check
```

## 🧪 Testing

### Unit Testing
```bash
npm run test        # Run unit tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Integration Testing
- End-to-end tests with Cypress
- API integration tests
- Security tool integration validation

### Performance Testing
- Load testing with k6
- Response time benchmarking
- Resource utilization monitoring

## 📦 Deployment Best Practices

### Container Deployment
```bash
# Build Docker image
docker build -t hpc-security-framework .

# Run container
docker run -p 80:3001 hpc-security-framework
```

### Production Checklist
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring tools setup
- [ ] Rate limiting enabled
- [ ] Security headers configured

### Scaling Considerations
- Horizontal scaling with load balancers
- Redis caching for API responses
- Database connection pooling
- Static asset CDN distribution

## 🔒 Security Considerations

### Authentication & Authorization
- JWT token-based authentication for Wazuh API
- Automatic token renewal (15-minute expiration)
- Secure credential handling

### Network Security
- CORS configuration for cross-origin requests
- HTTPS support for production deployments
- SSL certificate validation (configurable)

### Data Protection
- No sensitive data stored in frontend
- Secure API communication
- Proper error handling without data leakage

## 🛡️ Enhanced Security Measures

### API Security
- Rate limiting per endpoint
- Request validation middleware
- SQL injection prevention
- XSS protection headers
- CSRF token validation

### Data Protection
- AES-256 encryption for sensitive data
- Regular security audits
- Automated vulnerability scanning
- Security patch management
- Data backup encryption

### Access Control
- Role-based access control (RBAC)
- IP whitelisting options
- Session management
- Audit logging
- Failed login attempt monitoring

### Compliance Monitoring
- Real-time compliance checks
- Automated compliance reporting
- Policy violation alerts
- Regulatory requirement tracking
- Compliance score trending

## 🚨 Troubleshooting

### Common Issues

**Wazuh Connection Problems:**
1. Verify Wazuh server is running and accessible
2. Check API credentials and permissions
3. Ensure network connectivity on port 55000
4. Review backend server logs for detailed errors

**Lynis Integration Issues:**
1. Confirm Lynis is installed: `lynis --version`
2. Check file permissions for Lynis execution
3. Verify system compatibility

**Performance Issues:**
1. Monitor browser console for JavaScript errors
2. Check network tab for failed API requests
3. Review backend server logs
4. Ensure adequate system resources

### Debug Mode

Enable detailed logging by checking browser console and backend server output:

```bash
# Backend logs
cd server
npm run dev  # Shows detailed request/response logs
```

## 🌐 Remote Server Integration

This framework supports **SSH-based remote server access** for executing security tools on distributed HPC infrastructure:

- **Remote Lynis Execution**: SSH into remote servers to run Lynis audits
- **Remote OpenSCAP Scanning**: Execute compliance scans on remote systems
- **Distributed Security Assessment**: Coordinate security tools across multiple servers
- **Centralized Reporting**: Aggregate results from multiple remote systems

*Note: SSH remote access functionality is available in the extended version of this framework.*

> **Note:** For advanced remote node assessment structure, SSH-based security auditing, and detailed operational guidance on Lynis and OpenSCAP integrations, please refer to the `remote-server-monitoring` branch. That branch contains:
> - In-depth documentation on secure remote compliance scanning
> - SSH authentication methods and best practices
> - Example directory structure for remote auditing workflows
> - Usage instructions for secure, agentless monitoring

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**


## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

For support, feature requests, or bug reports, please open an issue in the repository.

---

