# Vistalock Design System

## Brand Identity

Vistalock is a **Device Financing & Remote Locking Platform** for BNPL businesses. The design system reflects:
- **Trust & Security**: Financial technology requires confidence
- **Modern & Professional**: Clean, contemporary interface
- **Accessible**: Clear hierarchy and readable content
- **Consistent**: Unified experience across all touchpoints

---

## Color Palette

### Primary Colors

The primary color is a **vibrant teal/cyan** that conveys trust, technology, and innovation.

```css
/* Light Mode */
--primary: oklch(0.48 0.12 165);           /* Teal #00a896 */
--primary-foreground: oklch(0.985 0 0);    /* White text on primary */

/* Dark Mode */
--primary: oklch(0.55 0.14 165);           /* Lighter teal for dark mode */
--primary-foreground: oklch(0.985 0 0);    /* White text */
```

**Usage:**
- Primary CTAs (Create Loan, Submit, Approve)
- Active states in navigation
- Important status indicators (Active, Approved)
- Links and interactive elements

### Secondary Colors

```css
/* Light Mode */
--secondary: oklch(0.97 0 0);              /* Light gray */
--secondary-foreground: oklch(0.48 0.12 165); /* Teal text */

/* Dark Mode */
--secondary: oklch(0.269 0 0);             /* Dark gray */
--secondary-foreground: oklch(0.985 0 0);  /* White text */
```

**Usage:**
- Secondary buttons (Cancel, Back)
- Subtle backgrounds
- Alternative actions

### Semantic Colors

#### Success (Green)
```css
--success: oklch(0.646 0.222 41.116);      /* Green #10b981 */
--success-foreground: oklch(0.985 0 0);
```
**Usage:** Successful payments, active devices, approved status

#### Warning (Amber)
```css
--warning: oklch(0.828 0.189 84.429);      /* Amber #f59e0b */
--warning-foreground: oklch(0.145 0 0);
```
**Usage:** Pending reviews, overdue warnings, attention needed

#### Error/Destructive (Red)
```css
--destructive: oklch(0.577 0.245 27.325);  /* Red #ef4444 */
--destructive-foreground: oklch(0.985 0 0);
```
**Usage:** Failed payments, locked devices, rejected applications, delete actions

#### Info (Blue)
```css
--info: oklch(0.6 0.118 184.704);          /* Blue #3b82f6 */
--info-foreground: oklch(0.985 0 0);
```
**Usage:** Informational messages, help text, neutral notifications

### Neutral Colors

```css
/* Backgrounds */
--background: oklch(1 0 0);                /* White */
--card: oklch(1 0 0);                      /* White */
--popover: oklch(1 0 0);                   /* White */

/* Foregrounds */
--foreground: oklch(0.145 0 0);            /* Near black */
--card-foreground: oklch(0.145 0 0);
--popover-foreground: oklch(0.145 0 0);

/* Muted */
--muted: oklch(0.97 0 0);                  /* Light gray */
--muted-foreground: oklch(0.556 0 0);      /* Medium gray */

/* Borders & Inputs */
--border: oklch(0.922 0 0);                /* Light gray border */
--input: oklch(0.922 0 0);                 /* Input border */
--ring: oklch(0.708 0 0);                  /* Focus ring */
```

### Chart Colors

For data visualization (reports, analytics):

```css
--chart-1: oklch(0.646 0.222 41.116);      /* Green */
--chart-2: oklch(0.6 0.118 184.704);       /* Blue */
--chart-3: oklch(0.398 0.07 227.392);      /* Purple */
--chart-4: oklch(0.828 0.189 84.429);      /* Amber */
--chart-5: oklch(0.769 0.188 70.08);       /* Orange */
```

---

## Typography

### Font Families

```css
--font-sans: 'Geist Sans', system-ui, -apple-system, sans-serif;
--font-mono: 'Geist Mono', 'Courier New', monospace;
```

### Font Scale

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| H1 | 2.25rem (36px) | 700 | Page titles |
| H2 | 1.875rem (30px) | 600 | Section headers |
| H3 | 1.5rem (24px) | 600 | Card titles |
| H4 | 1.25rem (20px) | 600 | Subsections |
| Body | 1rem (16px) | 400 | Default text |
| Small | 0.875rem (14px) | 400 | Helper text |
| Tiny | 0.75rem (12px) | 400 | Labels, captions |

---

## Spacing

Based on 4px base unit:

```
--spacing-1: 0.25rem (4px)
--spacing-2: 0.5rem (8px)
--spacing-3: 0.75rem (12px)
--spacing-4: 1rem (16px)
--spacing-5: 1.25rem (20px)
--spacing-6: 1.5rem (24px)
--spacing-8: 2rem (32px)
--spacing-10: 2.5rem (40px)
--spacing-12: 3rem (48px)
--spacing-16: 4rem (64px)
```

---

## Border Radius

