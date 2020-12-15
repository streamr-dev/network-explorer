import styled from 'styled-components'

import { SM } from '../../utils/styled'
import ControlBox from '../ControlBox'

import SearchInput from './SearchInput'
import SearchResults from './SearchResults'

const Search = styled(ControlBox)`
  > *:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  > *:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  > * + * {
    border-top: 1px solid #EFEFEF;
  }

  @media (max-width: ${SM}px) {
    box-shadow: none;

    ${SearchResults} {
      padding: 8px 16px;
    }
  }

  @media (min-width: ${SM}px) {
    ${SearchResults} {
      max-height: 280px;
      overflow: scroll;
    }
  }
`

export default Object.assign(Search, {
  Input: SearchInput,
  Results: SearchResults,
})
