# InVivo Research Management Platform - Architecture

## Vision
A fully customizable, scalable platform for managing any type of in vivo research (mice, zebrafish, rats, etc.) with support for:
- Custom experiment templates
- Flexible data schemas
- Large dataset handling
- Advanced analysis and reporting
- Cross-platform compatibility
- Public release readiness

## Core Architecture Principles

### 1. Template-Based System
- **Experiment Templates**: Pre-configured setups for common research types
- **Custom Templates**: Users can create and save their own templates
- **Template Marketplace**: Future feature for sharing templates

### 2. Flexible Data Model
```
Project
├── Experiment Templates (reusable configurations)
├── Experiments (instances of templates)
│   ├── Housing Units (cages, tanks, etc.)
│   │   ├── Subjects (mice, fish, etc.)
│   │   │   ├── Events (actions, observations)
│   │   │   ├── Measurements (weight, behavior scores)
│   │   │   └── Custom Fields
│   │   └── Custom Fields
│   ├── Protocols (schedules, procedures)
│   └── Custom Fields
└── Analysis & Reports
```

### 3. Technology Stack

#### Current Stack
- **Frontend**: React + Material-UI
- **Storage**: IndexedDB (browser-based)
- **Desktop**: Tauri (Rust backend)

#### Recommended Upgrades for Scale
- **Database**: 
  - Keep IndexedDB for offline/local use
  - Add SQLite via Tauri for better performance with large datasets
  - Optional: PostgreSQL for server deployment
- **State Management**: Keep current approach, add Zustand for complex state
- **Data Export**: Add libraries for CSV, Excel, PDF generation
- **Charts**: Add Recharts or Chart.js for visualization
- **Validation**: Add Zod for schema validation

### 4. Data Schema Design

#### Core Entities
```typescript
// Template Definition
interface ExperimentTemplate {
  id: string;
  name: string;
  species: 'mouse' | 'zebrafish' | 'rat' | 'custom';
  description: string;
  
  // Customizable fields
  housingUnitConfig: {
    name: string; // "Cage", "Tank", etc.
    capacity: number;
    customFields: FieldDefinition[];
  };
  
  subjectConfig: {
    name: string; // "Mouse", "Fish", etc.
    requiredFields: string[]; // ['id', 'genotype', etc.]
    customFields: FieldDefinition[];
  };
  
  eventTypes: EventTypeDefinition[];
  measurementTypes: MeasurementTypeDefinition[];
  protocols: ProtocolDefinition[];
}

// Field Definition (for custom fields)
interface FieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[]; // for select/multiselect
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  defaultValue?: any;
}

// Event Type Definition
interface EventTypeDefinition {
  id: string;
  name: string;
  category: string;
  icon?: string;
  color?: string;
  fields: FieldDefinition[];
  allowTrials: boolean;
}

// Protocol Definition (schedules)
interface ProtocolDefinition {
  id: string;
  name: string;
  description: string;
  timeline: {
    day: number;
    events: string[]; // event type IDs
    notes?: string;
  }[];
}
```

### 5. Storage Strategy

#### Local Storage (Current)
- IndexedDB for browser-based usage
- Auto-save with debouncing
- Export/Import JSON for backup

#### Enhanced Storage (Phase 2)
- SQLite via Tauri for desktop app
- Indexed tables for fast queries
- Automatic backups
- Version control for data

#### Cloud Storage (Future)
- Optional cloud sync
- Multi-user collaboration
- Real-time updates

### 6. Performance Optimization

#### For Large Datasets
- Virtual scrolling for long lists
- Pagination for data tables
- Lazy loading of events/measurements
- Indexed database queries
- Web Workers for heavy computations

#### Memory Management
- Cleanup unused data
- Efficient state updates
- Memoization of expensive calculations

### 7. Export & Analysis

#### Export Formats
- JSON (full data)
- CSV (tabular data)
- Excel (formatted reports)
- PDF (printable reports)

#### Analysis Features
- Basic statistics (mean, median, std dev)
- Time-series analysis
- Group comparisons
- Custom calculations
- Visualization (charts, graphs)

### 8. UI/UX Design Principles

#### Clean & Intuitive
- Clear navigation hierarchy
- Consistent design language
- Helpful tooltips and guides
- Keyboard shortcuts

#### Flexible Layouts
- Customizable dashboards
- Drag-and-drop organization
- Collapsible sections
- Multi-view support

#### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode

## Implementation Phases

### Phase 1: Foundation (Current Sprint)
1. Fix critical bugs
2. Create flexible schema system
3. Build template engine
4. Improve data storage

### Phase 2: Customization UI
1. Template builder interface
2. Custom field editor
3. Protocol designer
4. Event type creator

### Phase 3: Enhanced Features
1. Advanced data export
2. Basic analysis tools
3. Visualization components
4. Search and filtering

### Phase 4: Polish & Scale
1. Performance optimization
2. UI/UX refinements
3. Documentation
4. Testing & QA

### Phase 5: Public Release
1. Packaging for distribution
2. User onboarding
3. Help system
4. Community features

## File Structure (Proposed)

```
src/
├── core/
│   ├── schema/           # Schema definitions and validation
│   ├── templates/        # Template system
│   ├── storage/          # Database abstraction layer
│   └── utils/            # Core utilities
├── features/
│   ├── experiments/      # Experiment management
│   ├── subjects/         # Subject (animal) management
│   ├── events/           # Event tracking
│   ├── protocols/        # Protocol/schedule management
│   ├── analysis/         # Data analysis
│   └── templates/        # Template builder UI
├── components/
│   ├── common/           # Reusable UI components
│   ├── forms/            # Form components
│   ├── tables/           # Data tables
│   └── charts/           # Visualization components
├── hooks/                # Custom React hooks
├── contexts/             # React contexts
└── types/                # TypeScript definitions
```

## Security & Privacy

### Data Protection
- All data stored locally by default
- Encryption for sensitive data
- No telemetry without consent
- GDPR compliance

### Access Control (Future)
- User authentication
- Role-based permissions
- Audit logging

## Extensibility

### Plugin System (Future)
- Custom analysis modules
- Third-party integrations
- Custom export formats
- API for external tools

## Testing Strategy

### Unit Tests
- Core logic and utilities
- Schema validation
- Data transformations

### Integration Tests
- Database operations
- State management
- Export/import

### E2E Tests
- Critical user workflows
- Cross-platform compatibility

## Documentation

### User Documentation
- Getting started guide
- Feature tutorials
- Best practices
- FAQ

### Developer Documentation
- API reference
- Architecture guide
- Contributing guidelines
- Code examples

## Deployment

### Desktop App (Tauri)
- Windows, macOS, Linux
- Auto-updates
- Offline-first

### Web App (Future)
- Progressive Web App
- Responsive design
- Cloud-hosted option

## Success Metrics

### Performance
- App load time < 2s
- Smooth UI (60fps)
- Handle 10,000+ subjects
- Export large datasets < 5s

### Usability
- Onboarding completion rate
- Feature adoption
- User satisfaction scores
- Support ticket volume

### Reliability
- 99.9% uptime (for cloud version)
- Zero data loss
- Automatic recovery
- Regular backups