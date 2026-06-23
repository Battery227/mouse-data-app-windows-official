# InVivo Research Management Platform

A fully customizable, cross-platform application for managing any type of in vivo research. Works with mice, zebrafish, rats, flies, worms, primates, and any other species - completely customizable without code changes.

## ⚠️ IMPORTANT: Current Status & Known Limitations

**DO NOT USE FOR PRODUCTION DATA YET**

This application is currently undergoing critical fixes based on a comprehensive code audit. While the core architecture is solid, there are known issues that make it unsafe for real experiment data:

### Critical Issues Being Fixed
1. **Browser Mode Storage** - Data persistence is broken in browser/dev mode. Data will be lost on reload.
2. **False Save Indicators** - The app may show "Saved" when data is not actually persisted.
3. **Data Model Migration** - V1 and V2 data models are not fully integrated.

### Safe Usage
- ✅ **Desktop App (Tauri)** - More reliable but still being tested
- ⚠️ **Browser Mode** - DO NOT USE for real data (memory-only, data lost on reload)
- ✅ **Export Frequently** - Always export your data as backup

### What's Working
- ✅ Template system architecture (backend complete)
- ✅ Data validation system
- ✅ Export/Import functionality
- ✅ UI components and forms

### What's Being Fixed (Phase 0-2, ~2-3 weeks)
- 🔧 Storage layer with proper browser/desktop detection
- 🔧 Honest save status indicators
- 🔧 Complete V2 data model integration
- 🔧 Comprehensive test suite
- 🔧 Documentation accuracy

**See [AUDIT_ANALYSIS.md](AUDIT_ANALYSIS.md) for complete details and remediation plan.**

## 📚 V2 Data Model

This application uses a **V2 data model** with a specific structure. All developers must follow this structure to prevent bugs.

### Quick Reference

```javascript
// ✅ CORRECT V2 Structure
subject.subjectId              // Human-readable ID
subject.status = "alive"       // Lowercase status
subject.customFieldValues      // Custom fields object

// ❌ WRONG (V1 or incorrect)
subject.subject.identifier     // Wrong nesting
subject.status = "ALIVE"       // Wrong case
subject.genotype               // Wrong location
```

**📖 See [V2_MIGRATION_GUIDE.md](V2_MIGRATION_GUIDE.md) for complete documentation.**


---

## 🌟 Key Features

### Universal Compatibility
- ✅ **Any Species** - Mice, rats, zebrafish, flies, worms, primates, birds, custom organisms
- ✅ **Any Research Type** - Behavior, pharmacology, genetics, physiology, development
- ✅ **Any Assay** - Current and future assays supported through customization
- ✅ **Any Protocol** - Define custom schedules and timelines

### Powerful Customization
- ✅ **Template System** - Pre-built templates or create your own
- ✅ **Custom Fields** - Add unlimited fields with 11+ field types
- ✅ **Dynamic Forms** - Forms adapt to your template automatically
- ✅ **Validation** - Built-in data validation and quality checks
- ✅ **Conditional Fields** - Show/hide fields based on other values

### Data Management
- ✅ **Auto-Save** - Never lose your data
- ✅ **Export** - JSON (complete data) and CSV (for analysis)
- ✅ **Import** - Share data with colleagues
- ✅ **Backup** - Regular backups for long-term studies
- ✅ **Search & Filter** - Find data quickly

### Cross-Platform
- ✅ **Windows** - Full support
- ✅ **macOS** - Full support
- ✅ **Linux** - Full support
- ✅ **Offline-First** - Works without internet

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mouse-data-app-windows-official

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Build desktop app (Tauri)
npm run tauri build
```

### First Use

1. **Launch the app** - Open http://localhost:5173 in development
2. **Create a cage/housing unit** - Click "Add Cage" in the sidebar
3. **Add subjects** - Click on a cage to view subjects
4. **Record events** - Click on a subject to add events, measurements, treatments
5. **Export data** - Use the Export button to save your data

## 📚 Documentation

### For Users
- **[User Customization Guide](USER_CUSTOMIZATION_GUIDE.md)** - Complete guide to creating custom templates
- **[Implementation Guide](IMPLEMENTATION_GUIDE.md)** - How to use the system

### For Developers
- **[Architecture](ARCHITECTURE.md)** - Technical architecture and design
- **[Implementation Guide](IMPLEMENTATION_GUIDE.md)** - Integration and development guide

## 🎯 Built-in Templates

### Species-Specific
1. **Mouse Parkinson's Model (6-OHDA)**
   - Stereotaxic injection protocol
   - Behavioral testing timeline
   - 28-day complete protocol

2. **Zebrafish Development Study**
   - Developmental stage tracking
   - Water quality monitoring
   - Early development protocol

### Generic (Work with Any Species)
3. **Generic Research Study** - Flexible template for any research
4. **Behavioral Study** - Behavioral testing framework
5. **Pharmacology Study** - Drug testing and PK/PD

## 🔧 Creating Custom Templates

### Example: Drosophila Sleep Study

```javascript
import { TemplateBuilder, FieldBuilders } from './src/core/schema/templateBuilder';

