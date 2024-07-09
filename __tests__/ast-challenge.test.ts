import generate from '@babel/generator';
import createAST from '../src';

const inputJson = {
  Pools: {
    requestType: 'QueryPoolsRequest',
    responseType: 'QueryPoolsResponse'
  }
};

const expectCode = (ast: any) => {
  expect(generate(ast).code).toMatchSnapshot();
};

it('works', () => {
  const ast = createAST(inputJson);
  expectCode(ast);
});
