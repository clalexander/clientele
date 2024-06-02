# Clientele

Axios-based framework to build HTTP REST API clients for Node.js and the browser.

## Installation

```bash
npm install clientele
```

## Usage

### Modules

Modules contain the definition and implementation of individual resources of an API.

`modules/products.ts`
```ts
import { ApiModule } from 'clientele';

// resource definition
export interface ProductsResource {
  list(): Promise<Product[]>;
  get(id: string): Promise<Product>;
  create(product: CreateProduct): Promise<Product>;
  update(id: string, product: UpdateProduct): Promise<Product>;
  delete(id: string): Promise<DeletedProduct>;
}

// module
const productsModule: ApiModule<ProductsResource> = {
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

`modules/index.ts`
```ts
import products from './products';

const modules = {
  products,
};

export default modules;
```

### Client

The client extends the `Clientele` mixin with the provided `modules` and will specify other baseline configuration.

```ts
import Clientele from 'clientele';
import modules from './modules';

export interface ClientOptions {
  token: string;
}

export class Client extends Clientele(modules) {
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

The new `Client` object and resources are typed and can be used with little effort by the developer.

```ts
const client = new Client({ token: API_TOKEN });

const products = await client.products.list();
const product = products[0];

await client.products.delete(product.id);
```

## To Do

- [ ] Document types/options
- [ ] Document `Clientele` methods

# License

This repository is licensed under the [MIT License](./LICENSE).