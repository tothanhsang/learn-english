# Design Guidelines - Learn English App

> Vietnamese vocabulary learning application | Next.js + Supabase + Tailwind CSS + shadcn/ui

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#6366F1` | Primary actions, active tabs, links |
| `primary-dark` | `#4F46E5` | Hover states, gradient end |
| `accent-orange` | `#F97316` | "Dang hoc" badge, warnings |
| `accent-purple` | `#A855F7` | "Moi" badge, secondary highlights |
| `success` | `#22C55E` | Checkmarks, completed states |

### Neutral Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#F8FAFC` | Page background |
| `surface` | `#FFFFFF` | Cards, modals |
| `border` | `#E2E8F0` | Card borders, dividers |
| `text-primary` | `#1E293B` | Headings, word text |
| `text-secondary` | `#64748B` | Phonetic text, labels |
| `text-muted` | `#94A3B8` | Disabled, hints |

### Header Gradient
```css
background: linear-gradient(135deg, #1E3A8A 0%, #6366F1 50%, #A855F7 100%);
```

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
**Google Fonts**: `Inter` (supports Vietnamese)

### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Page title | 24px (1.5rem) | 700 | 1.2 |
| Section heading | 18px (1.125rem) | 600 | 1.3 |
| Card word | 16px (1rem) | 600 | 1.4 |
| Body/Label | 14px (0.875rem) | 400 | 1.5 |
| Phonetic | 13px (0.8125rem) | 400 | 1.4 |
| Badge text | 12px (0.75rem) | 500 | 1 |

## Spacing System

### Base Unit: 4px
| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Icon gaps |
| `sm` | 8px | Badge padding, tight gaps |
| `md` | 12px | Card padding |
| `lg` | 16px | Section gaps |
| `xl` | 24px | Card gaps, section margins |
| `2xl` | 32px | Major sections |

### Card Specifications
- **Padding**: 12px (md)
- **Border radius**: 12px
- **Gap between cards**: 16px (lg)
- **Border**: 1px solid `border`
- **Shadow**: `0 1px 3px rgba(0,0,0,0.05)`

## Components

### 1. Navigation Header
- Fixed top, white background
- Logo (lightning icon) left-aligned
- Tab navigation: "Hoc Tap" (active), "Kham Pha"
- Right: Points badge, "Tai App" button, avatar
- Active tab: primary color with icon

### 2. Vocabulary Card
```
+----------------------------------+
| word                    [sound]  |
| [badge]     phonetic /text/      |
+----------------------------------+
```
- Min-height: 80px
- Word: 16px semibold, `text-primary`
- Phonetic: 13px regular, `text-secondary`
- Sound icon: 16x16px, `text-secondary`

### 3. Status Badges
| Status | Vietnamese | Background | Text |
|--------|------------|------------|------|
| New | Moi | `#F3E8FF` | `#A855F7` |
| Learning | Dang hoc | `#FFF7ED` | `#F97316` |

Badge: `px-2 py-0.5 rounded-full text-xs font-medium`

### 4. Practice Sidebar (Tap luyen)
- Card with list items
- Each item: icon + label + status indicator
- Status: green check (complete) or gray circle (pending)
- Items: FlashCard, Test nhanh, Luyen doc, Luyen viet

### 5. Statistics Cards (Thong ke)
- 2x2 grid layout
- Each stat: label + large number
- Number colors match status (purple/orange/green/primary)

### 6. Action Buttons
- Primary: `bg-primary text-white rounded-lg px-4 py-2`
- Secondary/Outline: `border border-primary text-primary rounded-lg px-4 py-2`
- Icon button: `p-2 rounded-full hover:bg-slate-100`

## Layout

### Grid System
- Main content: 4-column card grid (desktop)
- Sidebar: Fixed 280px width
- Gap: 16px
- Max container: 1280px centered

### Responsive Breakpoints
| Breakpoint | Width | Grid Columns |
|------------|-------|--------------|
| Mobile | < 640px | 1 column, no sidebar |
| Tablet | 640-1024px | 2 columns, sidebar below |
| Desktop | > 1024px | 4 columns + sidebar |

### Page Structure
```
[Header - full width]
[Tab Navigation: Dang hoc | On tap]
[Action Bar: Chon Hang Loat | Them Tu Moi]
[Main Grid: Cards] [Sidebar: Practice + Stats]
```

## Icons

### Icon Set
Use `lucide-react` or `heroicons`:
- Volume/Speaker: `Volume2` (16x16)
- Checkmark: `Check` (16x16, green)
- Flash: `Zap` (logo)
- Cards: `Layers` (FlashCard)
- Test: `ClipboardCheck`
- Reading: `BookOpen`
- Writing: `PenTool`
- Add: `Plus`
- Batch: `CheckSquare`

## Accessibility

- Focus ring: `ring-2 ring-primary ring-offset-2`
- Min touch target: 44x44px
- Color contrast: WCAG AA (4.5:1 body, 3:1 large)
- Audio descriptions for speaker icons
- Vietnamese language support: `lang="vi"`

## Animation

- Card hover: `transition-shadow duration-200 hover:shadow-md`
- Button press: `active:scale-95 transition-transform`
- Badge pulse for new items (optional): `animate-pulse`
- Reduced motion: `@media (prefers-reduced-motion: reduce)`
