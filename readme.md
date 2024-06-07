![🦊FastiFox](https://uploaddeimagens.com.br/images/004/794/703/full/Design_sem_nome.png)
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

### Setup
Start Fastifox by passing the correct parameters in your application's bootstrap.

```typescript
  import { FastiFox } from 'fastifox'

  const fastifox = new FastiFox()
  fastifox.initialize({
    directory: './src/**/*.module{.ts,.js}',
    context: {
      datasource: typeormSouce,
      server: fastifyInstance
    }
  })
```

### CRUD Generator
To automatically generate a CRUD, you need to have the TypeORM entity configured and Zod schemas in place if you want to add validations to the routes.
Import the CrudGenerator from Fastifox and make the necessary definitions.

```typescript
import { FastifyInstance } from 'fastify';
import { DataSource } from 'typeorm';
import { CrudGenerator } from 'fastifox'
import { YourEntity } from './entities/YourEntity';
import { z } from 'zod';

class MyCrudGenerator extends CrudGenerator {
  init(){
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
```
Using the CrudGenerator and correctly mapping the file at the start of the application will automatically generate the routes.

| Field  | Description |
| ------------- | ------------- |
| inputPlugins  | An array of plugins to be executed at the start of the request (route). |
| findableFields  | The entity fields that should be used to search or validate data. |
| withPagination  | Enables pagination for routes that list multiple data entries. |
| schema  | It's the Zod schema object. |

**Additional details**
| Field  | Description |
| ------------- | ------------- |
| searchTerm  | Use in GET routes to fetch data. |
| fields  | Use to select the fields that should be returned in the request. |

## Auth JWT (Plugin)
This plugin generates JWT token authentication as well as the Sign in and Sign up routes.

### Usage
Instantiate the plugin and add the necessary data for authentication configuration.

```typescript
  import { JWTAuthPlugin } from "fastify";

  const foxFlowAuth = new JWTAuthPlugin({
    datasource: this.datasource,
    server: this.server,
    entity: User,
  })
  
  foxFlowAuth.register({
    secret: enviroment.jwt.secret
  })

  foxFlowAuth.execute({
    fieldsToken: ['id', 'email', 'roleSlug'],
    findableField: 'email',
    hashedField: 'password',
    signUp: {
      schema: signUpSchema
    },
    signIn: {
      schema: signInSchema
    },
    defaultValues: {
      roleSlug: 'superuser'
    }
  })
```
After the configuration, the /sign-in and /sign-up routes will be generated.

**Using the authentication middleware**

```typescript
  // ... other code
    update: {
    schema: updateUserSchema,
    inputPlugins: [
      JWTAuthPlugin.verifyToken()
    ]
  },
  // ... other code
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
