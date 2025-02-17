import { connectToDatabase } from "@/lib/db";
import { TaskModel } from "@/models/Task";
import { NextResponse } from "next/server";

//inserting a new task in the database  
export async function POST(req: Request) {
    await connectToDatabase();
    const { title, description } = await req.json();
  
    //if the user doesn't provide both the tiitle and the description, it'll throw an erorr.
    if (!title || !description) {
      return NextResponse.json(
        { error: "These fields are required!" },
        { status: 400 }
      );
    }
  
    const newTask = await TaskModel.create({ title, description });
    return NextResponse.json(newTask, { status: 201 });
  }


//here im checking if there is any search params whatsoever, if not, it'll return all the tasks
export async function GET(req: Request) {
    await connectToDatabase();
  
    //extracts the search params URL
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const completedParam = searchParams.get("completed");
  
    //if there is no param, it'll return all of 'em
    if (!title && completedParam === null) {
      const tasks = await TaskModel.find();
      return NextResponse.json(tasks);
    }

    //otherwise it'll build the filter search
    const filter: any = {};
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }
    if (completedParam !== null) {
      filter.completed = completedParam === "true";
    }
  
    const tasks = await TaskModel.find(filter);
    return NextResponse.json(tasks);
  }

