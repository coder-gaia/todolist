import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  await connectToDatabase();
  const { user, email, password } = await req.json();

  // validation: all the fields are required
  if (!user || !email || !password) {
    return NextResponse.json(
      { error: "User, email and password are required." },
      { status: 400 }
    );
  }

  // verify if the user already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return NextResponse.json(
      { error: "A user with this email already exists." },
      { status: 409 }
    );
  }

  // password hash
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // creates a new user
  const newUser = await UserModel.create({ user, email, password: hashedPassword });

  // returns the new user
  const { password: _, ...userWithoutPassword } = newUser.toObject();

  return NextResponse.json(
    { message: "User created successfully", user: userWithoutPassword },
    { status: 201 }
  );
}