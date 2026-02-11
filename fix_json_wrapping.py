#!/usr/bin/env python3
import os
import re

files_to_fix = {
    'GuestList.tsx': [
        ("JSON.parse(userDataStorage.getData('guests') || '[]')", "userDataStorage.getData('guests') || []"),
        ("JSON.stringify(guests)", "guests"),
    ],
    'RegistryManager.tsx': [
        ("JSON.parse(userDataStorage.getData('registries') || '[]')", "userDataStorage.getData('registries') || []"),
        ("JSON.stringify(", ""),  # This needs special handling
    ],
    'Settings.tsx': [
        ("JSON.parse(userDataStorage.getData('onboarding') || '{}')", "userDataStorage.getData('onboarding') || {}"),
        ("JSON.stringify(settings)", "settings"),
    ],
    'VendorManagement.tsx': [
        ("JSON.parse(userDataStorage.getData('myVendors') || '[]')", "userDataStorage.getData('myVendors') || []"),
        ("JSON.stringify(", ""),  # Needs special handling
    ],
    'Overview.tsx': [
        ("JSON.parse(userDataStorage.getData('onboarding') || 'null')", "userDataStorage.getData('onboarding')"),
    ],
}

base_path = '/Users/pratiktanikella/Vivaha_repo/client/src/components/dashboard'

for filename, replacements in files_to_fix.items():
    filepath = os.path.join(base_path, filename)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Handle specific patterns more carefully
    # userDataStorage.getData() should NOT be wrapped in JSON.parse 
    # It handles serialization internally
    
    # Replace JSON.parse wrapped calls
    content = re.sub(
        r"JSON\.parse\(userDataStorage\.getData\('(\w+)'\) \|\| '(.*?)'\)",
        lambda m: f"userDataStorage.getData('{m.group(1)}') || {'{}' if m.group(2) == '{}' else '[]'}",
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"✅ {filename} - Fixed JSON wrapping")

print("\n✨ JSON serialization fixes applied!")
