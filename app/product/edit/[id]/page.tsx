import Button from "@/components/button";
import Input from "@/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUploadUrl, uploadProduct } from "../../add/actions";
import { productSchema, ProductType } from "../../add/schema";
import db from "@/lib/db";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";
import { notFound } from "next/navigation";
import ProductEdit from "@/components/product-edit";

const getProduct = async (id : number) => {
  const product = await db.product.findUnique({
    where : {
        id,
    },select : {      
      title: true,
      price: true,
      photo: true,
      description:true    
    }
});
  return product
}

const getCachedProduct = nextCache(getProduct, ["product-detail"], {
  tags : ["product-detail"],
})

export default async function EditProduct({params}: {params : {id:string};}) {

  const id = Number(params.id)
  if(isNaN(id)) {
      return notFound();
  }
  const product = await getCachedProduct(id);
  if(!product) {
      return notFound();
  }

  return (
    <ProductEdit id={params.id} photo={product.photo} title={product.title} price={product.price} description={product.description}/>
  )
}
