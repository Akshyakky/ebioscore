import { OptionType } from "./type";

// Options for select fields
export const genderOptions: OptionType[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const departmentOptions: OptionType[] = [
  { value: "it", label: "Information Technology" },
  { value: "hr", label: "Human Resources" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Operations" },
  { value: "research", label: "Research & Development" },
  { value: "sales", label: "Sales" },
  { value: "customer_service", label: "Customer Service" },
];

export const positionOptions: OptionType[] = [
  { value: "intern", label: "Intern" },
  { value: "entry", label: "Entry Level" },
  { value: "associate", label: "Associate" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Team Lead" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
  { value: "vp", label: "Vice President" },
  { value: "executive", label: "Executive" },
];

export const roleOptions: OptionType[] = [
  { value: "admin", label: "Administrator" },
  { value: "user", label: "Standard User" },
  { value: "manager", label: "Manager" },
  { value: "hr", label: "HR Personnel" },
  { value: "finance", label: "Finance Personnel" },
  { value: "auditor", label: "Auditor" },
];

export const skillOptions: OptionType[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "react", label: "React" },
  { value: "angular", label: "Angular" },
  { value: "vue", label: "Vue.js" },
  { value: "nodejs", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: ".NET/C#" },
  { value: "php", label: "PHP" },
  { value: "sql", label: "SQL" },
  { value: "nosql", label: "NoSQL" },
  { value: "aws", label: "AWS" },
  { value: "azure", label: "Azure" },
  { value: "gcp", label: "Google Cloud" },
  { value: "docker", label: "Docker" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "devops", label: "DevOps" },
  { value: "agile", label: "Agile Methodologies" },
  { value: "pm", label: "Project Management" },
];

export const notificationOptions: OptionType[] = [
  { value: "email", label: "Email Notifications" },
  { value: "sms", label: "SMS Notifications" },
  { value: "push", label: "Push Notifications" },
  { value: "in_app", label: "In-App Notifications" },
];
