# Registry Manager UI - New Vendor Search Layout

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Wedding Registries                                             │
│  Centralize all your gift registries in one place               │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  3 registries                          [+ Add Registry]          │
└──────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┐  ┌────────────────────────────────┐
│ 💍 Our Zola Registry       [X] │  │ 📦 Amazon Registry         [X] │
│ ZOLA                            │  │ AMAZON                         │
│                                 │  │                                │
│ Registry Link                   │  │ Registry Link                  │
│ www.zola.com/weddings/...      │  │ amazon.com/registry/...       │
│                                 │  │                                │
│ Share with guests               │  │ Share with guests              │
│ Include this link in your...    │  │ Include this link in your...   │
│                                 │  │                                │
│ [📱 Open Registry] [📋 Copy]   │  │ [📱 Open Registry] [📋 Copy]  │
└────────────────────────────────┘  └────────────────────────────────┘

┌────────────────────────────────┐
│ 🎯 Target Registry         [X] │
│ TARGET                          │
│                                 │
│ Registry Link                   │
│ target.com/registry/...        │
│                                 │
│ Share with guests               │
│ Include this link in your...    │
│                                 │
│ [📱 Open Registry] [📋 Copy]   │
└────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ 💡 Tips for Sharing Registries                                   │
│ ✓ Include all registries in your wedding website                 │
│ ✓ Add registry links to your email invitations                   │
│ ✓ Share on your wedding registry landing page                    │
│ ✓ Multiple registries make it easier for guests                  │
└──────────────────────────────────────────────────────────────────┘
```

## Key Design Elements

### Registry Card Structure
- **Top Right:** Delete button (trash icon) - positioned like vendor favorites
- **Registry Name:** Bold title with emoji icon (💍🎁📦🛁)
- **Type Badge:** Color-coded (Blue=Zola, Orange=Amazon, Red=Target, Green=BBB)
- **URL Section:** Wrapped in colored box matching the registry type
- **Share Section:** Blue box with tips for sharing with guests
- **Action Buttons:** 
  - "Open Registry" button (primary color, full width on left)
  - "Copy" button (gray, right side with copy icon → checkmark on success)

### Color Scheme by Registry Type
| Type | Icon | Badge Color | Box Color |
|------|------|------------|-----------|
| Zola | 💍 | Blue | Light Blue |
| Amazon | 📦 | Orange | Light Orange |
| Target | 🎯 | Red | Light Red |
| Bed Bath & Beyond | 🛁 | Green | Light Green |
| Other | 🎁 | Gray | Light Gray |

### Layout Grid
- **Desktop:** 2-column grid (lg:grid-cols-2)
- **Mobile:** 1-column responsive
- **Gap:** 6 units (24px)
- **Card Shadow:** hover:shadow-md on hover

## Features

### Copy Link Button
- Copies registry URL to clipboard
- Shows success feedback (green bg + checkmark) for 2 seconds
- Auto-reverts to copy icon after 2 seconds
- Makes it easy for guests to share links

### Empty State
- Large emoji (🎁)
- Friendly message
- Call-to-action button to add first registry
- Centered, visually appealing

### Tips Section
- Only shown when registries exist
- Helpful sharing guidance
- Color-coded box (primary gradient)
- Checkmarks for each tip

## Consistency with Vendor Search
✅ Same 2-column card grid layout  
✅ Similar card structure with info sections  
✅ Color-coded badges for categorization  
✅ External link buttons for going to site  
✅ Buttons positioned at bottom with border  
✅ Hover effects and transitions  
✅ Clean, professional appearance  
✅ Mobile responsive design  

## Upcoming Enhancements
- [ ] Search/filter registries
- [ ] Drag to reorder registries
- [ ] Share registries as group link
- [ ] View registry stats (items added, etc)
- [ ] Integration with guest management
