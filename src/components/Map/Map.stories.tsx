import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import Map from '.'
import { Provider as NodesProvider, useNodes } from '../../contexts/Nodes'
import { Provider as Pendingrovider } from '../../contexts/Pending'

export default {
  title: 'Map',
  component: Map,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

export const Empty: Story = (args) => (
  <Pendingrovider>
    <NodesProvider>
      <Map {...args} />
    </NodesProvider>
  </Pendingrovider>
)

const Loader  = () => {
  const { nodes, setNodes, setTopology } = useNodes()
  if (nodes.length === 0) {
    setNodes([
      {
        id: '1',
        title: 'Node 1',
        latitude: 60.16952,
        longitude: 24.93545,
      }, {
        id: '2',
        title: 'Node 2',
        latitude: 60.14952,
        longitude: 24.92545,
      },
    ])

    setTopology({
      '1': ['2'],
      '2': ['1'],
    })
  }
  return null
}

export const Nodes: Story = (args) => (
  <Pendingrovider>
    <NodesProvider>
      <Loader />
      <Map {...args} />
    </NodesProvider>
  </Pendingrovider>
)
