import { ILike, Repository } from "typeorm";
import { IGenerateCrudContructor, IGenerateCrudRoute, IGenerateCrudRouteMaker, RouteMethod } from "../protocols/crud-generator-helper.struct";
import { BadRequestException, ConflictException, NotFoundException } from "../helpers/http-exception.helper";
import { NameGenerator } from "../helpers/name-generator.helper";
import { PaginationHelper } from "../helpers/pagination-list.helper";
import { PluginConnector } from "../helpers/plugin-connector.helper";
import { FastiFoxModule } from "../helpers/fastifox-module.helper";
import { FastifyInstance, FastifyRequest } from "fastify";
import * as http from 'http';

export abstract class CrudGenerator extends FastiFoxModule{
  private repository: Repository<any> = undefined as any;

  generate({
    entity,
    route
  }: IGenerateCrudContructor) {
    this.repository = this.datasource.getRepository(entity);
    const entityName = this.datasource.getMetadata(entity).name;
    const routeName = NameGenerator.singuralPlural(entityName);

    route.create = { status: true, ...route.create };
    route.update = { status: true, ...route.update };
    route.delete = { status: true, ...route.delete };
    route.listOne = { status: true, ...route.listOne };
    route.listMany = { status: true, ...route.listMany };
    
    this.generateRoutes({ route: {
      name: {
        singular: routeName.singular,
        plural: routeName.plural
      },
      ...route,
    } })
  }

  private generateRoutes({ route }: IGenerateCrudRoute) {
    if(!route.name?.singular || !route.name?.plural) {
      throw new BadRequestException('Route name is required')
    }

    if(!!route.listOne?.status) {
      this.routeMaker({
        routes: [{
          name: `${route.name?.singular}/:id`,
          method: RouteMethod.GET,
          ...route.listOne
        }],
      })
    }
  
    if(!!route.listMany?.status) {
      this.routeMaker({ routes: [{
        name: route.name?.plural,
        method: RouteMethod.GET,
        ...route.listMany
      }]})
    }
  
    if(!!route.create?.status) {
      this.routeMaker({
        routes: [{
          name: route.name?.singular,
          method: RouteMethod.POST,
          ...route.create
        }],
      })
    }
  
    if(!!route.update?.status) {
      this.routeMaker({
        routes: [{
          name: `${route.name?.singular}/:id`,
          method: RouteMethod.PUT,
          ...route.update
        }],
      })
    }
  
    if(!!route.delete?.status) {
      this.routeMaker({
        routes: [{
          name: `${route.name?.singular}/:id`,
          method: RouteMethod.DELETE,
          ...route.delete
        }],
      })
    }

    if(route.addRoute) {
      this.routeMaker({ routes: route.addRoute })
    }
  }

  private selectFields(fields: string) {
    if (!fields) {
      return [];
    }
    return fields.split(',').map(field => field.trim());
  }
  private getRouteMaker(route: RouteMethod) {
    const typeormMethod: Record<string, keyof FastifyInstance<http.Server, http.IncomingMessage, http.ServerResponse>> = {
        [RouteMethod.GET]: 'get',
        [RouteMethod.POST]: 'post',
        [RouteMethod.PUT]: 'put',
        [RouteMethod.PATCH]: 'patch',
        [RouteMethod.DELETE]: 'delete'
    };

    return typeormMethod[route] 
  }

  private routeMaker({ routes }: IGenerateCrudRouteMaker) {
      routes.forEach(route => {
          (this.server[this.getRouteMaker(route.method)] as any)(`/${route.name}`, async (request: FastifyRequest | any) => {
              const { fields, page = 1, pageSize = 10, sortBy, sortOrder = 'ASC', searchTerm } = request.query as any;
              if(route.inputPlugins) {
                await PluginConnector.connect({
                  plugins: route.inputPlugins,
                  input: request
              });
              }

              if (route.method === RouteMethod.GET) {
                  if (route.schema) {
                      route.schema.parse(request.query);
                  }

                  if (route.withPagination) {
                      PaginationHelper.resolve({ page, pageSize });
                  }

                  if (route.name.includes('/:id')) {
                      const { id } = request.params;
                      const data = await this.repository.findOne({
                          select: this.selectFields(fields),
                          where: { id }
                      });
                      if (!data) {
                          throw new NotFoundException(`Data not found`);
                      }
                      return data;
                  }

                  const searchConditions = route.findableFields && searchTerm ?
                      route.findableFields.map(field => ({ [field]: ILike(searchTerm) })) : [];
                  const [data, count] = await this.repository.findAndCount({
                      select: this.selectFields(fields),
                      ...(route.withPagination && {
                          take: pageSize,
                          skip: (page - 1) * pageSize,
                      }),
                      ...(sortBy && {
                          order: { [sortBy]: sortOrder }
                      }),
                      where: searchConditions
                  });

                  if (route.withPagination) {
                      return PaginationHelper.build({ count, page, list: data, pageSize });
                  }

                  return data;
              }

              if (route.schema) {
                  route.schema.parse(request.body);
              }

              const { findableFields } = route;
              const paramsId = route.name.includes('/:id') ? { id: request.params.id } : {};
              const dataFinded = await this.repository.findOne({
                  where: [
                      ...(findableFields!.length > 0 ? findableFields!.map(field => ({
                          [field]: request.body[field],
                          ...paramsId
                      })) : []),
                      ...(findableFields?.length === 0 && paramsId ? [paramsId] : [])
                  ]
              });

              if ([RouteMethod.PUT, RouteMethod.PATCH].includes(route.method)) {
                  if (!dataFinded) {
                      throw new NotFoundException(`Data not found`);
                  }
                  return this.repository.update(dataFinded.id, request.body);
              }

              if (route.method === RouteMethod.DELETE) {
                  if (!dataFinded) {
                      throw new NotFoundException(`Data not found`);
                  }
                  return this.repository.delete(dataFinded.id);
              }

              if (dataFinded) {
                  throw new ConflictException(`Data already exists`);
              }

              const data = this.repository.create(request.body);
              return this.repository.save(data);
          });
      });
  }
 }