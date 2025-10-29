import { NextResponse } from "next/server";
import Products from "../../../../models/Product";
import { connectDB } from "../../../../lib/DataBase/connectDB";
import cloudinary from "../../../../lib/Cloudinary";

connectDB();

export async function GET(request) {
  try {
    
    const {searchParams} = new URL(request.url);
    const id = searchParams.get('id')

    if(id){
      const product = await Products.findById(id).populate("category");
      if(!product){
        return NextResponse.json({error:"Product not found"}, {status:404})
      }
      return NextResponse.json(product,{status:200} );
    }
    else{
        const products = await Products.find().populate("category");
        return NextResponse.json(products);
        }
    } catch (error) {
      return NextResponse.json(
        { error: "Something went wrong while fetching products" },
        { status: 500 }
      );
    }
}

export async function POST(request) {
  try {
    const {
      name,
      price,
      description,
      category,
      images,
      quantity,
      productOffer,
      unit,
    } = await request.json();
    // Upload image to Cloudinary
    let uploadedImages = [];
    if (images && images.length > 0) {
      for (let img of images) {
        const result = await cloudinary.uploader.upload(img, {
          folder: "foodconnect/products",
        });
        uploadedImages.push(result.secure_url);
      }
    }
    const product = await Products.create({
      name,
      price,
      description,
      category,
      quantity,
      productOffer,
      unit,
      images: uploadedImages,
    });
    return NextResponse.json(
      { message: "Product created successfully", product },
      { status: 201 }
    );
  } catch (error) {
    console.log("error : ", error);
    return NextResponse.json(
      { error: "Something went wrong while creating product" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const {
      name,
      price,
      description,
      category,
      images,
      quantity,
      productOffer,
      unit,
      id,
    } = await request.json();
    console.log("images :", images);
    const exisitngProduct = await Products.findById(id);
    if (!exisitngProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let uploadedImages = [];
    if (images && images.length > 0) {
      for (let img of images) {
        // Check if image is a URL (already uploaded) or a new base64 string
        if (img.startsWith("http")) {
          uploadedImages.push(img);
        } else {
          const result = await cloudinary.uploader.upload(img, {
            folder: "foodconnect/products",
          });
          uploadedImages.push(result.secure_url);
        }
      }
    }
    console.log("uploadedImages : ", uploadedImages);

    const updatedProduct = await Products.findByIdAndUpdate(
      id,
      {
        name,
        price,
        description,
        category,
        quantity,
        productOffer,
        unit,
        images:
          uploadedImages.length > 0 ? uploadedImages : exisitngProduct.images,
      },
      { new: true }
    );
    return NextResponse.json(
      { message: "Product updated successfully", product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.log("error : ", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}


export async function PATCH(request) {
  try {
    const { id, blocked } = await request.json();
   console.log('id of product :',id)
   
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updatedProduct = await Products.findByIdAndUpdate(
      id,
      { blocked: blocked },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: `Product ${blocked ? 'blocked' : 'unblocked'} successfully`,
      product: updatedProduct
    }, { status: 200 });

  } catch (error) {
    console.error('Block toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to update product status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await Products.findByIdAndDelete(id);
    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
