import CloseButton from "@/components/close-button";
import db from "@/lib/db";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

async function getProduct(id : number) {
    console.log(id)
    const product = await db.product.findUnique({
        where : {
            id,
        },select : {
            title:true,
            description : true,
            photo : true,
            price : true
        }
    });
    return product
}

export default async function Modal({params} : {params : {id:string}} ) {

    const product = await getProduct(Number(params.id));
    if (!product) return null
    return <div className="absolute w-full h-full z-50 flex justify-center items-center bg-black bg-opacity-60 left-0 top-0">
        <div className="max-w-screen-sm flex h-1/2 justify-cenger w-full">
            <CloseButton/>
            <div className="aspect-square bg-neutral-700 text-neutral-200 rounded-md flex justify-center items-center">
                <div className="flex flex-col w-full h-full">
                    <Image width={400} height={400}  className="object-cover w-full rounded-t-md" src={`${product.photo}/public`} alt="" />
                    <div className="flex justify-between items-start bg-neutral-800 p-3 rounded-b-md">
                        <div className="flex flex-col">
                            <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">{product.title}</h5>
                            <p className="font-normal text-gray-700 dark:text-gray-400">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{product.price}원</span>
                        </div>
                    </div>
                </div>
            {/* <PhotoIcon className="h-28" /> */}
            </div>

        </div>
    </div>
}
