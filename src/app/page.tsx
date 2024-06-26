'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Filter } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import axios from 'axios'
import { QueryResult } from "@upstash/vector";
import type { Product as TProduct } from "@/db";
import Product from "@/components/Products/Product";
import ProductSkeleton from "@/components/Products/ProductSkeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductState } from "@/lib/validators/product-validator";
import { Slider } from "@/components/ui/slider";
import debounce from 'lodash.debounce'
import EmptyState from "@/components/Products/EmptyState";
const SORT_OPTIONS = [
  {name:"None",value:"none"},
  {name:"Price: Low to High",value:"price-asc"},
  {name:"Price: High to Low",value:"price-desc"},
] as const

const SUBCATEGORIES=[
  {name:"T- Shirts", selected :true , href:"#" },
  {name:"Hoodies", selected :false , href:"#" },
  {name:"sweatshirts", selected :false , href:"#" },
  {name:"Accessories", selected :false , href:"#" }
] 


const COLOR_FILTERS={
  id:"color",
  name:"Color",
  options:[
    { value:"white", label:"White"},
    { value:"beige", label:"Beige"},
    { value:"blue", label:"Blue"},
    { value:"green", label:"Green"},
    { value:"purple", label:"Purple"},
  ] as const
} 

const SIZE_FILTERS={
  id:"size",
  name:"Size",
  options:[
    { value:"S", label:"S"},
    { value:"M", label:"M"},
    { value:"L", label:"L"},

  ]
} as const


const PRICE_FILTERS ={
  id:"price",
  name:"Price",
  options:[
    {value:[0,100], label:'Any price'},
    {value:[0,20], label:'under 20€'},
    {value:[0,40], label:'under 40€'}
    // custom options defined in jsx
  ]

} as const

