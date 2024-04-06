import { db } from "@/db"
import { ProductFilterValidator } from "@/lib/validators/product-validator"
import { NextRequest } from "next/server"


class filter{
    private filters:Map<string, string[]> =new Map()

    hasFilter(){
        return this.filters.size>0
    }
    add(key:string,operator:string,value:string| number){
        const filter = this.filters.get(key)|| []
    }
}
export const POST=async (request:NextRequest)=>{
    const body = await request.json()
    const {size , color , sort , price} =ProductFilterValidator.parse(body.filter)
    const products= await db.query({
        topK:12,
        vector:[0,0,0],
        includeMetadata:true
    })
    return new Response(JSON.stringify(products))
}

