# Contentstack Audit Log Analyzer

A powerful Next.js application for analyzing Contentstack audit logs with interactive visualizations and detailed insights.

## Features

### 📊 Comprehensive Analytics
- **Overview Dashboard**: Total events, unique users, organizations, and stacks
- **Time-based Analysis**: Events over time with interactive charts
- **Activity Heatmap**: Hourly activity patterns
- **User Activity**: Detailed user behavior analysis
- **Organization Insights**: Cross-organizational activity patterns
- **Content Type Analysis**: Content operations and usage patterns
- **Module Insights**: Platform module usage statistics

### 🎯 Key Insights
- **User Behavior**: Track user activity patterns, login/logout events, and content operations
- **Content Operations**: Monitor create, update, delete, publish, and unpublish activities
- **Launch Projects**: Analyze deployment patterns and Launch usage
- **Automate Workflows**: Track automation usage and patterns
- **Multi-org Analysis**: Compare activity across different organizations
- **Real-time Processing**: Client-side CSV processing with no server uploads

### 🔒 Privacy & Security
- **Local Processing**: All data processing happens in your browser
- **No Data Upload**: CSV files are never sent to any server
- **Secure Analysis**: Complete privacy for your audit log data

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cs-audit-log-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Usage

1. **Export Audit Logs from Contentstack**
   - Go to your Contentstack organization settings
   - Navigate to Audit Logs
   - Export your audit logs as CSV

2. **Upload and Analyze**
   - Drag and drop your CSV file into the upload area
   - Wait for processing (happens locally in your browser)
   - Explore the interactive dashboard

3. **Export Analysis**
   - Use the "Export Analysis" button to save your insights as JSON
   - Share reports with your team

## Dashboard Sections

### Overview
- Key metrics and summary statistics
- Events timeline chart
- Activity heatmap by hour

### Users
- Top active users
- User activity patterns
- Cross-organizational user analysis
- Event type breakdown per user

### Organizations
- Organization activity comparison
- User distribution across orgs
- Event patterns by organization

### Content Types
- Content type usage analysis
- Operation patterns (CRUD operations)
- User engagement with different content types

### Modules
- Platform module usage statistics
- Feature adoption analysis
- Module-specific event patterns

### Recent Activity
- Real-time activity feed
- Event details and context
- User and organization attribution

## Supported Audit Log Data

The analyzer processes standard Contentstack audit log CSV exports containing:

- **User Activities**: Login, logout, user management
- **Content Operations**: Create, update, delete, publish, unpublish entries
- **Asset Management**: Asset uploads, updates, and deletions
- **Launch Projects**: Deployment activities and project management
- **Automate Workflows**: Automation triggers and executions
- **Organization Management**: User invitations, role changes
- **Stack Operations**: Environment management, content type changes

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for interactive visualizations
- **CSV Processing**: PapaParse for client-side parsing
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for robust date operations

## Development

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard
│   ├── FileUpload.tsx     # File upload component
│   ├── OverviewCards.tsx  # Summary cards
│   ├── EventsChart.tsx    # Time series chart
│   ├── ActivityHeatmap.tsx # Hourly activity chart
│   ├── TopUsersTable.tsx  # User analysis table
│   ├── TopOrgsTable.tsx   # Organization table
│   ├── RecentActivityTable.tsx # Activity feed
│   ├── ModuleInsights.tsx # Module analysis
│   └── ContentTypeAnalysis.tsx # Content type insights
├── lib/                   # Utility libraries
│   ├── analytics.ts       # Data analysis functions
│   ├── csv-parser.ts      # CSV processing
│   └── utils.ts           # Helper functions
├── types/                 # TypeScript definitions
│   └── audit-log.ts       # Data type definitions
└── public/                # Static assets
```

### Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include sample data (anonymized) if possible

---

**Note**: This tool is designed for Contentstack audit log analysis and requires properly formatted CSV exports from the Contentstack platform.
