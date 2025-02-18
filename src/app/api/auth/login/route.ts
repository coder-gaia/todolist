import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  await connectToDatabase();

  const { email, password } = await req.json();

  // basic validation
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  // search the user through his/her email
  const user = await UserModel.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 }
    );
  }

  // verify if the password is correct
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 }
    );
  }

  // generates the jwt token
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  // const tokenPayload = { userId: user._id, email: user.email };
  const token = jwt.sign(
    { userId: user._id, email: user.email }, // inserting the userId
    process.env.JWT_SECRET as string, 
    { expiresIn: '1h' }
  );
  // returns the token
  return NextResponse.json(
    { message: "Login successful", token },
    { status: 200 }
  );
}
