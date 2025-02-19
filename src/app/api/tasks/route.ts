import { connectToDatabase } from "@/lib/db";
import { TaskModel } from "@/models/Task";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getToken } from "next-auth/jwt";

// Inserting a new task in the database
export async function POST(req: NextRequest) {

  //getting the token directly from the header
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    //veryfing the jwt token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decodedToken.userId;

    if (!userId) {
      return NextResponse.json({ error: "Invalid token, no user ID" }, { status: 401 });
    }

    const { title, description } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "These fields are required!" },
        { status: 400 }
      );
    }

    //creating a new task with the user Id associated
    const newTask = await TaskModel.create({
      title,
      description,
      completed:false,
      userId: userId // vinculating the task to the user
    });    

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}


// Getting all tasks (with optional filters)
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verifying the JWT token
    const decodedToken = jwt.verify(token as string, process.env.JWT_SECRET as string) as JwtPayload;
    
    const filter: any = { userId: decodedToken.userId }; // Filtering by the user's id
    console.log("Filter:", filter);

    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const completedParam = searchParams.get("completed");

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }
    if (completedParam !== null) {
      if (completedParam === "true") filter.completed = true;
      else if (completedParam === "false") filter.completed = false;
    }
    

    const tasks = await TaskModel.find(filter);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
