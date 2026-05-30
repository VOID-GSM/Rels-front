# Rels Page Implementation Patterns

## Table of Contents
1. Lecture list filtering
2. Optimistic enrollment state
3. LectureForm reuse
4. ADMIN-only features
5. Lecture status handling

---

## 1. Lecture List Filtering

Client-side filtering with category tabs and `useMemo`:

```tsx
type CategoryKey = "all" | "open" | "confirmed" | "past";

const CATEGORIES: { key: CategoryKey; label: string; matches: (s: LectureStatusType) => boolean }[] = [
  { key: "all",       label: "All",         matches: () => true },
  { key: "open",      label: "Open",        matches: (s) => s === "OPEN" },
  { key: "confirmed", label: "Confirmed",   matches: (s) => s === "CONFIRMED" },
  { key: "past",      label: "Past",        matches: (s) => s === "CLOSED" || s === "UNCONFIRMED" },
];

const [selected, setSelected] = useState<CategoryKey>("all");

const filtered = useMemo(() => {
  const cat = CATEGORIES.find((c) => c.key === selected) ?? CATEGORIES[0];
  return lectures.filter((l) => cat.matches(getDisplayLectureStatus(l)));
}, [lectures, selected]);
```

Category tab UI:
```tsx
<div className="flex flex-wrap gap-2">
  {CATEGORIES.map((cat) => (
    <button
      key={cat.key}
      type="button"
      onClick={() => setSelected(cat.key)}
      className={`h-9 rounded-lg border px-4 text-sm font-medium transition-colors ${
        selected === cat.key
          ? "border-main bg-main text-black"
          : "border-main-200 bg-white text-gray-600 hover:bg-main-100"
      }`}
    >
      {cat.label}
    </button>
  ))}
</div>
```

---

## 2. Optimistic Enrollment State

Merge local action result with server data via `useMemo`:

```tsx
const [enrollResult, setEnrollResult] = useState<"ENROLLED" | "WAITING" | "ERROR" | null>(null);

const { mutate: enroll, isPending: isEnrolling } = useEnrollLecture(id, {
  onSuccess: (data) => setEnrollResult(data.enrollmentStatus),
  onError: () => setEnrollResult("ERROR"),
});
const { mutate: cancel, isPending: isCancelling } = useCancelEnrollment(id, {
  onSuccess: () => setEnrollResult(null),
  onError: () => setEnrollResult("ERROR"),
});

const enrollStatus = useMemo<"ENROLLED" | "WAITING" | null>(() => {
  if (enrollResult === "ENROLLED" || enrollResult === "WAITING") return enrollResult;
  if (enrollResult === "ERROR") return null;
  if (!enrollments || !user) return null;
  if (enrollments.enrolled.some((a) => a.userId === user.userId)) return "ENROLLED";
  if (enrollments.waiting.some((a) => a.userId === user.userId)) return "WAITING";
  return null;
}, [enrollResult, enrollments, user]);
```

Enrollment button branching:
```tsx
{isCreator ? (
  <Button variant="waiting" disabled className="py-3 mt-2">This is your lecture</Button>
) : displayStatus === "CLOSED" || displayStatus === "UNCONFIRMED" ? (
  <Button variant={displayStatus === "CLOSED" ? "cancel" : "waiting"} disabled className="py-3 mt-2">
    {displayStatus === "UNCONFIRMED" ? "Unconfirmed" : "Closed"}
  </Button>
) : enrollStatus === "ENROLLED" || enrollStatus === "WAITING" ? (
  <Button variant="cancel" onClick={() => cancel()} disabled={isCancelling} className="py-3 mt-2">
    {isCancelling ? "Cancelling..." : enrollStatus === "ENROLLED" ? "Cancel enrollment" : "Leave waitlist"}
  </Button>
) : (
  <Button
    variant={isFull ? "waiting" : "primary"}
    onClick={() => enroll()}
    disabled={isEnrolling}
    className="py-3 mt-2"
  >
    {isEnrolling ? "Enrolling..." : isFull ? "Join waitlist" : "Enroll"}
  </Button>
)}
```

---

## 3. LectureForm Reuse

### Create page

```tsx
const { mutate: create, isPending } = useCreateLecture();

const handleSubmit = (data: LectureFormData) => {
  create(data, {
    onSuccess: (lecture) => {
      toast.success("Lecture opened.");
      router.push(`/lectures/${lecture.lectureId}`);
    },
    onError: () => toast.error("Failed to open lecture."),
  });
};

<LectureForm onSubmit={handleSubmit} isPending={isPending} submitLabel="Open" />
```

### Edit page

Map existing data to `LectureFormValues` before passing as `initialValues`:

```tsx
const mapToFormValues = (lecture: LectureType): Partial<LectureFormValues> => ({
  title: lecture.title,
  description: lecture.description,
  capacityMode: lecture.totalCapacity != null ? "total" : "grade",
  totalCapacity: lecture.totalCapacity?.toString() ?? "",
  grade1: lecture.capacityByGrade?.["1"]?.toString() ?? "",
  grade2: lecture.capacityByGrade?.["2"]?.toString() ?? "",
  grade3: lecture.capacityByGrade?.["3"]?.toString() ?? "",
  lectureLocation: lecture.lectureLocation ?? "",
  lectureDate: lecture.lectureDate ?? "",
  lectureTime: lecture.lectureTime ?? "",
  applicationDeadline: lecture.applicationDeadline ?? "",
});

const capacityMode = lecture.totalCapacity != null ? "total" : "grade";

<LectureForm
  initialValues={mapToFormValues(lecture)}
  forceCapacityMode={capacityMode}
  onSubmit={handleUpdate}
  isPending={isUpdating}
  submitLabel="Save"
  extraAction={
    <Button variant="cancel" onClick={handleDelete} disabled={isDeleting} className="py-3">
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  }
/>
```

---

## 4. ADMIN-Only Features

Notice write/edit/delete is ADMIN-only:

```tsx
const isAdmin = user?.role === "ADMIN";

{isAdmin && (
  <Link href="/notification/write">
    <Button>Write Notice</Button>
  </Link>
)}

{isAdmin && (
  <div className="flex gap-2">
    <Link href={`/notification/${notice.id}/edit`}><Pencil /></Link>
    <button onClick={handleDelete}><Delete /></button>
  </div>
)}
```

---

## 5. Lecture Status Handling

Always use `getDisplayLectureStatus` — it factors in the deadline and returns the correct display status.
Never read `lecture.lectureStatus` directly for display purposes.

```tsx
import { getDisplayLectureStatus } from "@/entities/lecture";

const displayStatus = getDisplayLectureStatus(lecture);
// "OPEN" | "CONFIRMED" | "CLOSED" | "UNCONFIRMED"
```

Badge mapping:
```tsx
const STATUS_TO_BADGE = {
  OPEN: "open",
  CONFIRMED: "confirmed",
  CLOSED: "closed",
  UNCONFIRMED: "unconfirmed",
} as const;

<Badge variant={STATUS_TO_BADGE[displayStatus]} />
```
