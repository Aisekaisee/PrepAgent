export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface Profile {
  userId: string;
  education?: Education;
  programmingSkills: string[];
  technicalSubjects: string[];
  targetCompanies: string[];
  timelineWeeks: number;
  roadmapStale?: boolean;
  updatedAt?: string;
}

export interface ProfileUpdateRequest {
  education?: Education;
  programmingSkills?: string[];
  technicalSubjects?: string[];
  targetCompanies?: string[];
  timelineWeeks?: number;
}
