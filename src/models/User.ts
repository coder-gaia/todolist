import { model, models, Schema, Document } from "mongoose";

//defining the user models
export interface IUser extends Document {
  userId:string;
  user: string;
  email: string;
  password: string;
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, unique: true },
  user: { type: String, required: true }, //task title
  email: { type: String, required: true }, // task description
  password: { type: String, required: true}, // taks status
});

export const UserModel = models.User || model<IUser>("User", UserSchema);
