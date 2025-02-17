import { model, models, Schema, Document } from "mongoose";

// Definindo o modelo das tasks
export interface ITask extends Document {
  title: string;
  description: string;
  completed: boolean;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true }, //task title
  description: { type: String, required: true }, // task description
  completed: { type: Boolean, default: false }, // taks status
});

export const TaskModel = models.Task || model<ITask>("Task", TaskSchema);
