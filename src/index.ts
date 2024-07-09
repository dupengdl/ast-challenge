import { parse, ParserPlugin } from '@babel/parser';
import babelTraverse from '@babel/traverse';
import { Identifier } from '@babel/types';

interface IParam {
  [key: string]: {
    requestType: string;
    responseType: string;
  };
}

const createAST = (param: IParam) => {
  const code = `
export interface UsePoolsQuery<TData> extends ReactQueryParams<QueryPoolsResponse, TData> {
    request?: QueryPoolsRequest;
}
const usePools = <TData = QueryPoolsResponse,>({
    request,
    options
}: UsePoolsQuery<TData>) => {
    return useQuery<QueryPoolsResponse, Error, TData>(["poolsQuery", request], () => {
        if (!queryService) throw new Error("Query Service not initialized");
        return queryService.pools(request);
    }, options);
};
`;

  const plugins: ParserPlugin[] = ['typescript'];

  const ast = parse(code, {
    sourceType: 'module',
    plugins
  });

  // parse param make it parameterized
  const capitalName = Object.keys(param)[0];
  const smallName = capitalName.replace(
    /([A-Z])(.+)/,
    (_, $1, $2) => $1.toLowerCase() + $2
  );
  const reqType = param[capitalName].requestType;
  const resType = param[capitalName].responseType;
  // construct parameterize properties
  const queryInterface = `Use${capitalName}Query`;
  const hookName = `use${capitalName}`;
  const requestType = reqType;
  const responseType = resType;
  const keyName = `${smallName}Query`;
  const methodName = smallName;
  // declare replace targets
  const targetQueryInterface = 'UsePoolsQuery';
  const targetHookName = 'usePools';
  const targetRequestType = 'QueryPoolsRequest';
  const targetResponseType = 'QueryPoolsResponse';
  const targetKeyName = 'poolsQuery';
  const targetMethodName = 'pools';

  // @ts-expect-error
  babelTraverse(ast, {
    // modifies the AST node names to parameterized property names
    // TODO: should use some babel apis to do this
    TSInterfaceDeclaration(path) {
      if (path.node.id.name === targetQueryInterface) {
        path.node.id.name = queryInterface;
      }
    },
    TSTypeReference(path) {
      const typeName = path.node.typeName as Identifier;
      if (typeName.name === targetQueryInterface) {
        typeName.name = queryInterface;
      }
      if (typeName.name === targetRequestType) {
        typeName.name = requestType;
      }
      if (typeName.name === targetResponseType) {
        typeName.name = responseType;
      }
    },
    VariableDeclarator(path) {
      const id = path.node.id as Identifier;
      if (id.name === targetHookName) {
        id.name = hookName;
      }
    },
    StringLiteral(path) {
      if (path.node.value === targetKeyName) {
        path.node.value = keyName;
      }
    },
    MemberExpression(path) {
      const property = path.node.property as Identifier;
      if (property.name === targetMethodName) {
        property.name = methodName;
      }
    }
  });

  return ast;
};

export default createAST;
