# 🎨 Vistalock Design System - Quick Reference

## Primary Color: Teal/Cyan

```css
/* Light Mode */
--primary: oklch(0.48 0.12 165);
/* Approximately #00a896 */

/* Dark Mode */
--primary: oklch(0.55 0.14 165);
```

**Use for:**
- Primary CTAs (Create Loan, Submit, Approve)
- Active navigation states
- Links and interactive elements
- Progress indicators

---

## Semantic Colors

### ✅ Success (Green)
```css
--success: oklch(0.646 0.222 41.116);  /* #10b981 */
```
**Use for:** Active devices, successful payments, approved applications

### ⚠️ Warning (Amber)
```css
--warning: oklch(0.828 0.189 84.429);  /* #f59e0b */
```
**Use for:** Pending reviews, overdue payments, caution states

### ❌ Error (Red)
```css
--destructive: oklch(0.577 0.245 27.325);  /* #ef4444 */
```
**Use for:** Failed payments, locked devices, delete actions

### ℹ️ Info (Blue)
```css
--info: oklch(0.6 0.118 184.704);  /* #3b82f6 */
```
**Use for:** Processing states, neutral notifications, informational messages

---

## Component Quick Reference

### Badges
```tsx
// Success
<Badge className="bg-success text-success-foreground">Active</Badge>

// Warning
<Badge className="bg-warning text-warning-foreground">Pending</Badge>

// Error
<Badge className="bg-destructive text-destructive-foreground">Locked</Badge>

// Info
<Badge className="bg-info text-info-foreground">Processing</Badge>
```

### Buttons
```tsx
// Primary
<Button className="bg-primary text-primary-foreground">Create</Button>

// Secondary
<Button variant="secondary">Cancel</Button>

// Destructive
<Button variant="destructive">Delete</Button>

// Success
<Button className="bg-success text-success-foreground">Approve</Button>
```

---

## Status Mapping Guide

### Device Status
| Status | Color | Badge Class |
|--------|-------|-------------|
| Active | Success (Green) | `bg-success text-success-foreground` |
| Locked | Error (Red) | `bg-destructive text-destructive-foreground` |
| Pending | Warning (Amber) | `bg-warning text-warning-foreground` |
| Inactive | Muted (Gray) | `bg-muted text-muted-foreground` |

### Loan Status
| Status | Color | Badge Class |
|--------|-------|-------------|
| Active | Success (Green) | `bg-success text-success-foreground` |
| Overdue | Error (Red) | `bg-destructive text-destructive-foreground` |
| Pending Approval | Warning (Amber) | `bg-warning text-warning-foreground` |
| Completed | Info (Blue) | `bg-info text-info-foreground` |
| Defaulted | Error (Red) | `bg-destructive text-destructive-foreground` |

### Payment Status
| Status | Color | Badge Class |
|--------|-------|-------------|
| Success | Success (Green) | `bg-success text-success-foreground` |
| Failed | Error (Red) | `bg-destructive text-destructive-foreground` |
| Pending | Warning (Amber) | `bg-warning text-warning-foreground` |
| Refunded | Info (Blue) | `bg-info text-info-foreground` |

### Application Status
| Status | Color | Badge Class |
|--------|-------|-------------|
| Pending Ops Review | Warning (Amber) | `bg-warning text-warning-foreground` |
| Pending Risk Review | Warning (Amber) | `bg-warning text-warning-foreground` |
| Approved | Success (Green) | `bg-success text-success-foreground` |
| Rejected | Error (Red) | `bg-destructive text-destructive-foreground` |

---

## Files Updated

✅ `apps/web-dashboard/app/globals.css`  
✅ `apps/web-landing/src/app/globals.css`  
✅ `apps/customer-portal/app/globals.css`

---

## Documentation

📖 [Complete Design System](file:///c:/Users/abc/OneDrive/Desktop/Vistalock/docs/design-system.md)  
📋 [Implementation Summary](file:///c:/Users/abc/OneDrive/Desktop/Vistalock/docs/design-system-implementation.md)  
💻 [Code Examples](file:///c:/Users/abc/OneDrive/Desktop/Vistalock/docs/color-usage-examples.tsx)

---

## Key Principles

1. **Consistency**: Use the same color for the same meaning everywhere
2. **Accessibility**: All colors meet WCAG AA standards
3. **Semantic**: Colors convey meaning, not just decoration
4. **Scalable**: Easy to add new colors and variants

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-24
