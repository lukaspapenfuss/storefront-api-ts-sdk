import {createBasketItemRequest} from '../createItem';

it('Builds correct query', () => {
  expect(
    createBasketItemRequest({
      basketKey: 'basket1',
      variantId: 1235,
      quantity: 2,
      with: {
        items: {
          product: {
            attributes: 'all',
            advancedAttributes: 'all',
          },
          variant: {attributes: 'all', advancedAttributes: 'all'},
        },
      },
    }),
  ).toMatchInlineSnapshot(`
Object {
  "data": Object {
    "quantity": 2,
    "variantId": 1235,
  },
  "endpoint": "baskets/basket1/items",
  "method": "POST",
  "params": Object {
    "with": "items.product.attributes,items.product.advancedAttributes,items.product.images.attributes:legacy(false),items.variant.attributes,items.variant.advancedAttributes",
  },
}
`);
});