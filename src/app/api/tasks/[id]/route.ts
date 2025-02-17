import { connectToDatabase } from "@/lib/db";
import { TaskModel } from "@/models/Task";
import { NextResponse } from "next/server";


//get a task by it's id
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    await connectToDatabase();
    const { id } = params;
    const task = await TaskModel.findById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(task);
  }
  


// deleting a task
  export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    await connectToDatabase();
    const { id } = params;
    const deletedTask = await TaskModel.findByIdAndDelete(id);
  
    if (!deletedTask) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }
  
    return NextResponse.json({ message: "Task deleted successfully." });
  }

  
//updating a task
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    await connectToDatabase();
    const { id } = params;
    const { title, description, completed } = await req.json();
  
    //validation
    if (!title || !description || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "The fields 'title', 'description' and 'completed' are required." },
        { status: 400 }
      );
    }
  
    const updatedTask = await TaskModel.findByIdAndUpdate(
      id,
      { title, description, completed },
      { new: true } 
    );
  
    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }
  
    return NextResponse.json(updatedTask);
  }