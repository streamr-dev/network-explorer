import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: [],
  documents: [],
  generates: {
    'src/generated/gql/indexer.ts': {
      documents: ['src/queries/indexer.ts'],
      schema: 'https://stream-metrics.streamr.network/api',
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: false,
      },
    },
    'src/generated/gql/network.ts': {
      documents: ['src/queries/network.ts'],
      schema:
        'https://gateway-arbitrum.network.thegraph.com/api/8bcbd55cdd1369cadb0bb813d9817776/subgraphs/id/EGWFdhhiWypDuz22Uy7b3F69E9MEkyfU9iAQMttkH5Rj',
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: false,
      },
    },
  },
}

export default config
