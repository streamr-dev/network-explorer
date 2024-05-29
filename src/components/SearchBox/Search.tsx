import styled, { css } from 'styled-components'
import { ActiveView } from '../../types'
import { SM, TabletMedia } from '../../utils/styled'
import ControlBox from '../ControlBox'
import Error from '../Error'
import { Graphs } from '../Graphs'
import { Stats } from '../Stats'
import { SearchInput, SearchInputInner } from './SearchInput'
import { SearchResultsRoot } from './SearchResults'

export const SlideHandle = styled.div`
  height: 22px;
  position: relative;

  &::before {
    background: #e7e7e7;
    border-radius: 2px;
    content: '';
    height: 4px;
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
  }
`

export const StatsWrap = styled.div``

export const Search = styled(ControlBox)`
  height: 100%;
  position: relative;

  ${Stats} {
    background: #ffffff;
    border: 1px solid #efefef;
    border-radius: 0 0 4px 4px;
    border-top: 0px;
  }

  ${StatsWrap} {
    padding: 0 16px 16px;
  }

  ${SearchInput} {
    padding: 0 16px;
  }

  ${SearchInputInner} {
    border: 1px solid #efefef;
    border-radius: 4px 4px 0 0;
  }

  ${Graphs} {
    border-top: 1px solid #efefef;
  }

  ${SearchResultsRoot} {
    border-top: 1px solid #efefef;
    padding: 16px;
  }

  @media ${TabletMedia} {
    height: auto;

    ${Stats} {
      border: 0;
      border-radius: 0 0 4px 4px;
      border-top: 1px solid #efefef;
    }

    ${SearchInput} {
      padding: 0;
    }

    ${SearchInputInner} {
      border: 0;
    }

    ${StatsWrap} {
      padding: 0;
      border: 0;
    }

    ${SlideHandle} {
      display: none;
    }

    ${SearchResultsRoot} {
      padding: 0;
    }
  }

  @media (min-width: ${SM}px) {
    ${({ theme }) =>
      theme.resultsActive &&
      css`
        ${Graphs} {
          // display: none;
        }
      `}

    ${SearchResultsRoot} {
      // height: 280px;
    }
  }
`
