import { model, models, Schema, Document, Types } from "mongoose";

// defining the task model
export interface ITask extends Document {
  title: string;
  description: string;
  completed: boolean;
  userId: string|Types.ObjectId;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true }, //task title
  description: { type: String, required: true }, // task description
  completed: { type: Boolean, default: false }, // taks status
  userId: { type: Schema.Types.ObjectId, ref: "User"}, 
});

export const TaskModel = models.Task || model<ITask>("Task", TaskSchema);
