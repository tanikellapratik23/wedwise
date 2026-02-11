#!/usr/bin/env python3
import re
import os

files_to_fix = [
    '/Users/pratiktanikella/Vivaha_repo/client/src/components/dashboard/VendorManagement.tsx',
    '/Users/pratiktanikella/Vivaha_repo/client/src/components/dashboard/RegistryManager.tsx',
    '/Users/pratiktanikella/Vivaha_repo/client/src/components/dashboard/TodoList.tsx',
    '/Users/pratiktanikella/Vivaha_repo/client/src/components/dashboard/CeremonyPlanning.tsx',
    '/Users/pratiktanikella/Vivaha_repo/client/src/components/dashboard/Settings.tsx',
    '/Users/pratiktanikella/Vivaha_repo/client/src/components/dashboard/VendorSearch.tsx',
    '/Users/pratiktanikella/Vivaha_repo/client/src/components/dashboard/SeatingPlanner.tsx',
]

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        print(f"⏭️  {os.path.basename(filepath)} - not found")
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Fix 1: userDataStorage.setData(..., JSON.stringify(...)) -> userDataStorage.setData(..., ...)
    content = re.sub(
        r"userDataStorage\.setData\('([^']+)',\s*JSON\.stringify\(([^)]+)\)\)",
        r"userDataStorage.setData('\1', \2)",
        content
    )
    
    # Fix 2: JSON.parse(userDataStorage.getData(...) || '[]') -> userDataStorage.getData(...) || []
    content = re.sub(
        r"JSON\.parse\(userDataStorage\.getData\('([^']+)'\)\s*\|\|\s*'(\[\])'\)",
        r"userDataStorage.getData('\1') || []",
        content
    )
    
    # Fix 3: JSON.parse(userDataStorage.getData(...) || '{}') -> userDataStorage.getData(...) || {}
    content = re.sub(
        r"JSON\.parse\(userDataStorage\.getData\('([^']+)'\)\s*\|\|\s*'(\{\})'\)",
        r"userDataStorage.getData('\1') || {}",
        content
    )
    
    # Fix 4: JSON.parse(userDataStorage.getData(...) || 'null') -> userDataStorage.getData(...)
    content = re.sub(
        r"JSON\.parse\(userDataStorage\.getData\('([^']+)'\)\s*\|\|\s*'null'\)",
        r"userDataStorage.getData('\1')",
        content
    )
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✅ {os.path.basename(filepath)} - Fixed JSON parsing/serialization")
    else:
        print(f"⚠️  {os.path.basename(filepath)} - No changes needed")

print("\n✨ All files processed!")
