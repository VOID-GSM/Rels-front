export interface LectureFormValues {
  title: string;
  description: string;
  capacityMode: "total" | "grade";
  totalCapacity: string;
  grade1: string;
  grade2: string;
  grade3: string;
  lectureLocation: string;
  lectureDate: string;
  lectureTime: string;
  applicationDeadline: string;
}

export interface LectureFormData {
  title: string;
  description: string;
  totalCapacity?: number | null;
  capacityByGrade?: { "1": number; "2": number; "3": number } | null;
  lectureLocation?: string | null;
  lectureDate?: string | null;
  lectureTime?: string | null;
  applicationDeadline?: string | null;
}

export type FormErrors = {
  title?: string;
  description?: string;
  totalCapacity?: string;
  grade1?: string;
  grade2?: string;
  grade3?: string;
  lectureLocation?: string;
  lectureDate?: string;
  lectureTime?: string;
  applicationDeadline?: string;
};
