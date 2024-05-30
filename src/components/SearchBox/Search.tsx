import styled from 'styled-components'
import { TabletMedia } from '../../utils/styled'
import ControlBox, { ControlBoxBorderRadius } from '../ControlBox'
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
  border-radius: ${ControlBoxBorderRadius}px ${ControlBoxBorderRadius}px 0 0;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
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
    border-radius: ${ControlBoxBorderRadius}px;

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
      max-height: 336px;
      padding: 0;
    }
  }
`