const DEFAULT_CUSTOM_PRICE =[0,100] as [number, number]
export default function Home() {
  const [filter,setFilter]=useState<ProductState>({
    sort:"none",
    price:{isCustom:false,range:DEFAULT_CUSTOM_PRICE},
    color:["beige","blue","green","white", "purple"],
    size:["L","M","S"]
  })

  // console.log(filter)
  const {data:products,refetch}= useQuery({
    queryKey:["products"],
    queryFn:async()=>{
      const {data}= await axios.post<QueryResult<TProduct>[]>(
        "http://localhost:3000/api/products",
        {
          filter:{
            sort:filter.sort,
            color:filter.color,
            price:filter.price.range,
            size:filter.size
          }
        }
      )
      return data
    }
  })
  console.log(products)
  const onSubmit=()=>refetch()

  const debounceSubmit=debounce(onSubmit,400)
  const _debounceSubmit= useCallback(debounceSubmit,[])
  
  const applyArrayFilter = ({catergory , value}:{
    catergory : keyof Omit<typeof filter,"price"| "sort">,
    value : string
  })=>{
    const isFilterApplied = filter[catergory].includes(value as never)
    if (isFilterApplied){
      setFilter((prev)=> ({...prev, [catergory]:prev[catergory].filter((v)=> v!== value )}))
    }else{
      setFilter((prev)=> ({...prev, [catergory]:[...prev[catergory],value]}))
    }
  
    
  }

  const minPrice =Math.min(filter.price.range[0],filter.price.range[1])
  const maxPrice =Math.max(filter.price.range[0],filter.price.range[1])


  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className=" flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
        <h1 className=" text-4xl font-bold tracking-tighter text-gray-900">
          High-quality cotton selection
        </h1>
        <div className="flex item-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
              Sort
              <ChevronDown className="mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-900"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((option)=>(

                <button className={cn('text-left w-full block px-4 py-2 text-sm ', {"text-gray-900 bg-gray-100": option.value===filter.sort, "text-gray-500":option.value !== filter.sort})}  key={option.name} onClick={()=>{
                  setFilter((prev)=>({
                    ...prev,
                    sort:option.value
                  } ))
                  _debounceSubmit()
                }}>{option.name}</button>

              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button className="m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
            <Filter className="h-5 w-5"/>
          </button>
        </div>
      </div>
      <section className="pb-24 pt-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* filters */}
          <div className="hidden lg:block">
            <ul className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
            
              {SUBCATEGORIES.map((category)=>(
                <li key={category.name}>
                  <button
                   disabled={!category.selected} 
                   className="disabled:cursor-not-allowed disabled:opacity-60">
                    
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
            <Accordion type="multiple" className="animate-none">
              {/* color filter */}

              <AccordionItem value="color">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium texy-gray-900">Color</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {COLOR_FILTERS.options.map((option,optionIdx)=>(
                      <li key={option.value} className="flex items-center">
                        <input 
                        type="checkbox" 
                        onChange={()=>{
                          applyArrayFilter({
                            catergory:'color',
                            value:option.value
                          })
                          _debounceSubmit()
                        }}
                        checked={filter.color.includes(option.value)}
                        id={`color-${optionIdx}`} 
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                        <label htmlFor={`color-${optionIdx}`} className="ml-3 text-sm text-gray-600">{option.label}</label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* size filter */}

              <AccordionItem value="size">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium texy-gray-900">Size</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {SIZE_FILTERS.options.map((option,optionIdx)=>(
                      <li key={option.value} className="flex items-center">
                        <input 
                        type="checkbox" 
                        onChange={()=>{
                          applyArrayFilter({
                            catergory:'size',
                            value:option.value
                          })
                          _debounceSubmit()
                        }}

                        checked={filter.size.includes(option.value)}
                        id={`size-${optionIdx}`} 
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                        <label htmlFor={`size-${optionIdx}`} className="ml-3 text-sm text-gray-600">{option.label}</label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* price filter */}

              <AccordionItem value="price">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium texy-gray-900">Price</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {PRICE_FILTERS.options.map((option,optionIdx)=>(
                      <li key={option.label} className="flex items-center">
                        <input 
                        type="radio" 
                        name="price"
                        onChange={()=>{
                          setFilter((prev)=>({
                            ...prev,
                            price :{isCustom:false,range:[...option.value]}
                          }))
                          _debounceSubmit()
                        }}

                        checked={!filter.price.isCustom && filter.price.range[0]===option.value[0] && filter.price.range[1]===option.value[1]}
                        id={`price-${optionIdx}`} 
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                        <label htmlFor={`price-${optionIdx}`} className="ml-3 text-sm text-gray-600">{option.label}</label>
                      </li>
                    ))}
                    <li className="flex justify-center flex-col gap-2">
                      <div>
                      <input 
                        type="radio" 
                        name="price"
                        onChange={()=>{
                          setFilter((prev)=>({
                            ...prev,
                            price :{isCustom:true,range:[0,100]}
                          }))
                          _debounceSubmit()
                        }}

                        checked={filter.price.isCustom}
                        id={`price-${PRICE_FILTERS.options.length}`} 
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                        <label htmlFor={`price-${PRICE_FILTERS.options.length}`} className="ml-3 text-sm text-gray-600">Custom</label>
                      </div>

                      <div className="flex justify-between">
                        <p className="font-medium">Price</p>
                        <p className="font-medium">
                        {filter.price.isCustom
                        ? minPrice.toFixed(0)
                        :filter.price.range[0].toFixed(0)} € - {
                        filter.price.isCustom
                        ? maxPrice.toFixed(0)
                        :filter.price.range[1].toFixed(0)
                        } €
                        </p>
                      </div>
                      <Slider className={cn({'opacity-50':!filter.price.isCustom})}
                      disabled={!filter.price.isCustom}
                      value={filter.price.isCustom
                        ? filter.price.range
                        : DEFAULT_CUSTOM_PRICE}
                      min={DEFAULT_CUSTOM_PRICE[0]}
                      max={DEFAULT_CUSTOM_PRICE[1]}
                      defaultValue={DEFAULT_CUSTOM_PRICE}
                      step={5}
                      onValueChange={(range)=>{
                        const [newMin,newMax]=range
                        setFilter((prev)=>({
                          ...prev,
                          price :{isCustom:true,range:[newMin,newMax]}
                        }))
                        _debounceSubmit()
                      }}
                      />
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          {/* product grids */}
          <ul  className="lg:col-span-3 grid grid-col-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products && products.length ===0  
            ? <EmptyState/> 
            :products? products.map((product:any)=>(
                  <Product key={product.metadata?.id} product={product.metadata!} />
                ))
              :new Array(12).fill(null).map((_,i)=> <ProductSkeleton key={i}/>)
            }
          </ul>
        </div>
      </section>
    </main>
  );
}
