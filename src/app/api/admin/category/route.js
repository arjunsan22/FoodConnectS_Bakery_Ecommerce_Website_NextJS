import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/DataBase/connectDB";
import Category from '../../../../models/Category';

connectDB();
export async function GET(request){
    try {
        const categories = await Category.find({});
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({error:"Failed to fetch categories"},{status:500});
    }
}

export async function POST(request){
    try{
        const {name,description} = await request.json();
        if(!name || name.trim() ===""){
            return NextResponse.json({error:"Category name is required"},{status:400});
        }
        const existingCategory = await Category.findOne({name:name.trim()});
        if(existingCategory){
            return NextResponse.json({error:'Category name must be unique'},{status:400});
        }

        const category = await Category.create({name:name.trim(),description});
        return NextResponse.json({message:"Category created successfully",category},{status:201});

    }catch(error){
        return NextResponse.json({error:"Failed to create category"},{status:500});

    }
}


export async function PUT(request){
    try {
        const {id,name, description} = await request.json();

        if(!name || name.trim() ===""){
            return NextResponse.json({error:"Category name is required"},{status:400});
        }
        const existingCategory = await Category.findOne({name:name.trim()});
        if(existingCategory){
            return NextResponse.json({error:'Category already exists'},{status:400});
        }

        const updatedCategory = await Category.findByIdAndUpdate(id,{name:name.trim(),description},{new:true})
        return NextResponse.json({message:'Category udated successfully',updatedCategory},{status:200});
    } catch (error) {
        return NextResponse.json({error:"Failed to update category"},{status:500});
    }
}


export async function DELETE(request){
    try {
        const {id} = await request.json();
        await Category.findByIdAndDelete(id);
        return NextResponse.json({message:"Category deleted successfully"},{status:200});
    } catch (error) {
        return NextResponse.json({error:"Failed to delete category"},{status:500});
    }
}