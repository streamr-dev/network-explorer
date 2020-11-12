import React, { useMemo, useState, useEffect } from 'react'
import styled from 'styled-components/macro'
import {
  FlexibleXYPlot,
  LineSeries,
  Crosshair,
  CustomSVGSeries,
} from 'react-vis'
import 'react-vis/dist/style.css'
import Rect from '../Rect'
import { SANS, MEDIUM } from '../../utils/styled'

const PlotContainer = styled.div`
  left: 0;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
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
  .rv-crosshair__inner {
    transform: translate(-50%, 0);
    top: -8px;
  }

  .rv-crosshair__inner--left {
    left: unset;
    right: unset;
  }
`

const StyledCustomSVGSeries = styled(CustomSVGSeries)`
  border: 1px solid red;
`

type XY = {
  x: number,
  y: number,
}

type GraphData = Record<string, Array<XY>>
type DateDisplay = 'day' | 'hour'

export type Props = {
  graphData: GraphData,
  onHoveredValueChanged?: (value: XY | null) => void,
  className?: string,
  showCrosshair?: boolean,
  dateDisplay?: DateDisplay,
  height?: string,
  ratio?: string,
}

const curveColors = ['#FF5C00', '#B4BFF8']

const formatDate = (milliseconds: number, dateDisplay: DateDisplay = 'day') => {
  const date = new Date(milliseconds)

  if (dateDisplay === 'hour') {
    return date.toLocaleTimeString('en-EN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
      timeZoneName: 'short',
    })
  }

  const monthName = date.toLocaleString('en-EN', { month: 'long' })
  return `${monthName} ${date.getDate()}`
}

const UnstyledTimeSeriesGraph = ({
  graphData,
  onHoveredValueChanged,
  showCrosshair,
  dateDisplay,
  height,
  ratio,
  ...props
}: Props) => {
  const [hoveredValue, setHoveredValue] = useState<XY | null>(null)

  useEffect(() => {
    if (typeof onHoveredValueChanged === 'function') {
      onHoveredValueChanged(hoveredValue)
    }
  }, [hoveredValue, onHoveredValueChanged])

  const dataDomain = useMemo(() => {
    const dataValues = Object.keys(graphData || {}).flatMap((key) => {
      const graph = graphData[key]
      return graph.map((d) => d.y)
    })

    let { min, max } = dataValues.reduce(
      (res, value) => ({
        max: Math.max(res.max, value),
        min: Math.min(res.min, value),
      }),
      { max: -Infinity, min: Infinity },
    )

    if (!Number.isFinite(min)) {
      min = 0
    }
    if (!Number.isFinite(max)) {
      max = 1
    }

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
      <PlotContainer>
        <FlexibleXYPlot
          xType="time"
          /* Margin is needed for crosshair value to be fitted on screen */
          margin={margin}
          yDomain={dataDomain}
          yBaseValue={dataDomain[0]}
        >
          {Object.keys(graphData || {}).map((graphKey, index) => (
            <LineSeries
              key={graphKey}
              curve="curveMonotoneX"
              color={curveColors[(index + 1) % curveColors.length]}
              opacity={1}
              strokeStyle="solid"
              style={{
                strokeWidth: '2px',
              }}
              data={graphData[graphKey]}
              onNearestX={(datapoint, meta) => !!showCrosshair && setHoveredValue(datapoint)}
            />
          ))}
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
                {hoveredValue.y} ({formatDate(hoveredValue.x, dateDisplay)})
              </CrosshairValue>
            </StyledCrosshair>
          )}
          {!!showCrosshair && hoveredValue != null && (
            <StyledCustomSVGSeries
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
      {/* This here is how we dictate the size of the container. */}
      <Rect ratio={ratio} height={height} />
    </Container>
  )
}

const TimeSeries = styled(UnstyledTimeSeriesGraph)``

export default TimeSeries
