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
  },
}

export default config
