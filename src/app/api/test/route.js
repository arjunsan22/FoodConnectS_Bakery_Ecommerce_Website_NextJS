import { connectDB } from "../../../lib/DataBase/connectDB";

export async function GET() {
  await connectDB();
  return Response.json({ message: "MongoDB connected successfully!" });
}
