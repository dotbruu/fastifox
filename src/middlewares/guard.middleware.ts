import { FastifyRequest } from "fastify";
import { UnauthorizedException } from "../helpers/http-exception.helper";

export interface IGuardMiddlewarePayload {
  permissions: string[] 
  permissionsField: string 
  allowAll?: boolean
}

export class GuardMiddleware {
  static verifyPermissions({
    allowAll = false,
    permissions,
    permissionsField,
  }: IGuardMiddlewarePayload){
    return async (request: FastifyRequest) => {
      const data = request.user as any;

      if(allowAll || 
        data[permissionsField] === '*' || 
        data[permissionsField] === 'superuser'){
        return;
      }

      if(!data[permissionsField]){
        throw new UnauthorizedException('Insufficient permissions to access this route.');
      }

      const dataPermissions = data[permissionsField] as string[];
      for(const permission of permissions){
        if(!dataPermissions.includes(permission)){
            throw new UnauthorizedException('Insufficient permissions to access this route.');
        }
      }
    }
  }
}