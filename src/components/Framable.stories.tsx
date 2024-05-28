import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import styled from 'styled-components'
import { hudToNumber, useHud } from '../utils'

const IFrame = styled.iframe`
  border-radius: 16px;
  border: 0;
  display: block;
  height: 300px;
  width: 100%;
`

const Pad = styled.div`
  padding: 32px;
`

interface FramableProps {
  streamId: string
  hud: Parameters<typeof useHud>[0]
}

function Framable(props: FramableProps) {
  const { streamId, hud } = props

  const path = streamId ? `/streams/${encodeURIComponent(streamId)}` : `/`

  return <IFrame src={`http://localhost:3000${path}?hud=${hudToNumber(hud)}`} />
}

const Story: Meta<typeof Framable> = {
  title: 'Framable',
  component: Framable,
  tags: ['autodocs'],
}

export default Story

export const Default: StoryObj<typeof Framable> = {
  render: (props) => <Framable {...props} />,
  decorators: [
    (Component) => (
      <Pad>
        <Component />
      </Pad>
    ),
  ],
  args: {
    hud: [
      'ShowConnectionsToggle',
      'ShowNodeList',
      'ShowNetworkSelector',
      'ShowResetViewportButton',
      'ShowSearch',
      'ShowStats',
      'ShowZoomButtons',
    ],
    streamId: '',
  },
  argTypes: {
    hud: {
      control: 'check',
      options: [
        'ShowConnections',
        'ShowConnectionsToggle',
        'ShowNodeList',
        'ShowNetworkSelector',
        'ShowResetViewportButton',
        'ShowSearch',
        'ShowStats',
        'ShowZoomButtons',
      ],
    },
  },
}
