"use server";

import getSession from "@/lib/session";
import { productSchema } from "../../add/schema";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProduct(formData: FormData) {
  const data = {
    photo: formData.get("photo"),
    title: formData.get("title"),
    price: formData.get("price"),
    description: formData.get("description"),
  };

  const result = productSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const id: number = Number(formData.get("id"));
    const product = await db.product.update({
      where: {
        id: id,
      },
      data: {
        title: result.data.title,
        description: result.data.description,
        price: result.data.price,
        photo: result.data.photo,
      },
    });
    revalidatePath(`/home`);
    revalidatePath(`/products/${product.id}`);
    revalidatePath(`/product/edit/${product.id}`);

    redirect(`/products/${product.id}`);
  }
}

export async function deleteCloudflarePhoto(photoId: string) {
  if (photoId !== "") {
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${photoId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}}`,
          "Content-Type": "application/json",
        },
      }
    );
  }
}
