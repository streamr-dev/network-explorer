import React, { useMemo, useState, useEffect } from 'react'
import styled from 'styled-components/macro'
import {
  FlexibleXYPlot,
  LineSeries,
  Crosshair,
  CustomSVGSeries,
} from 'react-vis'
import 'react-vis/dist/style.css'
import Rect from './Rect'
import { SANS, MEDIUM } from '../utils/styled'

const PlotContainer = styled.div`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`

const Container = styled.div`
  position: relative;
`

const CrosshairValue = styled.span`
  font-family: ${SANS};
  font-weight: ${MEDIUM};
  font-size: 10px;
  line-height: 16px;
  text-transform: uppercase;
  color: #A3A3A3;
  white-space: nowrap;
  position: relative;
  top: -16px;
`

const StyledCrosshair = styled(Crosshair)`
  z-index: -1;

  .rv-crosshair__inner {
    transform: translate(-50%, 0);
    top: -8px;
  }

  .rv-crosshair__inner--left {
    left: unset;
    right: unset;
  }
`

type XY = {
  x: number,
  y: number,
}

export type Props = {
  graphData: Array<XY>,
  onHoveredValueChanged: (value: XY | null) => void,
  className?: string,
  isLoading?: boolean,
  showCrosshair?: boolean,
  height?: string,
  ratio?: string,
}

const formatDate = (milliseconds: number) => {
  const date = new Date(milliseconds)
  const monthName = date.toLocaleString('en-EN', { month: 'long' })
  return `${monthName} ${date.getDate()}`
}

const UnstyledTimeSeriesGraph = ({
  graphData,
  onHoveredValueChanged,
  isLoading,
  showCrosshair,
  height,
  ratio,
  ...props
}: Props) => {
  const [hoveredValue, setHoveredValue] = useState<XY | null>(null)

  useEffect(() => {
    onHoveredValueChanged(hoveredValue)
  }, [hoveredValue, onHoveredValueChanged])

  const dataDomain = useMemo(() => {
    const dataValues = (graphData || []).map((d) => d.y)
    let max = Math.max(...dataValues)
    let min = Math.min(...dataValues)

    // If we provide a domain with same min and max, react-vis
    // shows seemingly random scale for y-axis
    if (max === min) {
      min -= 2
      max += 2
    }
    return [min, max]
  }, [graphData])

  const margin = useMemo(() => showCrosshair ? {
    top: 32,
    left: 40,
    right: 40,
    bottom: 8,
  } : {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }, [showCrosshair])

  return (
    <Container {...props}>
      {!isLoading && (
        <PlotContainer>
          <FlexibleXYPlot
            xType="time"
            /* Margin is needed for crosshair value to be fitted on screen */
            margin={margin}
            yDomain={dataDomain}
            yBaseValue={dataDomain[0]}
            onMouseLeave={() => !!showCrosshair && setHoveredValue(null)}
          >
            <LineSeries
              curve={undefined}
              color="#FF5C00"
              opacity={1}
              strokeStyle="solid"
              style={{
                strokeWidth: '2px',
              }}
              data={graphData}
              onNearestX={(datapoint, meta) => !!showCrosshair && setHoveredValue(datapoint)}
            />
            {!!showCrosshair && hoveredValue != null && (
              <StyledCrosshair
                values={[hoveredValue]}
                orientation='left'
                style={{
                  line: {
                    background: '#CDCDCD',
                  },
                }}
              >
                <CrosshairValue>
                  {formatDate(hoveredValue.x)}
                </CrosshairValue>
              </StyledCrosshair>
            )}
            {!!showCrosshair && hoveredValue != null && (
              <CustomSVGSeries
                data={[
                  {
                    ...hoveredValue,
                    customComponent: () => {
                      return (
                        <g>
                          <circle cx="0" cy="0" r="8" fill="#B4BFF8" fillOpacity="0.8" />
                          <circle cx="0" cy="0" r="4" fill="#0324FF" />
                        </g>
                      )
                    },
                  },
                ]}
              />
            )}
          </FlexibleXYPlot>
        </PlotContainer>
      )}
      {/* This here is how we dictate the size of the container. */}
      <Rect ratio={ratio} height={height} />
    </Container>
  )
}

const TimeSeriesGraph = styled(UnstyledTimeSeriesGraph)``

export default TimeSeriesGraph