const flyTemplate = new TemplateBuilder(
  'Drosophila Sleep Study',
  'Track sleep patterns in fruit flies'
)
  .setSpecies({
    name: 'Fruit Fly',
    pluralName: 'Fruit Flies',
    icon: '🪰',
    ageUnits: 'days',
    weightUnit: 'mg'
  })
  .addSubjectField(FieldBuilders.text('flyId', 'Fly ID', true))
  .addSubjectField(FieldBuilders.select('sex', 'Sex', ['Male', 'Female']))
  .setHousingUnit({
    name: 'Vial',
    pluralName: 'Vials',
    icon: '🧪',
    defaultCapacity: 20
  })
  .addEventType({
    name: 'Sleep Recording',
    category: 'measurement',
    fields: [
      FieldBuilders.number('totalSleep', 'Total Sleep', true, 'minutes'),
      FieldBuilders.number('sleepBouts', 'Sleep Bouts', true, 'count')
    ]
  })
  .build();
```

See [USER_CUSTOMIZATION_GUIDE.md](USER_CUSTOMIZATION_GUIDE.md) for complete examples.

## 📊 Data Export

### JSON Export
- Complete data with full structure
- Perfect for backup and sharing
- Preserves all relationships

### CSV Export
- Subjects, events, and summaries
- Ready for analysis in R, Python, Excel
- Multiple files for different data types

## 🎨 Field Types

The system supports 11+ field types:
- **text** - Single-line text
- **textarea** - Multi-line text
- **number** - Numeric values with validation
- **date/datetime/time** - Date and time pickers
- **select** - Dropdown menus
- **multiselect** - Multiple selections
- **checkbox** - Boolean values
- **email/url** - Validated inputs

## 🔒 Privacy & Security

- ✅ All data stored locally by default
- ✅ No telemetry or tracking
- ✅ No internet required
- ✅ Export for backup and sharing
- ✅ GDPR compliant

## 🛠️ Technology Stack

- **Frontend** - React 19 + Material-UI
- **State Management** - React hooks
- **Storage** - IndexedDB (browser) / SQLite (desktop)
- **Desktop** - Tauri (Rust)
- **Build** - Vite
- **Language** - JavaScript/TypeScript

## 📈 Scalability

Designed to handle:
- ✅ 10,000+ subjects
- ✅ Years of data
- ✅ Multiple concurrent experiments
- ✅ Large datasets for analysis

## 🤝 Contributing

Contributions welcome! Please read the [Implementation Guide](IMPLEMENTATION_GUIDE.md) for development setup.

## 📝 License

[Add your license here]

## 🆘 Support

For questions or issues:
1. Check the [User Customization Guide](USER_CUSTOMIZATION_GUIDE.md)
2. Review the [Architecture](ARCHITECTURE.md) document
3. Look at built-in template examples
4. Open an issue on GitHub

## 🎯 Roadmap

### Current (v2.0)
- ✅ Flexible schema system
- ✅ Template builder
- ✅ Dynamic forms
- ✅ Multi-format export
- ✅ Validation system

### Planned
- [ ] Template marketplace
- [ ] Advanced statistics
- [ ] Data visualization
- [ ] Cloud sync (optional)
- [ ] Mobile apps
- [ ] Collaboration features

## 🙏 Acknowledgments

Built for researchers, by researchers. Designed to adapt to YOUR needs, not force you to adapt to the software.

---

**Version**: 2.0.0-alpha
**Status**: ⚠️ ALPHA - Not Production Ready (See warnings above)
**Platform**: Cross-platform (Windows, macOS, Linux)
**Last Updated**: June 12, 2026

### Development Status
- **Phase 0** (In Progress): Critical safety fixes
- **Phase 1** (Planned): Storage layer rewrite
- **Phase 2** (Planned): V2 model integration
- **Phase 3** (Planned): Template UI integration
- **Phase 4** (Planned): Comprehensive testing
- **Phase 5** (Planned): Production polish

**Estimated Production Ready**: 3-4 weeks from June 12, 2026
