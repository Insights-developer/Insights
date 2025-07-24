# Documentation Maintenance Checklist

**Company**: Lottery Analytics  
**Application**: Insights  
**Status**: In Development  

## After Each Coding Session

### 🔄 Automated Tasks (run `python3 insights_maintenance.py --all`)
- [ ] Update database schema documentation
- [ ] Refresh project structure 
- [ ] Create timestamped backup
- [ ] Validate documentation links
- [ ] Check git status

### 📝 Manual Review Tasks
- [ ] Update API_REFERENCE.md if endpoints changed
- [ ] Update RBAC_GUIDE.md if permissions changed  
- [ ] Update COMPONENT_PATTERNS.md if new patterns used
- [ ] Update BUSINESS_LOGIC.md if new entities added
- [ ] Update KNOWN_ISSUES.md if bugs fixed
- [ ] Update TESTING_GUIDE.md if new test procedures

### 📦 Before Commits
- [ ] Run `python3 insights_maintenance.py --all`
- [ ] Review generated LAST_MAINTENANCE.md
- [ ] Commit documentation changes
- [ ] Push to repository

## Weekly Maintenance

### 🧹 Cleanup Tasks
- [ ] Review backup directory size (`backups/`)
- [ ] Archive old backups (keep last 10)
- [ ] Review documentation for outdated information
- [ ] Check for broken external links
- [ ] Validate all code examples in documentation

### 📊 Quality Checks
- [ ] Ensure all .md files have company headers
- [ ] Verify cross-references are working
- [ ] Check that new features are documented
- [ ] Review README.md navigation accuracy

## Quick Commands Reference

### Daily Use
```bash
# Quick schema update after DB changes
python3 insights_maintenance.py --backup

# Full maintenance after coding session  
python3 insights_maintenance.py --all

# Check documentation links
python3 insights_maintenance.py --docs
```

### Database Operations
```bash
# Export latest schema
python3 insights_maintenance.py --backup
```

### Git Operations
```bash
# Standard documentation commit
git add .
git commit -m "Update documentation after coding session"
git push

# Emergency backup commit
git add DATABASE_SCHEMA* *.md
git commit -m "Emergency documentation backup"
git push
```

## Automation Ideas

### VS Code Tasks (add to `.vscode/tasks.json`)
```json
{
    "label": "Update Documentation",
    "type": "shell",
    "command": "python3 insights_maintenance.py --all",
    "group": "build",
    "presentation": {
        "echo": true,
        "reveal": "always"
    }
}
```

### Git Hooks
- **Pre-commit**: Run schema update if database files changed
- **Post-commit**: Auto-generate documentation summary
- **Pre-push**: Validate all documentation links

### GitHub Actions (future)
- Auto-run maintenance on push
- Generate documentation diff reports
- Auto-create backup releases

## File Organization

### 📁 Documentation Files (keep current)
- `README.md` - Navigation index
- `PROJECT_OVERVIEW.md` - Main summary  
- `DATABASE_SCHEMA_GENERATED.md` - Auto-generated schema
- All other `*.md` files - Domain-specific docs

### 💾 Backup Files (auto-generated)
- `backups/YYYYMMDD_HHMMSS/` - Timestamped backups
- `LAST_MAINTENANCE.md` - Latest session summary

### 🔧 Maintenance Scripts
- `insights_maintenance.py` - All-in-one maintenance tool

## Troubleshooting

### Common Issues
- **Schema update fails**: Check database connection in `.env` files
- **Git status issues**: Ensure all files are committed before maintenance
- **Broken links**: Use absolute paths for cross-references
- **Missing files**: Run full maintenance to regenerate

### Recovery Steps
1. Check `backups/` directory for recent files
2. Run `python3 insights_maintenance.py --backup` to regenerate schema
3. Run `python3 insights_maintenance.py --all` for full refresh
4. Commit and push all changes

---

*Consistent documentation maintenance ensures the Insights project remains well-documented and accessible to all developers.*
