#!/usr/bin/env python3
"""
Insights App - All-in-One Maintenance Tool

This script provides all maintenance functionality for the Insights lottery analytics application.
Run with menu interface or specific commands.

Usage:
    python3 insights_maintenance.py              # Interactive menu
    python3 insights_maintenance.py --backup     # Generate backup SQL
    python3 insights_maintenance.py --docs       # Update documentation  
    python3 insights_maintenance.py --structure  # Generate file structure
    python3 insights_maintenance.py --analyze    # Analyze codebase
    python3 insights_maintenance.py --test       # Test database connection
    python3 insights_maintenance.py --all        # Run all updates
    python3 insights_maintenance.py --help       # Show this help

Company: Lottery Analytics
Application: Insights
Status: In Development
"""

import os
import sys
import subprocess
import datetime
import argparse
import json
from pathlib import Path
from typing import Dict, List, Set, Any, Tuple, Optional

# Database connection imports
import re
from dotenv import dotenv_values
import psycopg2
from psycopg2 import OperationalError

# Constants
SQL_OUTPUT = "DATABASE_SCHEMA.SQL"
MD_OUTPUT = "DATABASE_SCHEMA_GENERATED.md"

class InsightsCodeAnalyzer:
    def __init__(self, workspace_root: Path):
        self.workspace_root = workspace_root
        self.frontend_dir = workspace_root / "frontend"
        
    def analyze_codebase(self) -> Dict[str, Any]:
        """Main method to analyze entire codebase and return structured data"""
        results = {
            "api_endpoints": self.extract_api_endpoints(),
            "feature_keys": self.extract_feature_keys(),
            "components": self.analyze_components(),
            "hooks": self.analyze_hooks(),
            "database_tables": self.extract_database_tables(),
            "type_definitions": self.extract_type_definitions(),
            "component_dependencies": self.analyze_component_dependencies(),
            "api_usage": self.analyze_api_usage(),
            "feature_usage": self.analyze_feature_usage(),
            "last_analyzed": self.get_git_info()
        }
        return results
    
    def extract_api_endpoints(self) -> List[Dict[str, Any]]:
        """Extract API endpoints and their parameters"""
        api_endpoints = []
        api_dir = self.frontend_dir / "app" / "api"
        
        if not api_dir.exists():
            return api_endpoints
        
        # Recursively find all route.ts/route.js files
        route_files = []
        for root, dirs, files in os.walk(api_dir):
            # Skip node_modules directories
            if "node_modules" in dirs:
                dirs.remove("node_modules")
                
            for file in files:
                if file.startswith("route.") and file.endswith((".ts", ".js")):
                    route_files.append(Path(root) / file)
        
        for route_file in route_files:
            # Determine API path based on directory structure
            relative_path = route_file.parent.relative_to(api_dir)
            api_path = f"/api/{relative_path}"
            
            try:
                content = route_file.read_text(encoding="utf-8")
                
                # Extract HTTP methods (GET, POST, PUT, DELETE, etc.)
                methods = []
                if re.search(r'export\s+async\s+function\s+GET\b', content):
                    methods.append("GET")
                if re.search(r'export\s+async\s+function\s+POST\b', content):
                    methods.append("POST") 
                if re.search(r'export\s+async\s+function\s+PUT\b', content):
                    methods.append("PUT")
                if re.search(r'export\s+async\s+function\s+DELETE\b', content):
                    methods.append("DELETE")
                if re.search(r'export\s+async\s+function\s+PATCH\b', content):
                    methods.append("PATCH")
                
                # Extract permissions using RBAC pattern
                required_features = []
                feature_matches = re.findall(r'features\.includes\([\'"]([^\'"]+)[\'"]\)', content)
                required_features.extend(feature_matches)
                
                # Try to extract request parameters
                parameters = []
                param_matches = re.findall(r'const\s+{\s*([^}]+)\s*}\s*=\s*await\s+req\.json\(\)', content)
                if param_matches:
                    for match in param_matches:
                        params = [p.strip() for p in match.split(',')]
                        parameters.extend(params)
                
                api_endpoints.append({
                    "path": str(api_path),
                    "methods": methods,
                    "required_features": required_features,
                    "parameters": parameters,
                    "file": str(route_file.relative_to(self.workspace_root))
                })
                
            except Exception as e:
                print(f"Error analyzing {route_file}: {e}")
        
        return api_endpoints
    
    def extract_feature_keys(self) -> List[Dict[str, Any]]:
        """Extract feature keys used in the codebase"""
        feature_keys = set()
        feature_usage = {}
        
        # Look for useRequireFeature calls
        tsx_files = []
        for ext in [".tsx", ".ts", ".jsx", ".js"]:
            for file in self.frontend_dir.glob(f"**/*{ext}"):
                # Skip node_modules
                if "node_modules" not in str(file):
                    tsx_files.append(file)
        
        for file in tsx_files:
            try:
                content = file.read_text(encoding="utf-8")
                
                # Look for useRequireFeature hook usage
                hook_matches = re.findall(r'useRequireFeature\([\'"]([^\'"]+)[\'"]\)', content)
                for feature in hook_matches:
                    feature_keys.add(feature)
                    if feature not in feature_usage:
                        feature_usage[feature] = []
                    feature_usage[feature].append(str(file.relative_to(self.workspace_root)))
                
                # Look for features.includes checks
                include_matches = re.findall(r'features\.includes\([\'"]([^\'"]+)[\'"]\)', content)
                for feature in include_matches:
                    feature_keys.add(feature)
                    if feature not in feature_usage:
                        feature_usage[feature] = []
                    feature_usage[feature].append(str(file.relative_to(self.workspace_root)))
            
            except Exception as e:
                print(f"Error analyzing {file}: {e}")
        
        # Convert to list of dictionaries
        result = []
        for key in sorted(feature_keys):
            result.append({
                "key": key,
                "used_in": feature_usage.get(key, [])
            })
        
        return result
    
    def analyze_components(self) -> List[Dict[str, Any]]:
        """Analyze React components in the codebase"""
        components = []
        component_dirs = [
            self.frontend_dir / "app" / "components",
            self.frontend_dir / "components"
        ]
        
        component_files = []
        for component_dir in component_dirs:
            if component_dir.exists():
                for ext in [".tsx", ".jsx", ".js"]:
                    for file in component_dir.glob(f"**/*{ext}"):
                        # Skip node_modules
                        if "node_modules" not in str(file):
                            component_files.append(file)
        
        for file in component_files:
            try:
                content = file.read_text(encoding="utf-8")
                
                # Extract component name
                name_match = re.search(r'export\s+default\s+function\s+(\w+)', content)
                if name_match:
                    component_name = name_match.group(1)
                else:
                    # Skip if no component found
                    continue
                
                # Check if client component
                is_client = 'use client' in content.lower()
                
                # Extract props interface/type
                props_match = re.search(r'(interface|type)\s+(\w+Props)\s*[=]?\s*', content)
                props_name = props_match.group(2) if props_match else None
                
                components.append({
                    "name": component_name,
                    "file": str(file.relative_to(self.workspace_root)),
                    "is_client": is_client,
                    "props_interface": props_name
                })
            
            except Exception as e:
                print(f"Error analyzing component {file}: {e}")
        
        return components
    
    def analyze_hooks(self) -> List[Dict[str, Any]]:
        """Analyze custom React hooks in the codebase"""
        hooks = []
        hook_dirs = [
            self.frontend_dir / "utils" / "hooks",
            self.frontend_dir / "app" / "hooks"
        ]
        
        hook_files = []
        for hook_dir in hook_dirs:
            if hook_dir.exists():
                for ext in [".tsx", ".ts", ".jsx", ".js"]:
                    for file in hook_dir.glob(f"**/*{ext}"):
                        # Skip node_modules
                        if "node_modules" not in str(file):
                            hook_files.append(file)
        
        for file in hook_files:
            try:
                content = file.read_text(encoding="utf-8")
                
                # Extract hook functions
                hook_matches = re.findall(r'export\s+function\s+(use\w+)', content)
                
                for hook_name in hook_matches:
                    # Try to extract hook purpose
                    purpose = None
                    comment_match = re.search(r'/\*\*\s*(.*?)\s*\*/', content, re.DOTALL)
                    if comment_match:
                        purpose = comment_match.group(1).strip()
                    
                    hooks.append({
                        "name": hook_name,
                        "file": str(file.relative_to(self.workspace_root)),
                        "purpose": purpose
                    })
            
            except Exception as e:
                print(f"Error analyzing hook {file}: {e}")
        
        return hooks
    
    def extract_database_tables(self) -> List[Dict[str, Any]]:
        """Extract database table usage from code"""
        tables = set()
        
        # Look in all TypeScript/JavaScript files
        ts_files = []
        for ext in [".tsx", ".ts", ".jsx", ".js"]:
            for file in self.frontend_dir.glob(f"**/*{ext}"):
                # Skip node_modules
                if "node_modules" not in str(file):
                    ts_files.append(file)
        
        for file in ts_files:
            try:
                content = file.read_text(encoding="utf-8")
                
                # Look for Supabase queries
                from_matches = re.findall(r'\.from\([\'"]([^\'"]+)[\'"]\)', content)
                tables.update(from_matches)
            
            except Exception as e:
                print(f"Error analyzing {file} for database tables: {e}")
        
        # Return sorted list of tables
        return sorted(list(tables))
    
    def get_git_info(self) -> Dict[str, str]:
        """Get git repository information"""
        try:
            import subprocess
            from datetime import datetime
            
            # Try to get git info, but don't fail if git commands fail
            try:
                git_commit = subprocess.run(["git", "rev-parse", "HEAD"], 
                                        capture_output=True, text=True, check=False)
                commit = git_commit.stdout.strip() if git_commit.returncode == 0 else "unknown"
            except:
                commit = "unknown"
                
            try:
                git_branch = subprocess.run(["git", "branch", "--show-current"], 
                                        capture_output=True, text=True, check=False)
                branch = git_branch.stdout.strip() if git_branch.returncode == 0 else "unknown"
            except:
                branch = "unknown"
            
            # Use Python's datetime instead of calling date command
            current_date = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
            
            return {
                "commit": commit,
                "branch": branch,
                "date": current_date
            }
        except Exception as e:
            print(f"Error getting git info: {e}")
            from datetime import datetime
            return {
                "commit": "unknown",
                "branch": "unknown",
                "date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            
    def extract_type_definitions(self) -> List[Dict[str, Any]]:
        """Extract TypeScript interfaces, types, and enums from the codebase"""
        type_defs = []
        
        # Find TypeScript files
        ts_files = []
        for ext in [".ts", ".tsx"]:
            for file in self.frontend_dir.glob(f"**/*{ext}"):
                # Skip node_modules
                if "node_modules" not in str(file):
                    ts_files.append(file)
        
        for file in ts_files:
            try:
                content = file.read_text(encoding="utf-8")
                
                # Look for interfaces
                interface_matches = re.finditer(r'(export\s+)?interface\s+(\w+)(?:<[^>]*>)?\s*{([^}]+)}', content, re.DOTALL)
                for match in interface_matches:
                    is_exported = bool(match.group(1))
                    interface_name = match.group(2)
                    interface_body = match.group(3).strip()
                    
                    # Parse properties
                    properties = []
                    for prop_line in interface_body.split('\n'):
                        prop_match = re.search(r'(\w+)(\??):\s*([^;/]+)', prop_line)
                        if prop_match:
                            prop_name = prop_match.group(1)
                            is_optional = bool(prop_match.group(2))
                            prop_type = prop_match.group(3).strip()
                            properties.append({
                                "name": prop_name,
                                "type": prop_type,
                                "optional": is_optional
                            })
                    
                    type_defs.append({
                        "kind": "interface",
                        "name": interface_name,
                        "file": str(file.relative_to(self.workspace_root)),
                        "exported": is_exported,
                        "properties": properties
                    })
                
                # Look for type aliases
                type_matches = re.finditer(r'(export\s+)?type\s+(\w+)(?:<[^>]*>)?\s*=\s*([^;]+);', content)
                for match in type_matches:
                    is_exported = bool(match.group(1))
                    type_name = match.group(2)
                    type_value = match.group(3).strip()
                    
                    type_defs.append({
                        "kind": "type",
                        "name": type_name,
                        "file": str(file.relative_to(self.workspace_root)),
                        "exported": is_exported,
                        "value": type_value
                    })
                
                # Look for enums
                enum_matches = re.finditer(r'(export\s+)?enum\s+(\w+)\s*{([^}]+)}', content, re.DOTALL)
                for match in enum_matches:
                    is_exported = bool(match.group(1))
                    enum_name = match.group(2)
                    enum_body = match.group(3).strip()
                    
                    # Parse values
                    values = []
                    for val_line in enum_body.split('\n'):
                        val_match = re.search(r'(\w+)(?:\s*=\s*([^,]+))?', val_line)
                        if val_match:
                            val_name = val_match.group(1)
                            val_value = val_match.group(2) if val_match.group(2) else None
                            values.append({
                                "name": val_name,
                                "value": val_value
                            })
                    
                    type_defs.append({
                        "kind": "enum",
                        "name": enum_name,
                        "file": str(file.relative_to(self.workspace_root)),
                        "exported": is_exported,
                        "values": values
                    })
            
            except Exception as e:
                print(f"Error analyzing types in {file}: {e}")
        
        return type_defs
    
    def analyze_component_dependencies(self) -> Dict[str, List[str]]:
        """Analyze dependencies between components"""
        dependencies = {}
        component_files = []
        
        # Find component files
        for ext in [".tsx", ".jsx"]:
            for file in self.frontend_dir.glob(f"**/*{ext}"):
                # Skip node_modules
                if "node_modules" not in str(file):
                    component_files.append(file)
        
        # First pass: identify component names
        component_names = set()
        for file in component_files:
            try:
                file_name = file.stem
                content = file.read_text(encoding="utf-8")
                
                # Look for component definition
                comp_match = re.search(r'function\s+(\w+)', content)
                if comp_match:
                    component_names.add(comp_match.group(1))
            except Exception:
                pass
        
        # Second pass: analyze dependencies
        for file in component_files:
            try:
                content = file.read_text(encoding="utf-8")
                
                # Get component name
                comp_match = re.search(r'function\s+(\w+)', content)
                if not comp_match:
                    continue
                    
                component_name = comp_match.group(1)
                dependencies[component_name] = []
                
                # Check for component usage
                for other_comp in component_names:
                    # Skip self-references
                    if other_comp == component_name:
                        continue
                        
                    # Look for component used as JSX tag
                    if re.search(rf'<{other_comp}[\s/>]', content) or re.search(rf'<{other_comp}$', content):
                        dependencies[component_name].append(other_comp)
            
            except Exception as e:
                print(f"Error analyzing component dependencies in {file}: {e}")
        
        return dependencies
    
    def analyze_api_usage(self) -> Dict[str, List[Dict[str, Any]]]:
        """Analyze where and how API endpoints are used"""
        api_usage = {}
        
        # Get API endpoints
        api_endpoints = self.extract_api_endpoints()
        endpoint_paths = [endpoint["path"] for endpoint in api_endpoints]
        
        # Find all TypeScript/JavaScript files
        ts_files = []
        for ext in [".ts", ".tsx", ".js", ".jsx"]:
            for file in self.frontend_dir.glob(f"**/*{ext}"):
                # Skip node_modules and api definition files
                if "node_modules" not in str(file) and "/api/" not in str(file):
                    ts_files.append(file)
        
        # Look for API calls
        for file in ts_files:
            try:
                content = file.read_text(encoding="utf-8")
                
                for endpoint in endpoint_paths:
                    # Skip generic paths like "/api"
                    if endpoint == "/api":
                        continue
                        
                    # Look for fetch calls with this endpoint
                    endpoint_escaped = re.escape(endpoint)
                    fetch_matches = re.finditer(rf'fetch\([\'"`]{endpoint_escaped}[\'"`]', content)
                    axios_matches = re.finditer(rf'\.(get|post|put|delete)\([\'"`]{endpoint_escaped}[\'"`]', content)
                    
                    # Combine matches
                    matches = list(fetch_matches) + list(axios_matches)
                    
                    if matches:
                        if endpoint not in api_usage:
                            api_usage[endpoint] = []
                            
                        # Get context around the API call
                        for match in matches:
                            start_pos = max(0, match.start() - 100)
                            end_pos = min(len(content), match.end() + 100)
                            context = content[start_pos:end_pos]
                            
                            # Try to extract function name
                            func_match = re.search(r'function\s+(\w+)', content[:match.start()][::-1])
                            function_name = func_match.group(1)[::-1] if func_match else None
                            
                            api_usage[endpoint].append({
                                "file": str(file.relative_to(self.workspace_root)),
                                "function": function_name,
                                "snippet": context.strip()
                            })
            
            except Exception as e:
                print(f"Error analyzing API usage in {file}: {e}")
        
        return api_usage
    
    def analyze_feature_usage(self) -> Dict[str, List[Dict[str, str]]]:
        """Analyze where and how feature flags are used"""
        feature_usage = {}
        
        # Get feature keys
        feature_keys = []
        features = self.extract_feature_keys()
        for feature in features:
            if isinstance(feature, dict) and "key" in feature:
                feature_keys.append(feature["key"])
            elif isinstance(feature, str):
                feature_keys.append(feature)
        
        # Find all TypeScript/JavaScript files
        ts_files = []
        for ext in [".ts", ".tsx", ".js", ".jsx"]:
            for file in self.frontend_dir.glob(f"**/*{ext}"):
                # Skip node_modules
                if "node_modules" not in str(file):
                    ts_files.append(file)
        
        # Look for feature flag usage
        for file in ts_files:
            try:
                content = file.read_text(encoding="utf-8")
                
                for feature in feature_keys:
                    # Look for various feature check patterns
                    patterns = [
                        rf'useRequireFeature\([\'"`]{feature}[\'"`]\)',
                        rf'features\.includes\([\'"`]{feature}[\'"`]\)',
                        rf'hasFeature\([\'"`]{feature}[\'"`]\)'
                    ]
                    
                    for pattern in patterns:
                        matches = list(re.finditer(pattern, content))
                        
                        if matches:
                            if feature not in feature_usage:
                                feature_usage[feature] = []
                                
                            for match in matches:
                                # Get context (component or function)
                                lines = content[:match.start()].split('\n')
                                context = "Unknown"
                                
                                # Try to find component or function context
                                for i in range(len(lines) - 1, -1, -1):
                                    comp_match = re.search(r'function\s+(\w+)', lines[i])
                                    if comp_match:
                                        context = comp_match.group(1)
                                        break
                                
                                feature_usage[feature].append({
                                    "file": str(file.relative_to(self.workspace_root)),
                                    "context": context,
                                    "usage_type": "component" if file.suffix == ".tsx" else "utility"
                                })
            
            except Exception as e:
                print(f"Error analyzing feature usage in {file}: {e}")
        
        return feature_usage

class InsightsMaintenance:
    def __init__(self):
        self.workspace_root = Path.cwd()
        self.backup_dir = self.workspace_root / "backups"
        
    def print_header(self, title):
        """Print a formatted header"""
        print(f"\n{'=' * 60}")
        print(f"🚀 {title}")
        print('=' * 60)
    
    def print_section(self, title):
        """Print a formatted section header"""
        print(f"\n📋 {title}")
        print('-' * 40)
    
    def run_command(self, command, description):
        """Run a shell command and return success status"""
        print(f"🔄 {description}...")
        try:
            result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=str(self.workspace_root))
            if result.returncode == 0:
                print(f"✅ {description} - Complete")
                return True, result.stdout
            else:
                print(f"❌ {description} - Failed: {result.stderr}")
                return False, result.stderr
        except Exception as e:
            print(f"❌ {description} - Error: {str(e)}")
            return False, str(e)

    # ===== DATABASE OPERATIONS =====
    
    def get_postgres_credentials(self):
        """Get PostgreSQL connection credentials from environment files"""
        env_paths = [
            self.workspace_root / "frontend" / ".env.development.local",
            self.workspace_root / "frontend" / ".env.local",
        ]
        env = {}
        for path in env_paths:
            if path.exists():
                env.update(dotenv_values(str(path)))
        
        url = env.get("POSTGRES_URL")
        if not url:
            raise RuntimeError("POSTGRES_URL not found in env files.")
        
        m = re.match(r"^postgres://([^:]+):([^@]+)@([^:/]+):(\d+)/([^?]+)", url)
        if not m:
            raise RuntimeError(f"Could not parse POSTGRES_URL: {url}")
        
        user, password, host, orig_port, dbname = m.groups()
        port = 5432  # Force non-pooling for DDL support
        
        return {
            "host": host,
            "port": port,
            "user": user,
            "password": password,
            "dbname": dbname,
            "sslmode": "require"
        }

    def test_database_connection(self):
        """Test database connection"""
        self.print_section("Database Connection Test")
        try:
            params = self.get_postgres_credentials()
            print(f"🔗 Connecting to PostgreSQL at {params['host']}:{params['port']} as {params['user']}...")
            
            conn = psycopg2.connect(**params)
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            cursor.close()
            conn.close()
            
            print(f"✅ Database connection successful!")
            print(f"📊 PostgreSQL version: {version}")
            return True
            
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
            
    def run_all_updates(self):
        """Run all maintenance operations"""
        self.print_header("Running All Maintenance Operations")
        
        # Run all operations
        self.generate_backup_sql()
        self.update_documentation()
        self.generate_file_structure()
        self.analyze_codebase()
        self.test_database_connection()
        
        print("\n✅ All maintenance operations completed successfully!")
        
    def show_interactive_menu(self):
        """Show interactive menu for maintenance operations"""
        while True:
            self.print_header("Insights App Maintenance")
            
            print("Choose an operation:")
            print("1. 💾 Generate Backup SQL")
            print("2. 📝 Update Documentation")
            print("3. 🗂️ Generate File Structure")
            print("4. 🔍 Analyze Codebase")
            print("5. 🔗 Test Database Connection")
            print("6. 🚀 Run All Operations")
            print("0. ❌ Exit")
            
            choice = input("\nEnter your choice (0-6): ")
            
            if choice == "1":
                self.generate_backup_sql()
            elif choice == "2":
                self.update_documentation()
            elif choice == "3":
                self.generate_file_structure()
            elif choice == "4":
                self.analyze_codebase()
            elif choice == "5":
                self.test_database_connection()
            elif choice == "6":
                self.run_all_updates()
            elif choice == "0":
                print("\n👋 Goodbye!")
                break
            else:
                print("\n❌ Invalid choice. Please try again.")
                
            input("\nPress Enter to continue...")
            
    def analyze_codebase(self):
        """Analyze codebase and generate insights about API endpoints, components, etc."""
        self.print_section("Codebase Analysis")
        
        try:
            print("🔍 Analyzing codebase structure...")
            
            # Initialize analyzer
            analyzer = InsightsCodeAnalyzer(self.workspace_root)
            
            # Perform analysis
            analysis_results = analyzer.analyze_codebase()
            
            # Save analysis to JSON file
            output_file = self.workspace_root / "code_analysis.json"
            with open(output_file, 'w') as f:
                json.dump(analysis_results, f, indent=2)
                
            # Print summary
            self.print_analysis_summary(analysis_results)
            
            print(f"✅ Analysis completed successfully")
            print(f"📝 Results saved to {output_file.name}")
            
            # Update COPILOT_OVERVIEW.md with code insights
            self.update_copilot_overview_with_analysis(analysis_results)
            
            return True
            
        except Exception as e:
            print(f"❌ Analysis failed: {e}")
            return False
            
    def print_analysis_summary(self, analysis):
        """Print a summary of the code analysis results"""
        # Handle both old and new API format
        if isinstance(analysis.get('components', {}), dict):
            component_count = sum(len(comps) for comps in analysis.get('components', {}).values())
        else:
            component_count = len(analysis.get('components', []))
        
        print(f"📊 Analysis Summary:")
        print(f"   API Endpoints: {len(analysis.get('api_endpoints', []))} found")
        print(f"   Features: {len(analysis.get('feature_keys', []))} found")
        print(f"   Components: {component_count} found")
        print(f"   Custom Hooks: {len(analysis.get('hooks', []))} found")
        print(f"   Database Tables: {len(analysis.get('database_tables', []))} found")
        
        # New analysis types
        print(f"   Type Definitions: {len(analysis.get('type_definitions', []))} found")
        
        component_deps = analysis.get('component_dependencies', {})
        api_usage = analysis.get('api_usage', {})
        feature_usage = analysis.get('feature_usage', {})
        
        print(f"   Component Dependencies: {len(component_deps)} relationships found")
        print(f"   API Usage: {len(api_usage)} endpoints referenced")
        print(f"   Feature Usage: {len(feature_usage)} features used in code")
        
    def update_copilot_overview_with_analysis(self, analysis):
        """Update the COPILOT_OVERVIEW.md file with code analysis insights"""
        copilot_overview_path = self.workspace_root / "COPILOT_OVERVIEW.md"
        
        if not copilot_overview_path.exists():
            print("⚠️  COPILOT_OVERVIEW.md not found, skipping update")
            return
        
        try:
            # Read current content
            content = copilot_overview_path.read_text()
            
            # Prepare code insights section
            code_insights = self.format_code_insights_section(analysis)
            
            # Check if code insights section exists
            if "## Code Insights" in content:
                # Update existing section
                pattern = r'## Code Insights.*?(?=\n## |$)'
                updated_content = re.sub(pattern, code_insights, content, flags=re.DOTALL)
            else:
                # Add new section before the end
                updated_content = content
                if "## Known Issues" in content:
                    # Insert before Known Issues
                    updated_content = content.replace("## Known Issues", f"{code_insights}\n\n## Known Issues")
                else:
                    # Append at the end
                    updated_content = f"{content}\n\n{code_insights}"
            
            # Save updated content
            copilot_overview_path.write_text(updated_content)
            print(f"✅ Updated COPILOT_OVERVIEW.md with code insights")
            
        except Exception as e:
            print(f"⚠️  Failed to update COPILOT_OVERVIEW.md: {e}")
            
    def format_code_insights_section(self, analysis):
        """Format code analysis data as markdown for COPILOT_OVERVIEW.md"""
        lines = [
            "## Code Insights",
            "",
            "This section contains automatically generated insights about the codebase structure.",
            "It helps AI assistants understand the application architecture without extensive exploration.",
            "",
            "### API Structure",
            f"*The application has {len(analysis.get('api_endpoints', []))} API endpoints:*",
            ""
        ]
        
        # Add API endpoints
        for endpoint in analysis.get('api_endpoints', [])[:10]:
            methods = ", ".join(endpoint.get('methods', []))
            lines.append(f"- **{endpoint.get('path', '')}** ({methods})")
        
        if len(analysis.get('api_endpoints', [])) > 10:
            lines.append(f"- *...and {len(analysis.get('api_endpoints', [])) - 10} more endpoints*")
        
        lines.append("")
        
        # Add components - handle both formats
        if isinstance(analysis.get('components', {}), dict):
            component_count = sum(len(comps) for comps in analysis.get('components', {}).values())
            lines.append("### Component Structure")
            lines.append(f"*The application has {component_count} React components organized as follows:*")
            lines.append("")
            
            for comp_type, components in analysis.get('components', {}).items():
                if components:
                    lines.append(f"- **{comp_type.capitalize()} components**: {len(components)} components")
        else:
            components = analysis.get('components', [])
            lines.append("### Component Structure")
            lines.append(f"*The application has {len(components)} React components*")
            lines.append("")
            
            # Display top 5 components
            if components:
                for i, comp in enumerate(components[:5]):
                    comp_name = comp.get('name', 'Unknown')
                    comp_file = comp.get('file', '')
                    lines.append(f"- **{comp_name}** - `{comp_file}`")
                
                if len(components) > 5:
                    lines.append(f"- *...and {len(components) - 5} more components*")
        
        lines.append("")
        lines.append("### Features")
        
        # Handle both formats for features
        if isinstance(analysis.get('feature_keys', []), list):
            features = analysis.get('feature_keys', [])
            feature_key = "key" if features and isinstance(features[0], dict) else None
            
            lines.append(f"*The application has {len(features)} feature flags:*")
            lines.append("")
            
            for idx, feature in enumerate(features[:10]):
                if feature_key and feature_key in feature:
                    lines.append(f"- `{feature[feature_key]}`")
                elif isinstance(feature, str):
                    lines.append(f"- `{feature}`")
                
                if idx >= 9 and len(features) > 10:
                    lines.append(f"- *...and {len(features) - 10} more features*")
                    break
        else:
            lines.append("*No feature flags found*")
        
        lines.append("")
        
        # Add TypeScript types section
        types = analysis.get('type_definitions', [])
        if types:
            lines.append("### TypeScript Type Definitions")
            lines.append(f"*The application has {len(types)} type definitions:*")
            lines.append("")
            
            # Group by kind
            interfaces = [t for t in types if t.get('kind') == 'interface']
            type_aliases = [t for t in types if t.get('kind') == 'type']
            enums = [t for t in types if t.get('kind') == 'enum']
            
            if interfaces:
                lines.append(f"**Interfaces ({len(interfaces)})**")
                for interface in interfaces[:5]:
                    name = interface.get('name', 'Unknown')
                    file = interface.get('file', '')
                    prop_count = len(interface.get('properties', []))
                    lines.append(f"- `{name}` - {prop_count} properties - `{file}`")
                if len(interfaces) > 5:
                    lines.append(f"- *...and {len(interfaces) - 5} more interfaces*")
                lines.append("")
                
            if type_aliases:
                lines.append(f"**Type Aliases ({len(type_aliases)})**")
                for type_alias in type_aliases[:5]:
                    name = type_alias.get('name', 'Unknown')
                    file = type_alias.get('file', '')
                    lines.append(f"- `{name}` - `{file}`")
                if len(type_aliases) > 5:
                    lines.append(f"- *...and {len(type_aliases) - 5} more type aliases*")
                lines.append("")
                
            if enums:
                lines.append(f"**Enums ({len(enums)})**")
                for enum in enums[:5]:
                    name = enum.get('name', 'Unknown')
                    file = enum.get('file', '')
                    value_count = len(enum.get('values', []))
                    lines.append(f"- `{name}` - {value_count} values - `{file}`")
                if len(enums) > 5:
                    lines.append(f"- *...and {len(enums) - 5} more enums*")
                lines.append("")
        
        # Add component dependencies section
        dependencies = analysis.get('component_dependencies', {})
        if dependencies:
            lines.append("### Component Dependencies")
            lines.append(f"*The application has {len(dependencies)} components with dependencies:*")
            lines.append("")
            
            # Show top 5 components with the most dependencies
            top_components = sorted(dependencies.items(), key=lambda x: len(x[1]), reverse=True)[:5]
            for component, deps in top_components:
                if deps:
                    lines.append(f"- `{component}` depends on: {', '.join([f'`{d}`' for d in deps[:3]])}")
                    if len(deps) > 3:
                        lines.append(f"  - *...and {len(deps) - 3} more components*")
            lines.append("")
        
        # Add API usage section
        api_usage = analysis.get('api_usage', {})
        if api_usage:
            lines.append("### API Usage")
            lines.append(f"*The application has {len(api_usage)} API endpoints used in code:*")
            lines.append("")
            
            # Show top 5 most used API endpoints
            top_apis = sorted(api_usage.items(), key=lambda x: len(x[1]), reverse=True)[:5]
            for endpoint, usages in top_apis:
                lines.append(f"- `{endpoint}` - Used in {len(usages)} locations")
            lines.append("")
        
        # Add feature usage section
        feature_usage = analysis.get('feature_usage', {})
        if feature_usage:
            lines.append("### Feature Flag Usage")
            lines.append(f"*Feature flags are used in {sum(len(usages) for usages in feature_usage.values())} locations:*")
            lines.append("")
            
            # Show top 5 most used features
            top_features = sorted(feature_usage.items(), key=lambda x: len(x[1]), reverse=True)[:5]
            for feature, usages in top_features:
                lines.append(f"- `{feature}` - Used in {len(usages)} locations")
            lines.append("")
        
        lines.append(f"*Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*")
        
        return "\n".join(lines)

    def fetch_schema(self, connection):
        """Fetch complete schema information from database"""
        schema = {}
        with connection.cursor() as cur:
            # Fetch all public tables
            cur.execute("""
                SELECT tablename
                FROM pg_tables
                WHERE schemaname = 'public'
                ORDER BY tablename;
            """)
            tables = [row[0] for row in cur.fetchall()]
            
            for table in tables:
                schema[table] = {}

                # Columns
                cur.execute("""
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = %s
                    ORDER BY ordinal_position;
                """, (table,))
                schema[table]['columns'] = cur.fetchall()

                # Primary Keys
                cur.execute("""
                    SELECT a.attname
                    FROM   pg_index i
                    JOIN   pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                    WHERE  i.indrelid = %s::regclass AND i.indisprimary;
                """, (table,))
                schema[table]['primary_keys'] = [row[0] for row in cur.fetchall()]

                # Foreign Keys
                cur.execute("""
                    SELECT
                      kcu.column_name,
                      ccu.table_name AS ref_table,
                      ccu.column_name AS ref_column
                    FROM information_schema.table_constraints AS tc
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                      AND tc.table_name = %s
                      AND tc.table_schema = 'public';
                """, (table,))
                schema[table]['foreign_keys'] = cur.fetchall()

                # Indexes
                cur.execute("""
                    SELECT indexname, indexdef
                    FROM pg_indexes
                    WHERE schemaname = 'public' AND tablename = %s
                """, (table,))
                schema[table]['indexes'] = cur.fetchall()

                # Triggers
                cur.execute("""
                    SELECT tg.tgname, 
                           tg.tgenabled, 
                           pg_get_triggerdef(tg.oid),
                           p.proname,
                           l.lanname,
                           pg_get_functiondef(tg.tgfoid)
                    FROM pg_trigger tg
                    JOIN pg_proc p ON tg.tgfoid = p.oid
                    JOIN pg_language l ON p.prolang = l.oid
                    WHERE tg.tgrelid = %s::regclass AND NOT tg.tgisinternal;
                """, (table,))
                schema[table]['triggers'] = cur.fetchall()
        return schema

    def write_schema_sql(self, schema, filepath):
        """Generate SQL DDL export"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write("-- Database Schema DDL Export\n\n")
            for table, details in schema.items():
                f.write(f"-- Table: {table}\n")
                f.write(f"CREATE TABLE {table} (\n")
                lines = []
                for col in details['columns']:
                    colname, datatype, nullable, default = col
                    line = f"  {colname} {datatype}"
                    if nullable == "NO":
                        line += " NOT NULL"
                    if default:
                        line += f" DEFAULT {default}"
                    lines.append(line)
                if details['primary_keys']:
                    lines.append(f"  PRIMARY KEY ({', '.join(details['primary_keys'])})")
                f.write(",\n".join(lines))
                f.write("\n);\n")

                # Foreign keys
                if details['foreign_keys']:
                    for fk in details['foreign_keys']:
                        col, reftable, refcol = fk
                        f.write(f"ALTER TABLE {table} ADD FOREIGN KEY ({col}) REFERENCES {reftable}({refcol});\n")

                # Indexes
                if details['indexes']:
                    for idx in details['indexes']:
                        if idx[1].startswith('CREATE INDEX') or idx[1].startswith('CREATE UNIQUE INDEX'):
                            f.write(f"{idx[1]};\n")

                # Triggers
                if details.get('triggers'):
                    for trig in details['triggers']:
                        trig_name, enabled, defn, funcname, lang, funcdef = trig
                        f.write(f"\n-- Trigger: {trig_name} on {table}\n")
                        f.write(f"{defn.strip()};\n")
                        f.write(f"-- Function for Trigger: {funcname}\n")
                        f.write(f"{funcdef.strip()}\n")
                f.write("\n")

    def get_table_category(self, table_name):
        """Categorize tables by their purpose"""
        if table_name in ['users', 'login_history']:
            return ('👥 User Management Tables', 1)
        elif table_name in ['access_groups', 'features', 'user_access_groups', 'access_group_features']:
            return ('🔐 Access Group Permission Tables', 2)
        elif table_name in ['games', 'draws', 'insight_templates']:
            return ('🎮 Business Logic Tables', 3)
        elif table_name in ['contact_messages', 'notifications']:
            return ('💬 Communication Tables', 4)
        elif table_name in ['uploads']:
            return ('📁 File Management Tables', 5)
        else:
            return ('🔧 System Tables', 6)

    def get_table_description(self, table_name):
        """Get description for each table"""
        descriptions = {
            'users': 'Core user information and authentication data',
            'login_history': 'Detailed login audit trail',
            'access_groups': 'Logical groupings of users with similar access needs',
            'features': 'Define app capabilities that can be granted or restricted',
            'user_access_groups': 'Many-to-many relationship between users and access groups',
            'access_group_features': 'Many-to-many relationship between groups and features',
            'games': 'Define lottery games available for tracking',
            'draws': 'Record actual lottery draw results',
            'insight_templates': 'Define reusable analysis templates',
            'contact_messages': 'Store contact form submissions',
            'notifications': 'In-app notification system',
            'uploads': 'Track file uploads and blob storage'
        }
        return descriptions.get(table_name, f'Database table: {table_name}')

    def get_column_comment(self, table_name, column_name):
        """Get meaningful comments for important columns"""
        comments = {
            'users': {
                'id': 'UUID from Supabase Auth',
                'email': 'Unique email address',
                'role': 'Legacy field (deprecated)',
                'username': 'Optional display name',
                'phone': 'Optional contact info',
                'current_login_at': 'Current session start',
                'previous_login_at': 'Previous session start',
                'login_count': 'Total login count (default: 0)',
                'is_active': 'Account status (default: true)'
            },
            'features': {
                'key': 'Unique identifier (e.g., "admin_dashboard")',
                'name': 'Human-readable name',
                'nav_name': 'Navigation display name',
                'type': "'page', 'card', 'widget', etc.",
                'order': 'Display order (default: 0)',
                'active': 'Enable/disable (default: true)'
            },
            'draws': {
                'results': 'Main numbers drawn',
                'bonus': 'Bonus/powerball numbers',
                'draw_date': 'When the draw occurred'
            },
            'games': {
                'config': 'Game-specific configuration (JSON)'
            }
        }
        return comments.get(table_name, {}).get(column_name, '')

    def write_schema_md(self, schema, filepath):
        """Generate comprehensive markdown documentation"""
        with open(filepath, "w", encoding="utf-8") as f:
            # Header
            f.write("# Insights App Database Schema Documentation\n\n")
            f.write("> **Auto-Generated**: This file was automatically generated from the live database schema  \n")
            f.write(f"> **Generated On**: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  \n")
            f.write("> **Source**: Insights Maintenance Tool  \n\n")
            
            f.write("## Overview\n")
            f.write("The Insights app uses a PostgreSQL database with a sophisticated Access Group permission system. ")
            f.write("The schema supports lottery game management, user authentication, and flexible permission management.\n\n")
            
            f.write("## Database Architecture\n\n")
            f.write("### Core Concepts\n")
            f.write("- **Users**: Authenticated via Supabase, stored in custom users table\n")
            f.write("- **Access Groups**: Group-based permissions using access groups and features\n")
            f.write("- **Games & Draws**: Lottery game management and draw tracking\n")
            f.write("- **Insights**: Analytics and pattern recognition templates\n")
            f.write("- **Audit Trail**: Login history and activity tracking\n\n")
            
            f.write("### Schema Version\n")
            f.write("Auto-generated from live database  \n")
            f.write("Primary Schema File: `/frontend/schema/database-schema.sql`\n\n")
            
            f.write("---\n\n")
            f.write("## Table Definitions\n\n")
            
            # Group tables by category
            categorized_tables = {}
            for table_name in schema.keys():
                category, order = self.get_table_category(table_name)
                if category not in categorized_tables:
                    categorized_tables[category] = []
                categorized_tables[category].append(table_name)
            
            # Sort categories by order
            sorted_categories = sorted(categorized_tables.items(), key=lambda x: self.get_table_category(list(x[1])[0])[1])
            
            for category, tables in sorted_categories:
                f.write(f"### {category}\n\n")
                
                for table in sorted(tables):
                    details = schema[table]
                    description = self.get_table_description(table)
                    
                    f.write(f"#### `{table}`\n")
                    f.write(f"**Purpose**: {description}\n")
                    
                    # Generate CREATE TABLE statement
                    f.write("```sql\n")
                    f.write(f"CREATE TABLE {table} (\n")
                    lines = []
                    for col in details['columns']:
                        colname, datatype, nullable, default = col
                        line = f"    {colname} {datatype.upper()}"
                        if nullable == "NO":
                            line += " NOT NULL"
                        if default:
                            if default.startswith("nextval"):
                                line += " PRIMARY KEY"
                            else:
                                line += f" DEFAULT {default}"
                        
                        # Add comment if available
                        comment = self.get_column_comment(table, colname)
                        if comment:
                            line += f",{' ' * max(1, 40 - len(line))}-- {comment}"
                        
                        lines.append(line)
                    
                    if details['primary_keys'] and not any("PRIMARY KEY" in line for line in lines):
                        pk_line = f"    PRIMARY KEY ({', '.join(details['primary_keys'])})"
                        lines.append(pk_line)
                        
                    f.write(",\n".join(lines))
                    f.write("\n);\n```\n\n")
                    
                    # Key Points section for important tables
                    if table in ['users', 'features', 'access_group_features', 'user_access_groups']:
                        f.write("**Key Points**:\n")
                        if table == 'users':
                            f.write("- `id` must match Supabase Auth user ID\n")
                            f.write("- `role` field is deprecated - use Access Groups instead\n")
                            f.write("- Login tracking supports analytics and security\n")
                            f.write("- Email must be unique across all users\n")
                        elif table == 'features':
                            f.write("- `key` field used for permission checks in code\n")
                            f.write("- `active` field allows enabling/disabling features\n")
                            f.write("- `type` field categorizes features (page, card, widget)\n")
                            f.write("- `order` field controls navigation display order\n")
                        elif table == 'access_group_features':
                            f.write("- Determines which features each group can access\n")
                            f.write("- Users inherit ALL features from ALL their groups\n")
                            f.write("- Changes immediately affect user permissions\n")
                        elif table == 'user_access_groups':
                            f.write("- Users can belong to multiple groups\n")
                            f.write("- Groups can contain multiple users\n")
                            f.write("- Cascade delete maintains referential integrity\n")
                        f.write("\n")
                    
                    # Indexes
                    if details['indexes']:
                        f.write("**Indexes**:\n")
                        for idx_name, idx_def in details['indexes']:
                            f.write(f"- `{idx_name}`: {idx_def}\n")
                        f.write("\n")
                    
                    # Foreign Keys  
                    if details['foreign_keys']:
                        f.write("**Foreign Keys**:\n")
                        for col, reftable, refcol in details['foreign_keys']:
                            f.write(f"- `{col}` → `{reftable}({refcol})`\n")
                        f.write("\n")
                    
                    # Triggers
                    if details.get('triggers'):
                        f.write("**Triggers**:\n")
                        for trig_name, enabled, defn, funcname, lang, funcdef in details['triggers']:
                            status = 'enabled' if enabled == 'O' else 'disabled'
                            f.write(f"- `{trig_name}` ({status}): {funcname}\n")
                        f.write("\n")
                    
                    f.write("---\n\n")
            
            # Add relationships section
            f.write("## Relationships & Constraints\n\n")
            f.write("### Access Group Permission Flow\n")
            f.write("```\n")
            f.write("User → user_access_groups → access_groups → access_group_features → features\n")
            f.write("```\n\n")
            
            f.write("### Business Logic Flow\n")
            f.write("```\n")
            f.write("User → uploads → draws → games\n")
            f.write("User → contact_messages\n")
            f.write("User → notifications\n")
            f.write("User → login_history\n")
            f.write("```\n\n")
            
            # Add common queries section
            f.write("## Common Queries\n\n")
            f.write("### Get User Permissions\n")
            f.write("```sql\n")
            f.write("SELECT DISTINCT f.key\n")
            f.write("FROM users u\n")
            f.write("JOIN user_access_groups ug ON u.id = ug.user_id\n")
            f.write("JOIN access_groups g ON ug.group_id = g.id\n")
            f.write("JOIN access_group_features gf ON g.id = gf.group_id\n")
            f.write("JOIN features f ON gf.feature = f.key\n")
            f.write("WHERE u.id = $1 AND f.active = true;\n")
            f.write("```\n\n")
            
            f.write("### Get User with Groups\n")
            f.write("```sql\n")
            f.write("SELECT u.*, g.name as group_name, g.description as group_description\n")
            f.write("FROM users u\n")
            f.write("LEFT JOIN user_access_groups ug ON u.id = ug.user_id\n")
            f.write("LEFT JOIN access_groups g ON ug.group_id = g.id\n")
            f.write("WHERE u.id = $1;\n")
            f.write("```\n\n")
            
            f.write("---\n\n")
            f.write("*This documentation was automatically generated from the live database schema.*\n")

    def generate_backup_sql(self):
        """Generate database backup SQL"""
        self.print_section("Database Schema Export")
        try:
            params = self.get_postgres_credentials()
            print(f"🔗 Connecting to PostgreSQL at {params['host']}:{params['port']} as {params['user']}...")
            
            conn = psycopg2.connect(**params)
            schema = self.fetch_schema(conn)
            
            self.write_schema_sql(schema, SQL_OUTPUT)
            self.write_schema_md(schema, MD_OUTPUT)
            
            conn.close()
            
            # Show file sizes
            sql_size = os.path.getsize(SQL_OUTPUT)
            md_size = os.path.getsize(MD_OUTPUT)
            
            print(f"✅ Schema export complete!")
            print(f"   📄 {SQL_OUTPUT} ({sql_size:,} bytes)")
            print(f"   📝 {MD_OUTPUT} ({md_size:,} bytes)")
            return True
            
        except Exception as e:
            print(f"❌ Schema export failed: {e}")
            return False

    # ===== DOCUMENTATION OPERATIONS =====
    
    def update_documentation(self):
        """Update all documentation with timestamps"""
        self.print_section("Documentation Update")
        
        # Update PROJECT_STRUCTURE.md timestamp
        success1 = self.update_project_structure_timestamp()
        
        # Run code analysis using our dedicated method
        try:
            print("   🔍 Analyzing codebase for intelligent updates...")
            # Call our dedicated analyze_codebase method that handles all error cases
            self.analyze_codebase()
            
            # Load analysis results
            analysis_file = self.workspace_root / "code_analysis.json"
            if analysis_file.exists():
                with open(analysis_file, "r") as f:
                    code_analysis = json.load(f)
            else:
                code_analysis = None
        except Exception as e:
            print(f"   ⚠️  Code analysis skipped: {e}")
            code_analysis = None
        
        # Generate COPILOT_OVERVIEW.md with code insights
        success2 = self.generate_copilot_overview(code_analysis)
        
        if success1 and success2:
            print("✅ Documentation timestamps and Copilot overview updated")
        return success1 and success2
        
    def analyze_codebase(self):
        """Run code analysis and save results"""
        self.print_section("Code Analysis")
        
        try:
            # Use the InsightsCodeAnalyzer class
            print("   🔍 Analyzing codebase...")
            analyzer = InsightsCodeAnalyzer(self.workspace_root)
            code_analysis = analyzer.analyze_codebase()
            analysis_file = self.workspace_root / "code_analysis.json"
            
            with open(analysis_file, "w") as f:
                json.dump(code_analysis, f, indent=2)
            
            print(f"   ✅ Code analysis complete and saved to {analysis_file}")
            self.print_analysis_summary(code_analysis)
            
            # Update COPILOT_OVERVIEW.md with code insights
            self.update_copilot_overview_with_analysis(code_analysis)
            
            return True
        except Exception as e:
            print(f"   ❌ Code analysis failed: {e}")
            return False
            
    def print_analysis_summary(self, analysis):
        """Print a summary of the code analysis"""
        if not analysis:
            return
            
        print("\n   📊 Code Analysis Summary:")
        print(f"   • API Endpoints: {len(analysis['api_endpoints'])}")
        print(f"   • Feature Keys: {len(analysis['feature_keys'])}")
        print(f"   • React Components: {len(analysis['components'])}")
        print(f"   • Custom Hooks: {len(analysis['hooks'])}")
        print(f"   • Database Tables: {len(analysis['database_tables'])}")
        
    def generate_copilot_overview(self, code_analysis=None):
        """Generate COPILOT_OVERVIEW.md from other documentation files and code analysis"""
        try:
            overview_file = self.workspace_root / "COPILOT_OVERVIEW.md"
            project_overview = self.workspace_root / "PROJECT_OVERVIEW.md"
            rbac_guide = self.workspace_root / "RBAC_GUIDE.md"
            business_logic = self.workspace_root / "BUSINESS_LOGIC.md"
            component_patterns = self.workspace_root / "COMPONENT_PATTERNS.md"
            known_issues = self.workspace_root / "KNOWN_ISSUES.md"
            
            # Try to load code analysis if not provided
            if not code_analysis:
                analysis_file = self.workspace_root / "code_analysis.json"
                if analysis_file.exists():
                    try:
                        with open(analysis_file, "r") as f:
                            code_analysis = json.load(f)
                        print("   📊 Using existing code analysis data")
                    except:
                        print("   ⚠️  Could not load code analysis data")
            
            if not all(f.exists() for f in [project_overview, rbac_guide, business_logic, component_patterns, known_issues]):
                print("   ⚠️  Some source documentation files missing")
            
            # Generate the Copilot Overview content
            content = "# Insights App - Copilot Overview\n\n"
            content += "> **Purpose**: This document provides AI assistants like GitHub Copilot with a high-level understanding of the Insights application architecture, key design decisions, and important patterns.\n\n"
            
            # Extract project context from PROJECT_OVERVIEW.md
            content += "## 🏢 Project Context\n\n"
            if project_overview.exists():
                project_text = project_overview.read_text()
                # Extract the project summary
                import re
                summary_match = re.search(r'## 🎯 Project Summary\n\n(.*?)(?=\n##|\n---)', project_text, re.DOTALL)
                if summary_match:
                    summary = summary_match.group(1).strip()
                    content += summary + "\n\n"
            
            # Add architecture overview
            content += "## 🏗️ Architecture at a Glance\n\n"
            content += "### Core Technologies\n"
            content += "- **Frontend**: Next.js 15.4.2 (App Router) + React 19 + TypeScript\n"
            content += "- **Backend**: Supabase (PostgreSQL + Auth)\n"
            content += "- **Styling**: Tailwind CSS v4\n"
            content += "- **Deployment**: Vercel\n\n"
            
            # Key architectural decisions
            content += "### Key Architectural Decisions\n\n"
            content += "1. **Permission System**: Uses Access Groups instead of traditional roles\n"
            content += "   - Users belong to groups, groups have features, users inherit all features from all groups\n"
            content += "   - This provides more flexibility than role-based access control\n\n"
            content += "2. **Component Structure**: Clean separation between UI, data, and business logic\n"
            content += "   - API routes handle permission checks and data operations\n"
            content += "   - React components focus on presentation\n"
            content += "   - Hooks manage UI state and API interactions\n"
            content += "   \n"
            content += "3. **Navigation System**: Dynamic sidebar driven by user permissions\n"
            content += "   - Sidebar only shows items the user has permission to access\n"
            content += "   - Based on features of type 'page' that the user has access to\n\n"
            content += "4. **Authentication**: Supabase Auth with tracking\n"
            content += "   - Email/password authentication with email verification\n"
            content += "   - Login history tracking for security and analytics\n"
            content += "   - Guest → Member promotion after email verification\n\n"
            
            # Extract core concepts from RBAC_GUIDE.md
            content += "## 🔑 Core Concepts\n\n"
            content += "### 1. Access Group System (NOT Role-Based)\n\n"
            if rbac_guide.exists():
                rbac_text = rbac_guide.read_text()
                content += "The most important concept to understand is that user permissions are determined by **Access Group membership**, not roles:\n\n"
                
                # Extract the permission flow
                flow_match = re.search(r'### 1. User → Access Groups → Features Flow\n```\n(.*?)\n```', rbac_text, re.DOTALL)
                if flow_match:
                    content += "```\n" + flow_match.group(1) + "\n```\n\n"
                
                # Extract core tables
                content += "Key database tables:\n"
                content += "- `users`: Basic user information\n"
                content += "- `access_groups`: Groups that define permission levels\n"
                content += "- `features`: App capabilities that can be granted\n"
                content += "- `user_access_groups`: Join table linking users to groups\n"
                content += "- `access_group_features`: Join table linking groups to features\n\n"
                content += "**Critical**: The `role` field in users table exists but is DEPRECATED - use Access Groups instead\n\n"
                
                # Add features and permissions section
                content += "### 2. Features & Permissions\n\n"
                content += "Features are the atomic units of permission in the app:\n\n"
                content += "- Each feature has a `key` used for permission checks (e.g., `admin_dashboard`)\n"
                content += "- Features have different types: 'page', 'card', 'widget'\n"
                content += "- Features control both page access AND navigation visibility\n\n"
                
                # Extract permission check patterns
                content += "Core permission check pattern:\n"
                content += "```typescript\n"
                content += "// Backend/API permission check\n"
                content += "const features = await getUserFeatures(userId);\n"
                content += "if (!features.includes('required_feature')) {\n"
                content += "  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });\n"
                content += "}\n\n"
                content += "// Frontend permission check\n"
                content += "const { allowed, loading } = useRequireFeature('feature_key');\n"
                content += "if (!allowed) return <Forbidden />;\n"
                content += "```\n\n"
            
            # Extract business entities from BUSINESS_LOGIC.md
            content += "### 3. Business Entities\n\n"
            if business_logic.exists():
                bl_text = business_logic.read_text()
                content += "Core business entities in the system:\n"
                
                # Extract core entities
                entities_match = re.search(r'## Core Business Entities\n\n### 1. Games(.*?)## RBAC', bl_text, re.DOTALL)
                if entities_match:
                    entities = entities_match.group(1)
                    # Extract entity names and add them
                    game_match = re.search(r'### 1. Games\n\*\*Purpose\*\*: (.*?)\n', entities)
                    draw_match = re.search(r'### 2. Draws\n\*\*Purpose\*\*: (.*?)\n', entities)
                    insight_match = re.search(r'### 3. Insights.*?\n\*\*Purpose\*\*: (.*?)\n', entities)
                    user_match = re.search(r'### 4. User Management\n\*\*Purpose\*\*: (.*?)\n', entities)
                    
                    content += "- **Games**: Lottery game definitions and configurations\n"
                    content += "- **Draws**: Historical draw results and data\n"
                    content += "- **Insights**: Analytics templates and pattern recognition\n"
                    content += "- **Users**: Account management with group-based permissions\n\n"
            
            # Extract build patterns from COMPONENT_PATTERNS.md
            content += "### 4. Next.js Build Patterns\n\n"
            if component_patterns.exists():
                cp_text = component_patterns.read_text()
                content += "Due to previous build issues, the app follows strict patterns for admin pages:\n"
                content += "- Uses `'use client'` directive\n"
                content += "- Specific import patterns: `import { useState } from 'react'` (never `import React from 'react'`)\n"
                content += "- Simple HTML + Tailwind CSS (avoids complex components in static generation)\n"
                content += "- Dynamic routes set `export const dynamic = 'force-dynamic'`\n\n"
            
            # Extract known issues from KNOWN_ISSUES.md
            content += "## 🚨 Known Issues & Workarounds\n\n"
            if known_issues.exists():
                ki_text = known_issues.read_text()
                
                # Extract admin users page issue
                admin_users_match = re.search(r'### 2. Admin Users Page.*?\n\*\*Symptoms\*\*: (.*?)\n\*\*Root Cause\*\*: (.*?)\n\*\*Workaround\*\*: (.*?)\n\*\*Status\*\*: (.*?)\n', ki_text, re.DOTALL)
                if admin_users_match:
                    content += "1. **Admin Users Page Location**: `/manage-users` (not `/admin/users`)\n"
                    content += "   - Due to Next.js framework bug with `/admin/users` path\n"
                    content += "   - This is a permanent workaround and is fully functional\n\n"
                
                # Extract navigation refresh issue
                nav_refresh_match = re.search(r'### 1. Navigation Refresh.*?\n\*\*Symptoms\*\*: (.*?)\n\*\*Impact\*\*: (.*?)\n\*\*Workaround\*\*: (.*?)\n\*\*Planned Fix\*\*: (.*?)\n', ki_text, re.DOTALL)
                if nav_refresh_match:
                    content += "2. **Navigation Refresh**: Sidebar doesn't immediately update after permission changes\n"
                    content += "   - Requires page refresh to see changes\n"
                    content += "   - Real-time updates via Supabase subscriptions planned\n\n"
                
                # Extract import paths issue
                import_paths_match = re.search(r'### 2. Relative Import Paths.*?\n\*\*Symptoms\*\*: (.*?)\n\*\*Impact\*\*: (.*?)\n\*\*Workaround\*\*: (.*?)\n\*\*Planned Fix\*\*: (.*?)\n', ki_text, re.DOTALL)
                if import_paths_match:
                    content += "3. **Import Paths**: Using relative paths (no path aliases configured)\n"
                    content += "   - Results in verbose imports like `../../utils/hooks/useRequireFeature`\n\n"
            
            # Development patterns
            content += "## 💡 Development Patterns\n\n"
            
            # Extract page protection pattern
            content += "### Page Protection Pattern\n"
            content += "Every protected page uses the `useRequireFeature` hook:\n"
            content += "```tsx\n"
            content += "const { allowed, loading } = useRequireFeature('feature_key');\n"
            content += "if (loading) return <LoadingSpinner />;\n"
            content += "if (forbidden) return <Forbidden />;\n"
            content += "// Render actual content\n"
            content += "```\n\n"
            
            # Extract Supabase client usage
            if known_issues.exists():
                supabase_match = re.search(r'### 3. Supabase Client Import Confusion.*?\n\*\*Solution\*\*: Use correct client for context:\n```typescript\n(.*?)```', ki_text, re.DOTALL)
                if supabase_match:
                    content += "### Supabase Client Usage\n"
                    content += "- **Client components**: `import { createClient } from '@/utils/supabase/browser'`\n"
                    content += "- **Server components/API**: `import { createClient } from '@/utils/supabase/server'`\n\n"
            
            # API structure
            content += "### API Structure\n"
            content += "- API routes follow REST conventions\n"
            content += "- Every protected API does permission checks using `getUserFeatures()`\n"
            content += "- API endpoints provide data for dynamic navigation, cards, and page content\n\n"
            
            # Project organization
            content += "## 🗂️ Project Organization\n\n"
            content += "Important directories:\n"
            content += "- `/frontend/app/components`: Reusable React components\n"
            content += "- `/frontend/app/api`: API routes for data operations\n"
            content += "- `/frontend/utils`: Utility functions including RBAC helpers\n"
            content += "- `/frontend/utils/hooks`: React hooks for common patterns\n\n"
            
            content += "Documentation:\n"
            content += "- `.md` files in project root contain all project documentation\n"
            content += "- `insights_maintenance.py` generates documentation and schema files\n\n"
            
            # Add code insights section if analysis data is available
            if code_analysis:
                content += "## 📊 Code Insights\n\n"
                
                # API Endpoints
                if code_analysis.get("api_endpoints"):
                    content += "### API Endpoints\n\n"
                    content += "| Endpoint | Methods | Required Features |\n"
                    content += "|---------|---------|------------------|\n"
                    
                    for endpoint in code_analysis["api_endpoints"][:10]:  # Show first 10
                        path = endpoint.get("path", "")
                        methods = ", ".join(endpoint.get("methods", []))
                        features = ", ".join(endpoint.get("required_features", []))
                        content += f"| `{path}` | {methods} | {features} |\n"
                    
                    if len(code_analysis["api_endpoints"]) > 10:
                        content += f"| ... | ... | ... | _(plus {len(code_analysis['api_endpoints']) - 10} more)_ |\n\n"
                    else:
                        content += "\n"
                
                # Feature Keys detected in code
                if code_analysis.get("feature_keys"):
                    feature_keys_set = set()
                    for feature in code_analysis["feature_keys"]:
                        feature_keys_set.add(feature.get("key", ""))
                    
                    content += "### Detected Feature Keys\n\n"
                    content += "Features used in code: " + ", ".join([f"`{key}`" for key in sorted(list(feature_keys_set))[:15]])
                    if len(feature_keys_set) > 15:
                        content += f" _(plus {len(feature_keys_set) - 15} more)_"
                    content += "\n\n"
                
                # Database Tables
                if code_analysis.get("database_tables"):
                    content += "### Database Tables Used in Code\n\n"
                    content += "Tables referenced: " + ", ".join([f"`{table}`" for table in code_analysis["database_tables"][:15]])
                    if len(code_analysis["database_tables"]) > 15:
                        content += f" _(plus {len(code_analysis['database_tables']) - 15} more)_"
                    content += "\n\n"
            
            # Common development tasks
            content += "## 📝 Common Development Tasks\n\n"
            content += "1. **Adding a new feature**:\n"
            content += "   - Add entry to `features` table\n"
            content += "   - Assign to appropriate access groups\n"
            content += "   - Create page component with `useRequireFeature` hook\n"
            content += "   - Add API routes with permission checks\n\n"
            
            content += "2. **Adding a new user**:\n"
            content += "   - User registers through Supabase Auth\n"
            content += "   - Admin assigns user to appropriate groups\n"
            content += "   - User automatically gets permissions from groups\n\n"
            
            content += "3. **Debugging permission issues**:\n"
            content += "   - Check user's group memberships\n"
            content += "   - Check groups' feature assignments\n"
            content += "   - Check for typos in feature keys\n\n"
            
            content += "---\n\n"
            content += "*This overview is automatically generated to help AI assistants understand the project quickly.*"
            
            # Write to file
            overview_file.write_text(content)
            print(f"   📝 Generated COPILOT_OVERVIEW.md")
            return True
            
        except Exception as e:
            print(f"   ❌ Could not generate COPILOT_OVERVIEW.md: {e}")
            return False

    def update_project_structure_timestamp(self):
        """Update timestamp in PROJECT_STRUCTURE.md"""
        try:
            structure_file = self.workspace_root / "PROJECT_STRUCTURE.md"
            if structure_file.exists():
                content = structure_file.read_text()
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
                
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if line.strip().startswith('> **Last Updated**:'):
                        lines[i] = f"> **Last Updated**: {timestamp}"
                        break
                else:
                    # If timestamp line not found, add it after the header
                    if len(lines) > 5:
                        lines.insert(5, f"> **Last Updated**: {timestamp}")
                
                structure_file.write_text('\n'.join(lines))
                print(f"   📝 Updated PROJECT_STRUCTURE.md: {timestamp}")
                return True
            else:
                print("   ⚠️  PROJECT_STRUCTURE.md not found")
                return False
        except Exception as e:
            print(f"   ❌ Could not update PROJECT_STRUCTURE.md: {e}")
            return False

    # ===== FILE STRUCTURE OPERATIONS =====
    
    def should_ignore(self, entry, path):
        """Determine if a directory or file should be ignored"""
        ignore_dirs = {
            'node_modules', '.git', '.next', '.vercel', '__pycache__', 
            '.vscode', 'dist', 'build', '.cache', 'coverage',
            '.nuxt', '.output', '.turbo', 'backups'
        }
        ignore_files = {
            '.env', '.env.local', '.env.development.local', '.env.production.local',
            '.DS_Store', 'Thumbs.db', '.gitignore', 'package-lock.json',
            'yarn.lock', 'pnpm-lock.yaml', 'tsconfig.tsbuildinfo'
        }
        
        # Ignore directories
        if path.is_dir() and entry in ignore_dirs:
            return True
        
        # Ignore specific files
        if entry in ignore_files:
            return True
        
        # Ignore log files and temp files
        if entry.endswith(('.log', '.tmp', '.temp', '.cache')):
            return True
            
        return False

    def generate_tree(self, root_path, prefix="", max_depth=3, current_depth=0):
        """Generate clean directory tree excluding noise"""
        if current_depth >= max_depth:
            return
            
        try:
            entries = [e for e in os.listdir(root_path) 
                      if not e.startswith('.') and not self.should_ignore(e, Path(root_path) / e)]
            entries.sort()
            
            for idx, entry in enumerate(entries):
                path = Path(root_path) / entry
                connector = "└── " if idx == len(entries) - 1 else "├── "
                
                # Add emoji indicators for different file types
                if path.is_dir():
                    if entry == 'frontend':
                        yield f"{prefix}{connector}🌐 {entry}/"
                    elif entry == 'backend':
                        yield f"{prefix}{connector}⚙️ {entry}/"
                    elif entry == 'archive':
                        yield f"{prefix}{connector}📦 {entry}/"
                    else:
                        yield f"{prefix}{connector}📁 {entry}/"
                else:
                    if entry.endswith('.md'):
                        yield f"{prefix}{connector}📝 {entry}"
                    elif entry.endswith('.py'):
                        yield f"{prefix}{connector}🐍 {entry}"
                    elif entry.endswith(('.sql', '.SQL')):
                        yield f"{prefix}{connector}🗄️ {entry}"
                    elif entry.endswith('.json'):
                        yield f"{prefix}{connector}⚙️ {entry}"
                    else:
                        yield f"{prefix}{connector}📄 {entry}"
                
                # Recurse into directories (but limit depth)
                if path.is_dir() and current_depth < max_depth - 1:
                    extension = "    " if idx == len(entries) - 1 else "│   "
                    yield from self.generate_tree(path, prefix + extension, max_depth, current_depth + 1)
                    
        except PermissionError:
            yield f"{prefix}[Permission Denied]"

    def generate_file_structure(self):
        """Generate clean project structure overview"""
        self.print_section("File Structure Generation")
        
        output_file = self.workspace_root / "PROJECT_STRUCTURE_GENERATED.md"
        
        try:
            with open(output_file, "w", encoding="utf-8") as f:
                f.write("# Auto-Generated Project Structure\n\n")
                f.write("**Company**: Lottery Analytics  \n")
                f.write("**Application**: Insights  \n")
                f.write(f"**Generated**: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  \n\n")
                f.write("> **Note**: This is a clean view excluding node_modules, build artifacts, and temporary files  \n\n")
                f.write("```\n")
                f.write(f"{self.workspace_root.name}/\n")
                for line in self.generate_tree(self.workspace_root):
                    f.write(line + "\n")
                f.write("```\n\n")
                f.write("---\n\n")
                f.write("*This structure was auto-generated and excludes development dependencies and build artifacts.*\n")
            
            print(f"✅ Clean project structure generated: {output_file.name}")
            return True
            
        except Exception as e:
            print(f"❌ File structure generation failed: {e}")
            return False

    # ===== BACKUP OPERATIONS =====
    
    def create_session_backup(self):
        """Create timestamped backup of critical files"""
        self.print_section("Session Backup")
        
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = self.backup_dir / timestamp
        
        try:
            backup_dir.mkdir(parents=True, exist_ok=True)
            
            # Files to backup
            backup_files = [
                "DATABASE_SCHEMA.SQL",
                "DATABASE_SCHEMA_GENERATED.md",
                "PROJECT_STRUCTURE.md",
                "COPILOT_OVERVIEW.md",
                "code_analysis.json",
                "package.json",
                "frontend/package.json",
            ]
            
            backup_count = 0
            for file in backup_files:
                file_path = self.workspace_root / file
                if file_path.exists():
                    backup_path = backup_dir / file_path.name
                    backup_path.write_bytes(file_path.read_bytes())
                    backup_count += 1
            
            # Create backup summary
            summary_path = backup_dir / "BACKUP_INFO.md"
            git_status = subprocess.run("git status --short", shell=True, capture_output=True, text=True).stdout
            git_log = subprocess.run("git log --oneline -5", shell=True, capture_output=True, text=True).stdout
            
            summary_content = f"""# Backup Session {timestamp}

