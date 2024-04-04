import React, { useMemo, useCallback, useState } from 'react'
import styled from 'styled-components'
import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
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
  color: #a3a3a3;
`
type XY = {
  x: number
  y: number
}

type GraphData = Record<string, Array<XY>>
type DateDisplay = 'day' | 'hour'

export type Props = {
  graphData: GraphData
  className?: string
  showCrosshair?: boolean
  dateDisplay?: DateDisplay
  height?: string
  ratio?: string
  labelFormat?: (value: number) => string
}

const curveColors = ['#B4BFF8', '#FF5C00']

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
  showCrosshair,
  dateDisplay,
  height,
  ratio,
  labelFormat,
  ...props
}: Props) => {
  const [tooltipWidth, setTooltipWidth] = useState(0)

  const tooltipRef = useCallback((node: HTMLSpanElement | null) => {
    if (node !== null) {
      setTooltipWidth(node.offsetWidth)
    }
  }, [])

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

  const margin = useMemo(
    () =>
      showCrosshair
        ? {
            top: 32,
            left: 45,
            right: 45,
            bottom: 8,
          }
        : {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
    [showCrosshair],
  )

  return (
    <Container {...props}>
      <PlotContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            /* Margin is needed for crosshair value to be fitted on screen */
            margin={margin}
          >
            {showCrosshair && (
              <Tooltip
                allowEscapeViewBox={{ x: true }}
                position={{ y: 5 }}
                offset={-1 * tooltipWidth + tooltipWidth / 2}
                content={(data) => {
                  if (data.payload != null && data.payload[0] != null) {
                    return (
                      <CrosshairValue ref={tooltipRef}>
                        {typeof labelFormat === 'function'
                          ? labelFormat(data.payload[0].payload.y)
                          : data.payload[0].payload.y}{' '}
                        ({formatDate(data.payload[0].payload.x, dateDisplay)})
                      </CrosshairValue>
                    )
                  }
                  return <></>
                }}
                isAnimationActive={false}
              />
            )}
            {Object.keys(graphData || {}).map((graphKey, index) => (
              <Line
                key={graphKey}
                type="monotone"
                data={graphData[graphKey]}
                dataKey="y"
                strokeWidth="2px"
                stroke={curveColors[1]}
                dot={false}
                isAnimationActive={false}
                activeDot={{
                  fill: 'blue',
                  stroke: '#b4bff8',
                  strokeWidth: 3,
                  r: 5,
                }}
              />
            ))}
            <YAxis hide={true} type="number" domain={dataDomain} />
          </LineChart>
        </ResponsiveContainer>
      </PlotContainer>
      {/* This here is how we dictate the size of the container. */}
      <Rect ratio={ratio} height={height} />
    </Container>
  )
}

export const TimeSeries = styled(UnstyledTimeSeriesGraph)``

interface RectProps {
  ratio?: string
  height?: string
}

function Rect({ ratio = '3:2', height }: RectProps) {
  return (
    <RectRoot
      height={height}
      viewBox={!ratio ? undefined : `0 0 ${ratio.split(/[:x]/).join(' ')}`}
      width={height == null ? undefined : '100%'}
      xmlns="http://www.w3.org/2000/svg"
    />
  )
}

const RectRoot = styled.svg`
  display: block;
`
