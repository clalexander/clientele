# API Client

Framework to build HTTP REST API clients.

## Installation

```bash
npm install api-client
```

## Usage

### Modules

Modules contain the definition and implementation of individual resources of an API.

`modules/products.ts`
```typescript
import { ApiModule } from 'api-client';

// resource definition
export interface ProductsResource {
  list(): Promise<Product[]>;
  get(id: string): Promise<Product>;
  create(product: CreateProduct): Promise<Product>;
  update(id: string, product: UpdateProduct): Promise<Product>;
  delete(id: string): Promise<DeletedProduct>;
}

// module
const productsModule = ApiModule<ProductsResource> = {
  path: 'products',
  components: ({ makeRequest }) => ({
    list: () => makeRequest({
      method: 'GET',
    }),
    get: (id: string) => makeRequest({
      method: 'GET',
      path: id,
    }),
    create: (product: CreateProduct) => makeRequest({
      method: 'POST',
      data: product,
    }),
    update: (id: string, product: UpdateProduct) => makeRequest({
      method: 'PUT',
      path: id,
      data: product,
    }),
    delete: (id: string) => makeRequest({
      method: 'DELETE',
      path: id,
    }),
  }),
};

export default productsModule;
```

The `modules` contant defines the object paths for the resources.

`modules\index.ts`
```typescript
import products from './products';

const modules = {
  products,
};

export default modules;
```

### Client

The client extends the `ApiClient` mixin with the provided `modules` and will specify other baseline configuration.

`client.ts`
```typescript
import ApiClient from 'api-client';
import modules from './modules';

export interface ClientOptions {
  token: string;
}

export class Client extends ApiClient(modules) {
  constructor({ token }: ClientOptions) {
    super({
      baseURL: 'https://api.service.com/v1',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
```

### Using the Client

The new `Client` object and resources is typesafe and can be used with little effort from the developer.

```typescript
const client = new Client({ token: API_TOKEN });
const products = await client.products.list();
const product = products[0];
await client.products.delete(product.id);
```
