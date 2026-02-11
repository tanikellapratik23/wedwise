#!/usr/bin/env python3
import os

files_to_fix = {
    'CeremonyPlanning.tsx': [
        ("const guestData = localStorage.getItem('guests')", "const guestData = userDataStorage.getData('guests')"),
    ],
    'Dashboard.tsx': [
        ("localStorage.getItem('wantsBachelorParty')", "userDataStorage.getData('wantsBachelorParty')"),
        ("localStorage.setItem('wantsBachelorParty',", "userDataStorage.setData('wantsBachelorParty',"),
        ("localStorage.getItem('onboarding')", "userDataStorage.getData('onboarding')"),
    ],
    'GuestList.tsx': [
        ("localStorage.getItem('guests')", "userDataStorage.getData('guests')"),
    ],
    'Overview.tsx': [
        ("localStorage.getItem('onboarding')", "userDataStorage.getData('onboarding')"),
    ],
    'RegistryManager.tsx': [
        ("localStorage.setItem('registries',", "userDataStorage.setData('registries',"),
    ],
    'Settings.tsx': [
        ("localStorage.getItem('onboarding')", "userDataStorage.getData('onboarding')"),
        ("localStorage.setItem('onboarding',", "userDataStorage.setData('onboarding',"),
    ],
    'VendorManagement.tsx': [
        ("localStorage.setItem('myVendors',", "userDataStorage.setData('myVendors',"),
        ("localStorage.getItem('myVendors')", "userDataStorage.getData('myVendors')"),
    ],
    'VendorSearch.tsx': [
        ("localStorage.getItem('onboarding')", "userDataStorage.getData('onboarding')"),
    ],
}

base_path = '/Users/pratiktanikella/Vivaha_repo/client/src/components/dashboard'

for filename, replacements in files_to_fix.items():
    filepath = os.path.join(base_path, filename)
    if not os.path.exists(filepath):
        print(f"⏭️  SKIPPED {filename} (not found)")
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        count = sum(1 for old, new in replacements if old in original)
        print(f"✅ {filename} - Fixed {count} pattern(s)")
    else:
        print(f"⚠️  {filename} - No changes needed")

print("\n✨ All remaining fixes applied!")