**Date**: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Files Backed Up**: {backup_count}

## Backed Up Files:
{chr(10).join([f"- {f}" for f in backup_files if (self.workspace_root / f).exists()])}

## Git Status at Backup:
```
{git_status}
```

## Recent Commits:
```
{git_log}
```
"""
            summary_path.write_text(summary_content)
            
            print(f"✅ Backup created: {backup_dir}")
            print(f"   📦 {backup_count} files backed up")
            return True
            
        except Exception as e:
            print(f"❌ Backup creation failed: {e}")
            return False

    def validate_documentation(self):
        """Validate documentation links and references"""
        self.print_section("Documentation Validation")
        
        md_files = list(self.workspace_root.glob("*.md"))
        broken_links = []
        
        for md_file in md_files:
            try:
                content = md_file.read_text()
                # Simple check for .md file references
                import re
                md_links = re.findall(r'\[.*?\]\(([^)]*\.md)\)', content)
                for link in md_links:
                    if not (self.workspace_root / link).exists():
                        broken_links.append(f"{md_file.name} -> {link}")
            except Exception as e:
                print(f"   ⚠️  Could not validate {md_file.name}: {e}")
        
        if broken_links:
            print("   ❌ Found broken links:")
            for link in broken_links:
                print(f"      {link}")
            return False
        else:
            print("   ✅ All documentation links valid")
            return True

    def check_git_status(self):
        """Check git status and suggest actions"""
        self.print_section("Git Status Check")
        
        result = subprocess.run("git status --porcelain", shell=True, capture_output=True, text=True)
        
        if result.stdout.strip():
            print("   📝 Uncommitted changes detected:")
            changes = result.stdout.strip().split('\n')
            for change in changes[:10]:  # Show first 10 changes
                print(f"      {change}")
            if len(changes) > 10:
                print(f"      ... and {len(changes) - 10} more files")
            
            print("\n   💡 Suggested actions:")
            print("      git add .")
            print("      git commit -m 'Update documentation after maintenance'")
            print("      git push")
            return False
        else:
            print("   ✅ No uncommitted changes")
            return True

    def run_all_updates(self):
        """Run all maintenance operations"""
        self.print_header("Complete Maintenance Workflow")
        
        operations = [
            ("Database Schema Export", self.generate_backup_sql),
            ("Documentation Update", self.update_documentation),
            ("File Structure Generation", self.generate_file_structure),
            ("Codebase Analysis", self.analyze_codebase),
            ("Session Backup", self.create_session_backup),
            ("Documentation Validation", self.validate_documentation),
            ("Git Status Check", self.check_git_status),
        ]
        
        results = []
        for name, operation in operations:
            try:
                success = operation()
                results.append((name, success))
            except Exception as e:
                print(f"❌ {name} failed: {e}")
                results.append((name, False))
        
        # Summary
        self.print_section("Maintenance Summary")
        successful = 0
        for name, success in results:
            status = "✅" if success else "❌"
            print(f"{status} {name}")
            if success:
                successful += 1
        
        print(f"\n🎯 Completed: {successful}/{len(results)} operations")
        
        if successful == len(results):
            print("🎉 All maintenance operations completed successfully!")
        else:
            print("⚠️  Some operations failed - please review and fix issues")
        
        print("\n💡 Next steps:")
        print("   git add . && git commit -m 'Complete maintenance update' && git push")
        
        return successful == len(results)

    def show_interactive_menu(self):
        """Show interactive menu for selecting operations"""
        while True:
            self.print_header("Insights App Maintenance Tool")
            print("**Company**: Lottery Analytics")
            print("**Application**: Insights")
            print("**Status**: In Development\n")
            
            print("Choose an operation:")
            print("1. 🗄️  Generate Backup SQL")
            print("2. 📝 Update Documentation")
            print("3. 📁 Generate File Structure")
            print("4. 🔍 Analyze Codebase")
            print("5. �� Test Database Connection")
            print("6. 🚀 Run All Updates")
            print("7. ❌ Exit")
            
            choice = input("\nEnter your choice (1-7): ").strip()
            
            if choice == "1":
                self.generate_backup_sql()
            elif choice == "2":
                self.update_documentation()
            elif choice == "3":
                self.generate_file_structure()
            elif choice == "4":
                self.analyze_codebase()
            elif choice == "5":
                self.test_database_connection()
            elif choice == "6":
                self.run_all_updates()
            elif choice == "7":
                print("\n👋 Goodbye!")
                break
            else:
                print("\n❌ Invalid choice. Please enter 1-7.")
            
            input("\nPress Enter to continue...")

def main():
    """Main entry point with argument parsing"""
    parser = argparse.ArgumentParser(
        description="Insights App Maintenance Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python3 insights_maintenance.py              # Interactive menu
    python3 insights_maintenance.py --backup     # Generate backup SQL
    python3 insights_maintenance.py --docs       # Update documentation
    python3 insights_maintenance.py --structure  # Generate file structure
    python3 insights_maintenance.py --analyze    # Analyze codebase
    python3 insights_maintenance.py --test       # Test database connection
    python3 insights_maintenance.py --all        # Run all updates
        """
    )
    
    parser.add_argument("--backup", action="store_true", help="Generate database backup SQL")
    parser.add_argument("--docs", action="store_true", help="Update documentation timestamps")
    parser.add_argument("--structure", action="store_true", help="Generate file structure")
    parser.add_argument("--analyze", action="store_true", help="Analyze codebase structure")
    parser.add_argument("--test", action="store_true", help="Test database connection")
    parser.add_argument("--all", action="store_true", help="Run all maintenance operations")
    
    args = parser.parse_args()
    
    # Create maintenance instance
    maintenance = InsightsMaintenance()
    
    # Handle command line arguments
    if args.backup:
        maintenance.generate_backup_sql()
    elif args.docs:
        maintenance.update_documentation()
    elif args.structure:
        maintenance.generate_file_structure()
    elif args.analyze:
        maintenance.analyze_codebase()
    elif args.test:
        maintenance.test_database_connection()
    elif args.all:
        maintenance.run_all_updates()
    else:
        # No arguments provided, show interactive menu
        maintenance.show_interactive_menu()

if __name__ == "__main__":
    main()
