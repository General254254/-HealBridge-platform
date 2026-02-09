export enum UserRole {
    PATIENT = 'PATIENT',
    SURVIVOR = 'SURVIVOR',
    CAREGIVER = 'CAREGIVER',
    HEALTHCARE_PROFESSIONAL = 'HEALTHCARE_PROFESSIONAL',
    MODERATOR = 'MODERATOR',
    ADMIN = 'ADMIN',
}

export enum ConditionCategory {
    CANCER = 'CANCER',
    TOURETTE = 'TOURETTE',
    LYME = 'LYME',
    OTHER = 'OTHER',
}

export enum ContentType {
    ARTICLE = 'ARTICLE',
    VIDEO = 'VIDEO',
    PDF = 'PDF',
    WEBINAR = 'WEBINAR',
}

export enum VerificationStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
}
