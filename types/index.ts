export interface Task {
    _id: string;
    title: string;
    description?: string;
    teamId: string;
    createdBy?: string;
    assignedTo?: {
        _id?: string;
        name?: string;
        email?: string;
    } | null;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    leadId?: string;
    meetingId?: string;
    dueDate?: string;
    createdAt: string;
    updatedAt?: string;
    completedAt?: string;
    completedBy?: string;
    isPreview?: boolean; // used locally for preview mode
}
