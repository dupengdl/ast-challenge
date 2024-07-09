import generate from '@babel/generator';
import createAST from '../src';
import inputJson from '../example-methods.json';

const expectCode = (ast: any) => {
  expect(generate(ast).code).toMatchSnapshot();
};

const main = () => {
  const objectList = Object.entries(inputJson).map(([key, value]) => {
    return {
      [key]: {
        requestType: value.requestType,
        responseType: value.responseType
      }
    };
  });
  for (const obj of objectList) {
    it('works', () => {
      const ast = createAST(obj);
      expectCode(ast);
    });
  }
};

main();
