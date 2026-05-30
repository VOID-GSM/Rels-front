---
name: rels-component-dev
description: |
  Writes shared UI components and SVG icons for Rels.
  Use this skill when adding or modifying components under src/components/common/ or src/assets/svg/.
  Used by the rels-component-writer agent.
---

## Before Writing

Always explore `src/components/common/` to check for similar existing components.
- Similar component found: extend its props (preserve existing ones)
- Only create a new file when the pattern is entirely new

## Component Base Structure

```tsx
"use client"; // only when using state or event handlers

export interface {ComponentName}Props {
  // all props explicitly typed
  className?: string; // include when style overrides should be allowed
}

export default function {ComponentName}({ ... }: {ComponentName}Props) {
  return ( ... );
}
```

## Tailwind v4 Color Tokens

| Purpose | Class |
|---------|-------|
| Primary action background | `bg-main` |
| Primary text | `text-main` |
| Light background | `bg-main-100` |
| Medium background | `bg-main-200` |
| Border | `border-main-300` |
| Error text | `text-error` |
| Error border | `border-error` |
| Disabled / placeholder text | `text-gray-400` |

**Prohibited:** hardcoded arbitrary colors (`text-blue-500`, `bg-red-100`, `border-green-300`, etc.)

## Reusing Existing Components

### Button
```tsx
<Button variant="primary" onClick={...} disabled={isPending} className="py-3">
  {isPending ? "Processing..." : "Action"}
</Button>
// variant: "primary" | "cancel" | "waiting"
```

### Input
```tsx
<Input
  label="Label"
  placeholder="placeholder"
  type="text"  // "text" | "number" | "date" | "time" | "datetime-local"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={errors.field}
/>
```

### Badge
```tsx
<Badge variant="open" />
// variant: "open" | "confirmed" | "closed" | "unconfirmed"
```

### LectureForm
Always reuse `LectureForm` for lecture create/edit pages — do not rebuild a form from scratch.
```tsx
// Create
<LectureForm onSubmit={handleSubmit} isPending={isPending} submitLabel="Open" />

// Edit (pass initialValues + forceCapacityMode)
<LectureForm
  initialValues={mappedValues}
  forceCapacityMode={existingMode}
  onSubmit={handleUpdate}
  isPending={isUpdating}
  submitLabel="Save"
  extraAction={<DeleteButton />}
/>
```

## Error / State Patterns

```tsx
// Inline error message
{error && <p className="text-xs text-error">{error}</p>}

// Empty state
{items.length === 0 && (
  <p className="text-sm text-gray-400">No items found.</p>
)}

// Inline loading spinner
<div className="w-8 h-8 border-2 border-main/30 border-t-main rounded-full animate-spin" />
```

## SVG Icon Pattern

```tsx
// src/assets/svg/{IconName}.tsx
export default function {IconName}({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* paths */}
    </svg>
  );
}
```

Existing SVG icons: Arrow, Building, Calendar, Cancel, Clock, Delete, HashTag, Location, Logout, Mail, More, Notification, Pencil, People, Person, Plus, Security, Setting

## Responsive Patterns

- Mobile only: `md:hidden`; Desktop only: `hidden md:flex`
- Horizontal padding: `px-4 sm:px-8 lg:px-20`
- Auto-fill grid: `grid-cols-[repeat(auto-fill,minmax(280px,300px))]`
