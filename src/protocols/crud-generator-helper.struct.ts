import { FastifyInstance } from "fastify";
import { DataSource, EntityTarget, Repository } from "typeorm";
import { z } from "zod";
import * as http from 'http';
export interface IFoxFlowPlugin<R = any, E = any> {
  name: string
  register: (data: R) => void
  execute: (data: E) => void
}

export interface IFoxFlowRoutePluginConnector {
  start: IFoxFlowPlugin[]
  middle: IFoxFlowPlugin[]
  end: IFoxFlowPlugin[]
}

export interface IUniqueRoute {
  status?: boolean
  inputPlugins?: Array<(input: any)=> Promise<void>>
  outputPlugins?: Array<(input: any)=> Promise<void>>
}

export interface IFoxFlowRoute {
  name?: {
    singular: string
    plural: string
  }
  listOne?: {
    schema?: z.ZodObject<any>
  } & IUniqueRoute
  listMany?: {
    schema?: z.ZodObject<any>
    withPagination?: boolean
    findableFields?: string[]
  } & IUniqueRoute
  create?: {
    findableFields?: string[]
    schema?: z.ZodObject<any>
  } & IUniqueRoute
  update?: {
    schema?: z.ZodObject<any>
  } & IUniqueRoute
  delete?: {
  } & IUniqueRoute
  addRoute?: Array<IRouteMaker>
}

export enum RouteMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export interface IRouteMaker extends IUniqueRoute {
  name: string
  method: RouteMethod
  schema?: z.ZodObject<any>
  withPagination?: boolean
  findableFields?: string[]
}

export interface IGenerateCrudRouteMaker {
  routes: IRouteMaker[],
}

export interface IGenerateCrudInitialize {
  route: IFoxFlowRoute
}

export interface IFoxFlowContructor {
  server: FastifyInstance,
  entity: EntityTarget<any>;
  datasource: DataSource,
}

export interface IGenerateCrudContructor {
  entity: EntityTarget<any>;
  route: IFoxFlowRoute
}

export interface IGenerateCrudRoute {
  route: IFoxFlowRoute
}

export interface IGenerateCrudModule {
  server: FastifyInstance,
  datasource: DataSource,
}

export abstract class FoxFlowPlugin {
  repository: Repository<any>;
  entity: EntityTarget<any>;
  server: FastifyInstance;

  constructor({ datasource, entity, server }: IFoxFlowContructor){
    this.repository = datasource.getRepository(entity);
    this.server = server;
    this.entity = entity;
  }
}

export interface IFastiFoxModuleContructor {
  server: FastifyInstance<http.Server, http.IncomingMessage, http.ServerResponse>
  datasource: DataSource,
}

