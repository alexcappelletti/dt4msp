import mongoose from "mongoose";
import type { Project } from "#/shared/types/msp-project";
import type { HydratedDocument } from "mongoose";

const { Schema, model, models } = mongoose;

const CHECKPOINT_REASONS = ["periodic", "manual", "compaction"] as const;
const PROJECT_EVENT_TYPES = [
	"project.updated",
	"scenario.updated",
	"scenario.deleted",
	"area.updated",
	"seeded",
	"compacted",
] as const;

type CheckpointReason = (typeof CHECKPOINT_REASONS)[number];
type ProjectEventType = (typeof PROJECT_EVENT_TYPES)[number];

export interface ProjectMongo {
	projectId: string;
	project: Project;
	version: number;
	createdAt: Date;
	updatedAt: Date;
	lastEditor?: {
		userId?: string;
		email?: string;
	};
}

export interface ProjectSnapshotMongo {
	projectId: string;
	version: number;
	yjsStateBase64?: string;
	project?: Project;
	createdAt: Date;
	checkpointReason?: CheckpointReason;
}

export interface ProjectEventMongo {
	projectId: string;
	eventId: string;
	version: number;
	eventType: ProjectEventType;
	actor?: {
		userId?: string;
		email?: string;
	};
	origin?: {
		clientId?: string;
		tabId?: string;
	};
	patch?: Record<string, unknown>;
	yjsUpdateBase64?: string;
	createdAt: Date;
}

const LastEditorSchema = new Schema(
	{
		userId: { type: String, required: false },
		email: { type: String, required: false },
	},
	{ _id: false },
);

const ActorSchema = new Schema(
	{
		userId: { type: String, required: false },
		email: { type: String, required: false },
	},
	{ _id: false },
);

const OriginSchema = new Schema(
	{
		clientId: { type: String, required: false },
		tabId: { type: String, required: false },
	},
	{ _id: false },
);

export const ProjectSchema = new Schema<ProjectMongo>(
	{
		projectId: { type: String, required: true, trim: true, minlength: 1 },
		project: { type: Schema.Types.Mixed, required: true },
		version: { type: Number, required: true, min: 1 },
		createdAt: { type: Date, required: true, default: () => new Date() },
		updatedAt: { type: Date, required: true, default: () => new Date() },
		lastEditor: { type: LastEditorSchema, required: false },
	},
	{
		collection: "projects",
		versionKey: false,
		strict: "throw",
	},
);

ProjectSchema.index({ projectId: 1 }, { unique: true, name: "ux_projects_projectId" });
ProjectSchema.index({ updatedAt: -1 }, { name: "ix_projects_updatedAt_desc" });

export const ProjectSnapshotSchema = new Schema<ProjectSnapshotMongo>(
	{
		projectId: { type: String, required: true, trim: true, minlength: 1 },
		version: { type: Number, required: true, min: 1 },
		yjsStateBase64: { type: String, required: false },
		project: { type: Schema.Types.Mixed, required: false },
		createdAt: { type: Date, required: true, default: () => new Date() },
		checkpointReason: { type: String, enum: CHECKPOINT_REASONS, required: false },
	},
	{
		collection: "project_snapshots",
		versionKey: false,
		strict: "throw",
	},
);

ProjectSnapshotSchema.index({ projectId: 1, version: -1 }, { name: "ix_snapshots_projectId_version_desc" });
ProjectSnapshotSchema.index({ createdAt: -1 }, { name: "ix_snapshots_createdAt_desc" });

export const ProjectEventSchema = new Schema<ProjectEventMongo>(
	{
		projectId: { type: String, required: true, trim: true, minlength: 1 },
		eventId: { type: String, required: true, trim: true, minlength: 1 },
		version: { type: Number, required: true, min: 1 },
		eventType: { type: String, required: true, enum: PROJECT_EVENT_TYPES },
		actor: { type: ActorSchema, required: false },
		origin: { type: OriginSchema, required: false },
		patch: { type: Schema.Types.Mixed, required: false },
		yjsUpdateBase64: { type: String, required: false },
		createdAt: { type: Date, required: true, default: () => new Date() },
	},
	{
		collection: "project_events",
		versionKey: false,
		strict: "throw",
	},
);

ProjectEventSchema.index({ eventId: 1 }, { unique: true, name: "ux_events_eventId" });
ProjectEventSchema.index({ projectId: 1, version: 1 }, { name: "ix_events_projectId_version_asc" });
ProjectEventSchema.index({ projectId: 1, createdAt: -1 }, { name: "ix_events_projectId_createdAt_desc" });

export type ProjectDocument = HydratedDocument<ProjectMongo>;
export type ProjectSnapshotDocument = HydratedDocument<ProjectSnapshotMongo>;
export type ProjectEventDocument = HydratedDocument<ProjectEventMongo>;

export const ProjectModel = models.Project || model<ProjectMongo>("Project", ProjectSchema);
export const ProjectSnapshotModel = models.ProjectSnapshot || model<ProjectSnapshotMongo>("ProjectSnapshot", ProjectSnapshotSchema);
export const ProjectEventModel = models.ProjectEvent || model<ProjectEventMongo>("ProjectEvent", ProjectEventSchema);
