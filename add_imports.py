#!/usr/bin/env python3
import os
import re

files = [
    'BudgetTracker.tsx',
    'TodoList.tsx',
    'VendorSearch.tsx',
    'SeatingPlanner.tsx',
    'CeremonyPlanning.tsx',
    'Dashboard.tsx'
]

base_path = '/Users/pratiktanikella/Vivaha_repo/client/src/components/dashboard'

for filename in files:
    filepath = os.path.join(base_path, filename)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Skip if already imported
    if 'userDataStorage' in content and "from '../../utils/userDataStorage'" in content:
        print(f"✅ {filename} - userDataStorage already imported")
        continue
    
    # Find the last import line
    imports = re.findall(r"^import .+ from .+;$", content, re.MULTILINE)
    if not imports:
        print(f"⚠️  {filename} - No imports found, skipping")
        continue
    
    last_import = imports[-1]
    new_import = "import { userDataStorage } from '../../utils/userDataStorage';"
    content = content.replace(last_import, last_import + '\n' + new_import, 1)
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"✅ {filename} - Added userDataStorage import")
