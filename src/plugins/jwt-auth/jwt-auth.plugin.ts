import bcrypt from 'bcrypt';	
import { fastifyJwt } from "@fastify/jwt";
import { IExecuteAuthPlugin, IRegisterAuthPlugin } from "./jwt-auth-plugin.struct";
import { FastifyRequest } from "fastify";
import { FastiFoxPlugin, IFastiFoxPlugin } from '../../protocols/crud-generator-helper.struct';
import { BadRequestException, UnauthorizedException, ValidateTypeormField } from '../../helpers';

export class JWTAuthPlugin extends FastiFoxPlugin implements 
   IFastiFoxPlugin<IRegisterAuthPlugin, IExecuteAuthPlugin> {
   name = 'auth-module';

   async register({ secret }: IRegisterAuthPlugin){
      this.server.register(fastifyJwt, {
         secret,
       });
   }

   async execute({
      hashedField,
      findableField,
      signUp,
      signIn,
   }: IExecuteAuthPlugin) {
      this.server.post('/sign-up', async (request: FastifyRequest | any, reply) => {

         if(signUp?.schema) {    
            signUp.schema.parse(request.body);
          }
         
         if(!ValidateTypeormField.hasField(this.repository, findableField)){
            throw new BadRequestException('Plugin Error: The specified entity does not contain a hashed field.');
         }
         
         const dataExists = await this.repository.findOne({
            where: { [findableField]: request.body[findableField] }
         }) 
         
         if(dataExists){
            throw new BadRequestException(`Sign-up failed. Please verify your information and try again.`);
         }

         const saltToHash = 10;
         const hashedPassword = await bcrypt.hash(request.body[hashedField], saltToHash);
         
         const data = this.repository.create({
            ...request.body as any,
            [findableField]: request.body[findableField],
            [hashedField]: hashedPassword,
            ...(signUp?.defaultValues ?? {})
         });

         const dataCreated = await this.repository.save(data);
         reply.send(dataCreated);
       });

       
      this.server.post('/sign-in', async (request: FastifyRequest | any, reply) => {

         if(signIn?.schema){
            signIn.schema.parse(request.body);
         }

         if(!ValidateTypeormField.hasField(this.repository, findableField)){
            throw new BadRequestException('Plugin Error: The specified entity does not contain a hashed field.');
         }

         const dataExists = await this.repository.findOne({
            where: { [findableField]: request.body[findableField] }
         }) 

         if(!dataExists){
            throw new UnauthorizedException('Authentication fails. Please verify the data and try again.');
         }
     
         const isValidPassword = await bcrypt.compare(request.body[hashedField], dataExists[hashedField]);
         if (!isValidPassword) {
            throw new UnauthorizedException('Authentication fails. Please verify the data and try again.');
         }

         const dataToken: Record<string, string> = {};
         for(const field of signIn!.fieldsToken){
            if(!dataExists[field]){
               throw new BadRequestException('Insufficient data to generate token.');
            }
            dataToken[field] = dataExists[field];
         }
     
         const token = this.server.jwt.sign(dataToken);

         let returnableFields: Record<string, any> = {}
         if(signIn?.returnFields){
            for(const field of signIn.returnFields){
               returnableFields[field] = dataExists[field];
            }
         }
         reply.send({ ...returnableFields, token });
       });
   }
   
   static verifyToken(allowAll = false){
      return async (input: any): Promise<void> => {
         const request = input as FastifyRequest;
         try {
            await request.jwtVerify();
         } catch (error) {
            if(allowAll) return 
            throw new UnauthorizedException('Access denied. Please verify your credentials.');
         }
      }
   }
}
