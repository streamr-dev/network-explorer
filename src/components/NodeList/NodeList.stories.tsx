import React, { useState } from 'react'
import { Meta } from '@storybook/react/types-6-0'

import NodeList from '.'

export default {
  title: 'NodeList',
  component: NodeList,
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

export const Basic = () => {
  const [activeNode, setActiveNode] = useState<string | undefined>(undefined)

  return (
    <NodeList
      nodes={nodes}
      activeNodeId={activeNode}
      onNodeClick={setActiveNode}
    />
  )
}
