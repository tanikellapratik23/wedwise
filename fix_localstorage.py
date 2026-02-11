#!/usr/bin/env python3
import os

files_to_fix = {
    'BudgetTracker.tsx': [
        ("localStorage.getItem('budget')", "userDataStorage.getData('budget')"),
        ("localStorage.setItem('budget',", "userDataStorage.setData('budget',"),
        ("JSON.parse(localStorage.getItem('budget') || '{}')", "userDataStorage.getData('budget') || {}"),
        ("JSON.stringify(budget)", "budget"),
    ],
    'TodoList.tsx': [
        ("localStorage.getItem('todos')", "userDataStorage.getData('todos')"),
        ("localStorage.setItem('todos',", "userDataStorage.setData('todos',"),
        ("JSON.parse(localStorage.getItem('todos') || '[]')", "userDataStorage.getData('todos') || []"),
        ("JSON.stringify(todos)", "todos"),
    ],
    'VendorSearch.tsx': [
        ("localStorage.getItem('favoriteVendors')", "userDataStorage.getData('favoriteVendors')"),
        ("localStorage.setItem('favoriteVendors',", "userDataStorage.setData('favoriteVendors',"),
        ("localStorage.getItem('myVendors')", "userDataStorage.getData('myVendors')"),
        ("localStorage.setItem('myVendors',", "userDataStorage.setData('myVendors',"),
    ],
    'SeatingPlanner.tsx': [
        ("localStorage.getItem('seating')", "userDataStorage.getData('seating')"),
        ("localStorage.setItem('seating',", "userDataStorage.setData('seating',"),
        ("JSON.parse(localStorage.getItem('seating') || '{}')", "userDataStorage.getData('seating') || {}"),
    ],
    'CeremonyPlanning.tsx': [
        ("localStorage.getItem('ceremony')", "userDataStorage.getData('ceremony')"),
        ("localStorage.setItem('ceremony',", "userDataStorage.setData('ceremony',"),
        ("JSON.parse(localStorage.getItem('ceremony') || '{}')", "userDataStorage.getData('ceremony') || {}"),
    ],
    'Dashboard.tsx': [
        ("localStorage.getItem('guests')", "userDataStorage.getData('guests')"),
        ("localStorage.getItem('budget')", "userDataStorage.getData('budget')"),
        ("localStorage.getItem('todos')", "userDataStorage.getData('todos')"),
    ],
    'VendorManagement.tsx': [
        ("localStorage.getItem('vendorNotes')", "userDataStorage.getData('vendorNotes')"),
        ("localStorage.setItem('vendorNotes',", "userDataStorage.setData('vendorNotes',"),
    ],
    'PostWeddingStory.tsx': [
        ("localStorage.getItem('postWeddingPhotos')", "userDataStorage.getData('postWeddingPhotos')"),
        ("localStorage.setItem('postWeddingPhotos',", "userDataStorage.setData('postWeddingPhotos',"),
    ],
    'Music.tsx': [
        ("localStorage.getItem('musicPlaylist')", "userDataStorage.getData('musicPlaylist')"),
        ("localStorage.setItem('musicPlaylist',", "userDataStorage.setData('musicPlaylist',"),
    ],
    'HotelBlock.tsx': [
        ("localStorage.getItem('hotelData')", "userDataStorage.getData('hotelData')"),
        ("localStorage.setItem('hotelData',", "userDataStorage.setData('hotelData',"),
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

print("\n✨ All files processed!")
