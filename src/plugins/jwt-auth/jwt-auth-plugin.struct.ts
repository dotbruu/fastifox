import { z } from "zod"

export interface IRegisterAuthPlugin { 
  secret: string 
}

export interface IExecuteAuthPlugin { 
  hashedField: string 
  findableField: string 
  fieldsToken: string[]
  defaultValues?: Record<string, any>
  signUp?: {
    schema?: z.ZodObject<any>
  }
  signIn?: {
    schema?: z.ZodObject<any>
  }
}