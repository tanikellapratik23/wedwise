#!/usr/bin/env python3
"""
Script to help identify all localStorage calls that need to be updated
to use userDataStorage utility for user-specific data isolation.
"""

import os
import re
from pathlib import Path

workspace_root = Path("/Users/pratiktanikella/Vivaha_repo")
client_src = workspace_root / "client/src/components/dashboard"

# Files to update
files_to_update = [
    "BudgetTracker.tsx",
    "TodoList.tsx",
    "GuestList.tsx",
    "VendorManagement.tsx",
    "MusicPlanner.tsx",
    "SeatingPlanner.tsx",
    "VendorSearch.tsx",
]

# Pattern to find localStorage.setItem/getItem calls
patterns = [
    (r"localStorage\.getItem\('(guests|budget|todos|myVendors|ceremonies|playlists|seatingCharts|weddingPlaylists)'\)", 
     r"userDataStorage.getData('\1')"),
    
    (r"localStorage\.setItem\('(guests|budget|todos|myVendors|ceremonies|playlists|seatingCharts|weddingPlaylists)',\s*JSON\.stringify\(([^)]+)\)\)",
     r"userDataStorage.setData('\1', \2)"),
    
    (r"localStorage\.removeItem\('(guests|budget|todos|myVendors|ceremonies|playlists|seatingCharts|weddingPlaylists)'\)",
     r"userDataStorage.removeData('\1')"),
]

for file_name in files_to_update:
    file_path = client_src / file_name
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        continue
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    print(f"\n📄 {file_name}")
    print("=" * 60)
    
    # Find all localStorage calls
    for pattern, replacement in patterns:
        matches = re.findall(pattern, content)
        if matches:
            print(f"  Found {len(matches)} matches for pattern: {pattern[:40]}...")
            for match in matches:
                print(f"    - {match}")

print("\n✅ Analysis complete!")
print("\nNext steps:")
print("1. For each file, add import: import { userDataStorage } from '../../utils/userDataStorage';")
print("2. Replace all localStorage.getItem/setItem/removeItem calls")
print("3. Update JSON.stringify calls to not be needed with userDataStorage.setData()")
