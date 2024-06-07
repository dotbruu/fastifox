import * as path from 'path';
import * as glob from 'glob';
import { errorHandler } from './helpers/exception-handler.helper';
import { FastiFoxModule } from './helpers/fastifox-module.helper';
import { IFastiFoxModuleContructor } from './protocols/crud-generator-helper.struct';
import { CrudGenerator } from './services/crud-generator.service';

class FastiFlox {
  async initialize({ context, directory }: {
    directory: string, context: IFastiFoxModuleContructor
  }) {
    errorHandler(context.server);
    const files = glob.sync(directory);

    for (const file of files) {
      const filePath = path.resolve(file);
      const module = await import(filePath);
      
      for (const exported in module) {
        if (module[exported].prototype instanceof FastiFoxModule || 
          module[exported].prototype instanceof CrudGenerator) {
          const instance = new module[exported](context);
          instance.init();
        }
      }
    }
  }
}

export {
  FastiFlox,
  CrudGenerator,
  FastiFoxModule,
}