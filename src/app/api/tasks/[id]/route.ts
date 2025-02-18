import { connectToDatabase } from "@/lib/db";
import { TaskModel } from "@/models/Task";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken"; // Importing jwt

// Function to verify the token
async function verifyToken(req: NextRequest) {
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verifying the JWT token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (!decodedToken.userId) {
      return NextResponse.json({ error: "Invalid token, no user ID" }, { status: 401 });
    }

    return decodedToken;  // Returning the decoded token
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

// Function to check if the decodedToken is valid or contains an error
function isErrorResponse(decodedToken: JwtPayload | NextResponse): decodedToken is NextResponse {
  return 'status' in decodedToken; // Checks if it's an error
}

// GET a task by its id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decodedToken = await verifyToken(req); // Verifying the token

    // If the token is not valid, it will return a NextResponse with an error.
    if (isErrorResponse(decodedToken)) {
      return decodedToken; // Returns the error response
    }

    await connectToDatabase(); // Connecting to the database

    // Awaiting the resolution of params before accessing the id
    const { id } = await params;

    console.log('Decoded Token:', decodedToken); // Added for debugging
    console.log('Task ID:', id); // Added for debugging

    // Fetching the task from the database
    const task = await TaskModel.findById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    console.log('Task found:', task); // Added for debugging

    // Checking if the task belongs to the logged-in user
    if (task.userId.toString() !== decodedToken.userId) { // Converting ObjectId to string for comparison
      console.log('User ID mismatch:', task.userId.toString(), decodedToken.userId); // For debugging
      return NextResponse.json({ error: "Forbidden: You cannot access this task" }, { status: 403 });
    }

    return NextResponse.json(task); // Returning the task
  } catch (error) {
    console.error('Error:', error); // Added for debugging
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}


// DELETE a task
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decodedToken = await verifyToken(req); // Verifying the token

    // If the token is not valid, it will return a NextResponse with an error.
    if (isErrorResponse(decodedToken)) {
      return decodedToken; // Returns the error response
    }

    await connectToDatabase(); // Connecting to the database
    const { id } = await params;

    // Fetching the task from the database
    const task = await TaskModel.findById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Checking if the task belongs to the logged-in user
    if (task.userId.toString() !== decodedToken.userId) { // Converting ObjectId to string for comparison
      console.log('User ID mismatch:', task.userId.toString(), decodedToken.userId); // For debugging
      return NextResponse.json({ error: "Forbidden: You cannot delete this task" }, { status: 403 });
    }

    // Deleting the task
    await TaskModel.findByIdAndDelete(id);
    return NextResponse.json({ message: "Task deleted successfully." });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// PUT (update a task)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decodedToken = await verifyToken(req); // Verifying the token

    // If the token is not valid, it will return a NextResponse with an error.
    if (isErrorResponse(decodedToken)) {
      return decodedToken; // Returns the error response
    }

    await connectToDatabase(); // Connecting to the database
    const { id } = await params;
    const { title, description, completed } = await req.json();

    // Validating the fields
    if (!title || !description || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "The fields 'title', 'description' and 'completed' are required." },
        { status: 400 }
      );
    }

    // Fetching the task from the database
    const task = await TaskModel.findById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Checking if the task belongs to the logged-in user
    if (task.userId.toString() !== decodedToken.userId) { // Converting ObjectId to string for comparison
      console.log('User ID mismatch:', task.userId.toString(), decodedToken.userId); // For debugging
      return NextResponse.json({ error: "Forbidden: You cannot update this task" }, { status: 403 });
    }

    // Updating the task
    const updatedTask = await TaskModel.findByIdAndUpdate(
      id,
      { title, description, completed },
      { new: true }
    );

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
