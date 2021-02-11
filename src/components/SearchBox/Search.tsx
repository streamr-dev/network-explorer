import styled, { css } from 'styled-components'

import { SM } from '../../utils/styled'
import ControlBox from '../ControlBox'

import SearchInput from './SearchInput'
import SearchResults from './SearchResults'
import Stats from '../Stats'
import Graphs from '../Graphs'

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

    ${({ theme }) => theme.activeView === 'map' && css`
      ${SearchResults} {
        display: none;
      }
    `}

    ${({ theme }) => theme.activeView === 'list' && css`
      ${Stats},
      ${Graphs} {
        display: none;
      }
    `}
  }

  ${Stats} {
    background-color: #FFFFFF;
  }

  ${SearchResults} {
    max-height: calc(100vh - 120px);
    overflow: hidden;
    overflow-y: scroll;
  }

  @media (min-width: ${SM}px) {
    ${({ theme }) => theme.resultsActive && css`
      ${Graphs} {
        display: none;
      }
    `}

    ${SearchResults} {
      max-height: 280px;
      overflow: hidden;
      overflow-y: scroll;
      padding: 8px 0;
    }
  }
`

export default Object.assign(Search, {
  Input: SearchInput,
  Results: SearchResults,
})
