import React, { useState, useCallback } from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'
import { ViewportProps } from 'react-map-gl'
import styled from 'styled-components'

import { Map } from '.'
import { Node } from '../../utils/api/tracker'

const Wrapper = styled.div`
  width: 800px;
  height: 600px;
`

export default {
  title: 'Map',
  component: Map,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [(StoryComponent) => <Wrapper><StoryComponent /></Wrapper>],
} as Meta

const nodes = [
  {
    id: '1',
    title: 'Node 1',
    latitude: 60.16952,
    longitude: 24.93545,
    placeName: 'Helsinki',
  }, {
    id: '2',
    title: 'Node 2',
    latitude: 60.14952,
    longitude: 24.92545,
    placeName: 'Helsinki',
  },
  {
    id: '3',
    title: 'Node 3',
    latitude: 52.51667,
    longitude: 13.38333,
    placeName: 'Berlin',
  },
  {
    id: '4',
    title: 'Node 4',
    latitude: 47.49833,
    longitude: 19.04083,
    placeName: 'Budapest',
  },
]

const topology = {
  '1': ['2', '3', '4'],
  '2': ['1', '3'],
  '3': ['1', '4'],
}

const initialViewport = {
  width: 800,
  height: 600,
  latitude: 60.16952,
  longitude: 24.93545,
  zoom: 2,
  bearing: 0,
  pitch: 0,
  altitude: 0,
  maxZoom: 20,
  minZoom: 0,
  maxPitch: 60,
  minPitch: 0,
}

export const Nodes: Story = (args) => {
  const [viewport, setViewport] = useState<ViewportProps>(initialViewport)

  return (
    <Map
      nodes={nodes}
      topology={topology}
      viewport={viewport}
      setViewport={setViewport}
    />
  )
}

export const ActiveNode: Story = (args) => {
  const [viewport, setViewport] = useState<ViewportProps>(initialViewport)
  const [activeNode, setActiveNode] = useState<Node | undefined>(undefined)

  const onNodeClick = useCallback((activeId: string) => {
    setActiveNode(nodes.find(({ id }) => id === activeId))
  }, [])

  return (
    <Map
      nodes={nodes}
      topology={topology}
      viewport={viewport}
      setViewport={setViewport}
      activeNode={activeNode}
      onNodeClick={onNodeClick}
    />
  )
}

export const ZoomControls: Story = (args) => {
  const [viewport, setViewport] = useState<ViewportProps>(initialViewport)

  const onZoomIn = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      zoom: prev.zoom + 1,
    }))
  }, [setViewport])

  const onZoomOut = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      zoom: prev.zoom - 1,
    }))
  }, [setViewport])

  const onZoomReset = useCallback(() => {
    setViewport((prev) => ({
      ...initialViewport,
    }))
  }, [setViewport])

  return (
    <Map
      nodes={nodes}
      topology={topology}
      viewport={viewport}
      setViewport={setViewport}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      onZoomReset={onZoomReset}
    />
  )
}

export const NodeConnections: Story = (args) => {
  const [viewport, setViewport] = useState<ViewportProps>(initialViewport)
  const [showConnections, setShowConnections] = useState<boolean>(true)

  const onToggleConnections = useCallback(() => {
    setShowConnections((wasShown) => !wasShown)
  }, [])

  const onZoomIn = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      zoom: prev.zoom + 1,
    }))
  }, [setViewport])

  const onZoomOut = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      zoom: prev.zoom - 1,
    }))
  }, [setViewport])

  const onZoomReset = useCallback(() => {
    setViewport((prev) => ({
      ...initialViewport,
    }))
  }, [setViewport])

  return (
    <Map
      nodes={nodes}
      topology={topology}
      viewport={viewport}
      setViewport={setViewport}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      onZoomReset={onZoomReset}
      showConnections={showConnections}
      onToggleConnections={onToggleConnections}
    />
  )
}

export const OverlappingNodes: Story = (args) => {
  const [viewport, setViewport] = useState<ViewportProps>({
    width: 800,
    height: 600,
    latitude: 60.16952,
    longitude: 24.93545,
    zoom: 2,
    bearing: 0,
    pitch: 0,
    altitude: 0,
    maxZoom: 20,
    minZoom: 0,
    maxPitch: 60,
    minPitch: 0,
  })

  const overlappingNodes = nodes.flatMap((node, index) =>
    [...Array(index * 3).keys()].flatMap((_, idx) => ({
      ...node,
      id: node.id + idx,
    })),
  )

  return (
    <Map
      nodes={overlappingNodes}
      topology={topology}
      viewport={viewport}
      setViewport={setViewport}
    />
  )
}
