import { FastifyInstance } from "fastify";
import { DataSource } from "typeorm";
import { IFastiFoxModuleContructor } from "../protocols/crud-generator-helper.struct";

export abstract class FastiFoxModule {
  server: FastifyInstance
  datasource: DataSource

  constructor({ datasource, server }: IFastiFoxModuleContructor){
    this.datasource = datasource
    this.server = server;
  }

  abstract init(): void
}