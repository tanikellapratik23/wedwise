#!/usr/bin/env python3
import re

filepath = '/Users/pratiktanikella/Vivaha_repo/client/src/components/dashboard/BudgetTracker.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Fix pattern 1: userDataStorage.setData with JSON.stringify
content = re.sub(
    r"userDataStorage\.setData\('budget',\s*JSON\.stringify\((.*?)\)\)",
    r"userDataStorage.setData('budget', \1)",
    content,
    flags=re.DOTALL
)

# Fix pattern 2: JSON.parse(userDataStorage.getData('budget'))
content = re.sub(
    r"JSON\.parse\(userDataStorage\.getData\('budget'\)\)",
    r"userDataStorage.getData('budget')",
    content
)

# Fix pattern 3: cached = userDataStorage.getData followed by JSON.parse(cached)
content = re.sub(
    r"const cached = userDataStorage\.getData\('budget'\);\s*if \(cached\) setCategories\(JSON\.parse\(cached\)\);",
    r"const cached = userDataStorage.getData('budget');\n      if (cached && Array.isArray(cached)) setCategories(cached);",
    content
)

# Fix another pattern of same thing
content = re.sub(
    r"const cached = userDataStorage\.getData\('budget'\);\s*if \(cached\) \{ setCategories\(JSON\.parse\(cached\)\);",
    r"const cached = userDataStorage.getData('budget');\n      if (cached && Array.isArray(cached)) { setCategories(cached);",
    content
)

with open(filepath, 'w') as f:
    f.write(content)

print("✅ Fixed BudgetTracker.tsx - removed double JSON parsing")
