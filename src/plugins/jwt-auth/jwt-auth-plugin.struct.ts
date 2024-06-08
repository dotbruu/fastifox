import { z } from "zod"

export interface IRegisterAuthPlugin { 
  secret: string 
}

export interface IExecuteAuthPlugin { 
  hashedField: string 
  findableField: string 
  signUp?: {
    schema?: z.ZodObject<any>
    defaultValues?: Record<string, any>
  }
  signIn?: {
    schema?: z.ZodObject<any>
    fieldsToken: string[]
    returnFields?: string[]
  }
}