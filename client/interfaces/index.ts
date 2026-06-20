export interface IWorker {
  id: string;
  name: string;
  email: string;
}

export interface ICreator {
  id: string;
  name: string;
  email: string;
}

export interface IOrganization {
  id: string;
  name: string;
}

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface ITask {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  creatorId: string;
  assignedTo: string | null;
  status: TaskStatus;
  latitude: number;
  longitude: number;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;

  assignedWorker: IWorker | null;
  creator: ICreator;
  organization: IOrganization;
}