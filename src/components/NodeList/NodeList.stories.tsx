import React, { useState } from 'react'
import { Meta } from '@storybook/react/types-6-0'

import NodeList from '.'

export default {
  title: 'NodeList',
  component: NodeList,
} as Meta

const nodes = [
  {
    id: '0xa3d1F77ACfF0060F7213D7BF3c7fEC78df847De1',
    title: 'Quick Green Aadvaark',
    latitude: 60.16952,
    longitude: 24.93545,
    placeName: 'Helsinki',
  }, {
    id: '0x13581255eE2D20e780B0cD3D07fac018241B5E03',
    title: 'Warm Fiery Octagon',
    latitude: 60.14952,
    longitude: 24.92545,
    placeName: 'Helsinki',
  },
  {
    id: '0xFeaDE0B77130F5468D57037e2a259295bfdD8390',
    title: 'Gold Spicy Fieldmouse',
    latitude: 52.51667,
    longitude: 13.38333,
    placeName: 'Berlin',
  },
  {
    id: '0x538a2Fa87E03B280e10C83AA8dD7E5B15B868BD9',
    title: 'Curved Slick Diamond',
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
      onNodeClick={(next) => setActiveNode((prev) => prev !== next ? next : undefined)}
    />
  )
}
