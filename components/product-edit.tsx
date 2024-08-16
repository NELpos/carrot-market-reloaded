"use client";

import { getUploadUrl } from "@/app/product/add/actions";
import { ProductType, productUpdateSchema } from "@/app/product/add/schema";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Input from "./input";
import Button from "./button";
import { deleteCloudflarePhoto, updateProduct } from "@/app/product/edit/[id]/actions";
import { UUID_REGEX } from "@/lib/constants";

interface ProductEditProps {
    product : ProductType
}

export default function ProductEdit({id, photo, title, price, description} : {id : string, photo : string, title : string, price : number, description : string}) {
    //const [product, setProduct] = useState(product)
    const [preview, setPreview] = useState("");
    const [uploadUrl, setUploadUrl] = useState("");
    const [file, setFile] = useState<File|null>(null);
    const{register, handleSubmit, setValue, setError, formState : {errors}} = useForm<ProductType>({
      resolver:zodResolver(productUpdateSchema)
    })

    useEffect(() => {
        setValue(
            "title",
            title
        );
        setValue(
            "price",
            price
        );
        setValue(
            "description",
            description
        );
        setPreview(`${photo}/blur`)
    }, [setValue])

    const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const {
        target: { files },
      } = event;
      if (!files) {
        return;
      }
      const file = files[0];  
      //File Type Size Check
      if(!file.type.includes("image"))
          return
  
      const limitsize = 1024 ** 2 * 2; // 2MB
      if (file.size > limitsize) {
          alert("Please add file that is 2MB or less");
          return
      }
  
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFile(file);
      const { success, result } = await getUploadUrl();

      if (success) {
        const { id, uploadURL } = result;
        setUploadUrl(uploadURL);
        setValue("photo", `https://imagedelivery.net/YYfg6uE8HogFb8vkVTOKIw/${id}`)
      }
    };

    const onSubmit = handleSubmit(async (data : ProductType) => {
        if (file) {
            const cloudflareForm = new FormData();
            cloudflareForm.append("file", file);
            const response = await fetch(uploadUrl, {
                method: "post",
                body: cloudflareForm,
            });
            if (response.status !== 200) {
                return;
            }
        } 

        const formData = new FormData();
        formData.append("title", data.title)
        formData.append("price", data.price + "")
        formData.append("description", data.description)

        if(data.photo) {
            formData.append("photo", data.photo)

            //delete Cloudflare Photo
            const uuidMatch = data.photo.match(UUID_REGEX)
            const photoId = uuidMatch ? uuidMatch[0] : ""
            await deleteCloudflarePhoto(photoId);
        }
        else {
            formData.append("photo", photo)
        }
            
        formData.append("id", id)

        const updateErrors = await updateProduct(formData);

        if(updateErrors) {
            //setError()
        }
    });
    const onValid = async () => {
        await onSubmit()
    }

    return (
        <div>
          <form action={onValid} className="p-5 flex flex-col gap-5">
            <label
              htmlFor="photo"
              className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
              style={{
                backgroundImage: `url(${preview})`,
              }}
            >
              {preview !== "" ? (
                <>
                  <PhotoIcon className="w-20" />
                  <div className="text-neutral-200 text-sm">
                    변경할 사진을 업로드해주세요.
                    {errors.photo?.message}
                  </div>
                </>
              ) : null}
            </label>
            <input
              onChange={onImageChange}
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              className="hidden"
            />
            <Input
              required
              placeholder="제목"
              type="text"
              {...register("title")}
              errors={[errors.title?.message ?? ""]}
            />
            <Input
              type="number"
              required
              placeholder="가격"
              {...register("price")}
              errors={[errors.price?.message ?? ""]}
            />
            <Input
              type="text"
              required
              placeholder="자세한 설명"
              {...register("description")}
              errors={[errors.description?.message ?? ""]}
            />
            <Button text="수정하기" />
          </form>
        </div>
      );
}