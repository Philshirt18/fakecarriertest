# FakeCarrier Design System

## Brand Identity

FakeCarrier is a modern, trustworthy email security verification platform. The design emphasizes clarity, security, and professionalism while remaining accessible to all users.

## Color Palette

### Primary Colors
- **Primary (Dark Gray)**: `#111827` - Main text, headers, important UI elements
- **Secondary (Indigo)**: `#4F46E5` - Primary actions, links, brand accent
- **Accent (Teal)**: `#14B8A6` - Success states, positive actions, highlights

### Semantic Colors
- **Secured**: `#10B981` (Emerald) - Email passed all checks
- **Low Risk**: `#F59E0B` (Amber) - Minor concerns
- **Medium Risk**: `#F97316` (Orange) - Multiple suspicious indicators
- **High Risk**: `#EF4444` (Red) - Strong phishing indicators

### Neutral Colors
- **Background**: `#FFFFFF` (White) with subtle gradients to `#F9FAFB`
- **Borders**: `#E5E7EB` (Gray-200)
- **Text Secondary**: `#6B7280` (Gray-600)

## Typography

### Font Family
**Primary**: Inter (Google Fonts)
- Fallback: system-ui, -apple-system, sans-serif

### Font Weights
- Regular: 400 (body text)
- Medium: 500 (labels, secondary headings)
- Semibold: 600 (buttons, important text)
- Bold: 700 (main headings)

### Type Scale
- **Hero**: 36px (2.25rem) - Main page titles
- **H1**: 30px (1.875rem) - Section headers
- **H2**: 24px (1.5rem) - Card titles
- **H3**: 20px (1.25rem) - Subsection headers
- **Body**: 16px (1rem) - Default text
- **Small**: 14px (0.875rem) - Labels, captions
- **Tiny**: 12px (0.75rem) - Badges, metadata

## Spacing System

Based on 4px grid:
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

## Components

### Buttons

**Primary Button**
- Background: `#4F46E5` (Secondary)
- Text: White
- Padding: 12px 24px
- Border Radius: 8px
- Font Weight: 600
- Hover: `#4338CA` (Darker indigo)

**Secondary Button**
- Background: White
- Border: 2px solid `#4F46E5`
- Text: `#4F46E5`
- Hover: Background `#4F46E5`, Text White

**Danger Button**
- Background: White
- Border: 2px solid `#F97316`
- Text: `#F97316`
- Hover: Background `#F97316`, Text White

### Cards

**Standard Card**
- Background: White
- Border: 1px solid `#E5E7EB`
- Border Radius: 16px
- Shadow: Subtle (0 1px 3px rgba(0,0,0,0.1))
- Padding: 32px

**Elevated Card**
- Shadow: Medium (0 4px 6px rgba(0,0,0,0.1))
- Used for modals, important content

### Risk Badges

**Secured**
- Background: `#D1FAE5` (Emerald-100)
- Text: `#065F46` (Emerald-900)
- Border: 2px solid `#A7F3D0` (Emerald-200)
- Icon: ✓

**Low Risk**
- Background: `#FEF3C7` (Amber-100)
- Text: `#78350F` (Amber-900)
- Border: 2px solid `#FDE68A` (Amber-200)
- Icon: ⚠️

**Medium Risk**
- Background: `#FFEDD5` (Orange-100)
- Text: `#7C2D12` (Orange-900)
- Border: 2px solid `#FED7AA` (Orange-200)
- Icon: ⚠️

**High Risk**
- Background: `#FEE2E2` (Red-100)
- Text: `#991B1B` (Red-900)
- Border: 2px solid `#FECACA` (Red-200)
- Icon: 🚨

### Form Inputs

**Text Input / Textarea**
- Border: 1px solid `#D1D5DB` (Gray-300)
- Border Radius: 8px
- Padding: 12px 16px
- Focus: 2px ring `#4F46E5`, border transparent
- Font: 16px (prevents zoom on mobile)

**Select Dropdown**
- Same as text input
- Arrow icon on right

### Icons

Use Heroicons (outline style) for consistency:
- Shield: Security, protection
- Check: Success, verified
- Warning: Caution, attention needed
- X Circle: Error, danger
- Chart Bar: Statistics, analytics
- Lock: Admin, secure areas

## Layout

### Container Widths
- **Default**: max-width 1280px (80rem)
- **Narrow**: max-width 768px (48rem) - Forms, focused content
- **Wide**: max-width 1536px (96rem) - Admin dashboards

