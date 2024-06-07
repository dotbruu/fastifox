![🦊FastiFox](https://i.ibb.co/NVd0wBR/Inserir-um-t-tulo.png)
# 🦊FastiFox

**Fastifox** is a mini framework for Fastify to facilitate the creation of APIs and CRUD operations with just one file.

##Prerequisites
To use Fastifox, you need to have TypeORM for database operations and Zod for data validation.

Install the necessary dependencies:

```sh
npm install fastify typeorm zod
```

## 🚀 Installation

Install the package via npm:

```sh
npm install fastifox
```

## 🛠️ Usage

### Basic Usage

```typescript
import { FastifyInstance } from 'fastify';
import { DataSource } from 'typeorm';
import { FastiFox, CrudGenerator } from 'fastifox'
import { YourEntity } from './entities/YourEntity';
import { z } from 'zod';

class MyCrudGenerator extends CrudGenerator {
  constructor(server: FastifyInstance, datasource: DataSource) {
    super(server, datasource);
    this.generate({
      entity: YourEntity,
      route: {
        create: {
          findableFields: ['email'],
          schema: z.object({
            name: z.string(),
            // other fields...
          }),
        },
        update: {
          schema: updateUserSchema,
        },
        listMany: {
          withPagination: true,
          findableFields: ['email', 'name']
        },
        listOne: {
          inputPlugins // plugins to execute on input
        },
        delete: {
          inputPlugins
        }
      }})
  }
}

const startServer = async () => {
  const server: FastifyInstance = require('fastify')();
  const datasource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [YourEntity],
    synchronize: true,
  });
  await datasource.initialize();

  const fastifox = new FastiFox()
  fastifox.initialize({
    directory: './src/**/*.module{.ts,.js}',
    context: {
      datasource: typeormSouce,
      server: fastifyInstance
    }
  })

  server.listen(3000, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('Server listening on http://localhost:3000');
  });
};

startServer();
```

### 📚 Detailed Explanation

1. **Create an Entity**: Define your TypeORM entity.
2. **Generate CRUD Routes**: Use `CrudGenerator` to generate CRUD routes for your entity.
3. **Run the Server**: Initialize Fastify and TypeORM, then start the server.

## 🤝 Contributing

We welcome contributions! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/my-feature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Open a Pull Request.

### Setting Up for Development

1. Clone the repository:

   ```sh
   git clone https://github.com/dotbruu/fastifox
   cd fastifox
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Build the project:

   ```sh
   npm run build
   ```

4. Run tests (if applicable):

   ```sh
   npm test
   ```

## 🙌 Acknowledgments

- TypeORM: A powerful ORM for TypeScript and JavaScript.
- Zod: A TypeScript-first schema declaration and validation library.
- Fastify: A fast and low overhead web framework for Node.js.