```css
--radius: 0.625rem (10px);                 /* Base radius */
--radius-sm: calc(var(--radius) - 4px);    /* 6px - Small elements */
--radius-md: calc(var(--radius) - 2px);    /* 8px - Inputs */
--radius-lg: var(--radius);                /* 10px - Cards */
--radius-xl: calc(var(--radius) + 4px);    /* 14px - Modals */
--radius-2xl: calc(var(--radius) + 8px);   /* 18px - Large cards */
--radius-3xl: calc(var(--radius) + 12px);  /* 22px */
--radius-4xl: calc(var(--radius) + 16px);  /* 26px */
```

**Usage:**
- **sm (6px)**: Badges, tags, small buttons
- **md (8px)**: Input fields, dropdowns
- **lg (10px)**: Buttons, cards, default
- **xl (14px)**: Modals, dialogs
- **2xl+ (18px+)**: Hero sections, large containers

---

## Component Patterns

### Buttons

#### Primary Button
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Create Loan
</Button>
```

#### Secondary Button
```tsx
<Button variant="secondary">
  Cancel
</Button>
```

#### Destructive Button
```tsx
<Button variant="destructive">
  Delete Device
</Button>
```

#### Outline Button
```tsx
<Button variant="outline">
  View Details
</Button>
```

### Status Badges

```tsx
// Active/Success
<Badge className="bg-success text-success-foreground">Active</Badge>

// Warning/Pending
<Badge className="bg-warning text-warning-foreground">Pending</Badge>

// Error/Locked
<Badge className="bg-destructive text-destructive-foreground">Locked</Badge>

// Info/Default
<Badge className="bg-info text-info-foreground">Processing</Badge>
```

### Cards

```tsx
<Card className="border-border bg-card">
  <CardHeader>
    <CardTitle>Loan Details</CardTitle>
    <CardDescription>Review loan information</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

### Forms

```tsx
<div className="space-y-2">
  <Label htmlFor="customer">Customer ID</Label>
  <Input
    id="customer"
    placeholder="Enter customer ID"
    className="border-input focus:ring-primary"
  />
  <p className="text-sm text-muted-foreground">
    Enter the UUID of the customer
  </p>
</div>
```

---

## Best Practices

### Color Usage

1. **Primary Color**: Use sparingly for important actions and key interactive elements
2. **Semantic Colors**: Always use appropriate semantic colors for status indicators
3. **Contrast**: Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
4. **Consistency**: Use the same color for the same meaning across all apps

### Accessibility

1. **Focus States**: Always provide visible focus indicators
2. **Color Independence**: Don't rely solely on color to convey information
3. **Text Contrast**: Maintain sufficient contrast ratios
4. **Touch Targets**: Minimum 44x44px for interactive elements

### Responsive Design

1. **Mobile First**: Design for mobile, enhance for desktop
2. **Breakpoints**:
   - sm: 640px
   - md: 768px
   - lg: 1024px
   - xl: 1280px
   - 2xl: 1536px

### Component Hierarchy

1. **Visual Weight**: More important = more visual weight
2. **Spacing**: Use consistent spacing to create rhythm
3. **Grouping**: Related items should be visually grouped
4. **Alignment**: Maintain consistent alignment throughout

---

## Application-Specific Guidelines

### Web Dashboard
- **Sidebar**: Use `--sidebar-primary` for active navigation items
- **Tables**: Alternate row colors with `--muted` for better readability
- **Charts**: Use chart colors in order for consistent data representation

### Customer Portal
- **Payment Status**: Use semantic colors (success/warning/error)
- **CTAs**: Primary color for payment buttons
- **Notifications**: Info color for general updates

### Landing Page
- **Hero**: Can use gradient overlays with primary color
- **Features**: Use primary color for icons and highlights
- **Trust Signals**: Use success color for checkmarks and positive indicators

---

## Implementation Checklist

- [ ] Update all `globals.css` files with consistent color tokens
- [ ] Replace hardcoded hex colors with CSS variables
- [ ] Audit all buttons for consistent variant usage
- [ ] Ensure all status badges use semantic colors
- [ ] Review form components for consistent styling
- [ ] Test color contrast ratios
- [ ] Verify dark mode appearance
- [ ] Document any custom color additions

---

## Quick Reference

### When to Use Each Color

| Color | Use Case | Example |
|-------|----------|---------|
| Primary | Main actions, active states | "Create Loan", active nav item |
| Secondary | Alternative actions | "Cancel", "Back" |
| Success | Positive outcomes | "Payment Received", "Device Active" |
| Warning | Caution needed | "Payment Overdue", "Review Pending" |
| Error | Problems, destructive actions | "Payment Failed", "Delete", "Device Locked" |
| Info | Neutral information | "Processing", "Info" |
| Muted | Backgrounds, disabled states | Disabled buttons, subtle backgrounds |

---

**Last Updated**: 2026-01-24  
**Version**: 1.0.0
