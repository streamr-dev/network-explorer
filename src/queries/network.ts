import { gql } from '@apollo/client'

gql`
  query GetSponsorships($first: Int!, $skip: Int!) {
    sponsorships(first: $first, skip: $skip) {
      spotAPY
      totalStakedWei
    }
  }
`
