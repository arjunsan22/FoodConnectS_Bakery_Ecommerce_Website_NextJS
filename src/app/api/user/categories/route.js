// src/app/api/user/categories/route.js
import { NextResponse } from "next/server";
import { connectDB } from '../../../../lib/DataBase/connectDB';
import Category from '../../../../models/Category';

export async function GET() {
    await connectDB();
    try {
        
        const categories = await Category.find({}).select('name');
        return NextResponse.json(categories,{status:200});
    } catch (error) {
        return NextResponse.json({error:"Failed to fetch categories"},{status:500});     
    }
}