### Responsive Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

### Grid System
- Use Tailwind's grid utilities
- Common: 1 column mobile, 2-3 columns desktop
- Gap: 24px (1.5rem) standard

## Accessibility

### Contrast Ratios
- All text meets WCAG AA standards (4.5:1 minimum)
- Large text meets AAA standards (3:1 minimum)

### Focus States
- Visible focus ring on all interactive elements
- 2px ring in secondary color (`#4F46E5`)
- Offset: 2px

### Labels
- All form inputs have associated labels
- Use aria-label for icon-only buttons
- Semantic HTML (button, nav, main, etc.)

### Keyboard Navigation
- Tab order follows visual order
- All actions accessible via keyboard
- Skip links for main content

## Animation & Transitions

### Timing
- **Fast**: 150ms - Hover states, small changes
- **Normal**: 300ms - Page transitions, modals
- **Slow**: 500ms - Complex animations

### Easing
- Default: `ease-in-out`
- Entrances: `ease-out`
- Exits: `ease-in`

### Common Transitions
- Button hover: background-color 150ms
- Card hover: shadow 300ms
- Modal: opacity + scale 300ms
- Loading spinner: rotate infinite

## Voice & Tone

### General Principles
- **Clear**: Use simple, direct language
- **Confident**: Assert security expertise
- **Helpful**: Guide users to safe actions
- **Balanced**: Technical but accessible

### Risk Communication
- **Secured**: "Email appears legitimate"
- **Low Risk**: "Some concerns detected"
- **Medium Risk**: "Multiple suspicious indicators"
- **High Risk**: "Strong phishing indicators"

### Action Language
- Use: "Scan Email", "Copy Results", "Report This Email"
- Avoid: "Submit", "Click Here", "Go"

### Error Messages
- Be specific: "Failed to scan email. Please try again."
- Not: "An error occurred."

## Premium Feature Design

### Monetization Strategy
**FakeCarrier Pro** - $29/month

Features included:
1. **PDF Reports** - Detailed, shareable security reports
2. **Batch Scanning** - Upload and scan up to 100 emails at once
3. **API Access** - Integrate with your tools and workflows
4. **Scan History** - 90-day searchable history with analytics
5. **Team Dashboard** - Collaborate with team members

### Premium UI Elements
- Gradient backgrounds for premium cards
- "Pro" badges on premium features
- Upgrade CTAs in strategic locations
- Feature comparison table

## Internationalization (i18n) Ready

### Structure
- All UI text in separate translation files
- Use i18n keys, not hardcoded strings
- Date/time formatting locale-aware
- Number formatting locale-aware

### Planned Languages
- English (default)
- Spanish
- French
- German

### Design Considerations
- Allow 30% text expansion for translations
- Avoid text in images
- Use flexible layouts
- Test with longest translations

## File Organization

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main scan interface
│   │   ├── admin/
│   │   │   └── page.tsx      # Admin dashboard
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/           # Reusable components (future)
│   └── lib/                  # Utilities (future)
├── public/
│   └── outlook-addin/        # Outlook add-in assets
└── tailwind.config.ts        # Tailwind configuration
```

## Best Practices

### Do's
✓ Use semantic HTML
✓ Maintain consistent spacing
✓ Test on mobile devices
✓ Provide clear feedback for actions
✓ Use loading states
✓ Handle errors gracefully
✓ Keep forms simple
✓ Use progressive disclosure

### Don'ts
✗ Use too many colors
✗ Overcomplicate layouts
✗ Hide important information
✗ Use jargon without explanation
✗ Ignore loading states
✗ Make users guess
✗ Use tiny touch targets (<44px)
✗ Rely on color alone for meaning

## Future Enhancements

### Phase 2
- Dark mode support
- Advanced filtering in admin
- Real-time notifications
- Saved scan templates
- Custom branding for teams

### Phase 3
- Mobile app (React Native)
- Browser extension
- Slack/Teams integration
- Advanced analytics dashboard
- White-label options

## Brand Assets

### Logo Usage
- Minimum size: 32px height
- Clear space: 16px on all sides
- Don't stretch or distort
- Use on white or light backgrounds

### Icon Set
- Heroicons (MIT license)
- Consistent stroke width
- 24px default size
- Outline style preferred

## References

- Tailwind CSS: https://tailwindcss.com
- Heroicons: https://heroicons.com
- Inter Font: https://fonts.google.com/specimen/Inter
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
