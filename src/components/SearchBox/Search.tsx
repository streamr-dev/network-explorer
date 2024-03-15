import styled, { css } from 'styled-components'
import { SM } from '../../utils/styled'
import ControlBox from '../ControlBox'
import SearchInput from './SearchInput'
import SearchResults from './SearchResults'
import Stats from '../Stats'
import Graphs from '../Graphs'
import Error from '../Error'

const SlideHandle = styled.div`
  position: absolute;
  height: 4px;
  width: 40px;
  background: #e7e7e7;
  border-radius: 2px;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: none;
`

const Search = styled(ControlBox)`
  height: 100%;

  ${SearchInput} {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  > *:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  > * + * {
    border-top: 1px solid #efefef;
  }

  @media (max-width: ${SM}px) {
    box-shadow: none;

    ${SearchResults} {
      padding: 8px 16px;
      height: 100%;
    }

    ${SlideHandle} {
      display: block;
    }

    ${SearchInput} {
      padding: 22px 16px 16px 16px;
      border-radius: 0px;

      ${SearchInput.Inner} {
        border: 1px solid #efefef;
        border-radius: 4px;
      }
    }

    ${SearchInput} + ${Stats} {
      border: 1px solid #efefef;
      margin: 0 16px 16px 16px;
      border-radius: 0 0 8px 8px;
    }

    ${({ theme }) =>
    theme.activeView === 'map' &&
      css`
        ${SearchResults} {
          display: none;
        }
      `}

    ${({ theme }) =>
    !!theme.hasStats &&
      !theme.resultsActive &&
      css`
        ${SearchInput} {
          padding-bottom: 0;

          ${SearchInput.Inner} {
            border-bottom: 0;
            border-radius: 8px 8px 0 0;
          }
        }
      `}

    ${({ theme }) =>
    theme.activeView === 'list' &&
      !!theme.resultsActive &&
      css`
        ${Stats},
        ${Graphs},
      ${Error} {
          display: none;
        }
      `}
  }

  ${Stats} {
    background-color: #ffffff;
  }

  @media (min-width: ${SM}px) {
    ${({ theme }) =>
    theme.resultsActive &&
      css`
        ${Graphs} {
          display: none;
        }
      `}

    ${SearchResults} {
      height: 280px;
    }
  }
`

export default Object.assign(Search, {
  Input: SearchInput,
  Results: SearchResults,
  SlideHandle,
})
