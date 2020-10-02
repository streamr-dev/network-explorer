import React, { MouseEvent, useState } from 'react'
import styled from 'styled-components/macro'
import Identicon from 'react-identicons'

import { MONO, MEDIUM } from '../../utils/styled'
import Stats from '../Stats'
import Graphs from '../Graphs'

const Name = styled.div`
  color: #323232;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  strong {
    font-weight: ${MEDIUM};
  }
`

const NodeElement = styled.div`
  background: #FFFFFF;
  border: 1px solid #F5F5F5;
  border-radius: 4px;

  & + & {
    margin-top: 12px;
  }

  ${Name} {
    margin-left: 20px;
  }
`

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  cursor: pointer;

  :hover {
    background: #F8F8F8;
  }
`

const PlaceName = styled.div`
  font-size: 10px;
  align-items: center;
  color: #ADADAD;
  margin-top: 2px;
  font-weight: ${MEDIUM};
`

const Address = styled(PlaceName)`
  font-family: ${MONO};
  letter-spacing: 0.05em;
`

const StyledStats = styled(Stats)`
  border-top: 1px solid #F5F5F5;
`

const GraphContainer = styled.div`
  border-top: 1px solid #EFEFEF;
`

type Props = {
  nodeId: string,
  title: string,
  placeName: string,
  active: boolean,
  onClick: (event: MouseEvent<HTMLInputElement>) => void,
}

const stats = {
  'Msgs/sec': 456,
  'MB/S': 757.25,
  'Latency ms': 27.5,
}

const NodeListItem = ({
  nodeId,
  title,
  placeName,
  active,
  onClick,
}: Props) => {
  const [selectedStat, setSelectedStat] = useState<string | null>(null)

  return (
    <NodeElement>
      <TitleRow onClick={onClick}>
        <Identicon
          string={nodeId}
          size={20}
        />
        <Name>
          <strong>{title}</strong>
          {!active && (
            <PlaceName>{placeName}</PlaceName>
          )}
          {!!active && (
            <Address>{nodeId}</Address>
          )}
        </Name>
      </TitleRow>
      {!!active && (
        <>
          <StyledStats
            values={stats}
            onSelectedStatChanged={(name) => {
              setSelectedStat(name)
            }}
          />
          <GraphContainer hidden={selectedStat == null}>
            <Graphs name={selectedStat} />
          </GraphContainer>
        </>
      )}
    </NodeElement>
  )
}

export default NodeListItem
