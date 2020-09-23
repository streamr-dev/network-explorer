import React from 'react'
import { Meta } from '@storybook/react/types-6-0'

import SearchBox from '.'

export default {
  title: 'SearchBox',
  component: SearchBox,
} as Meta

export const Basic = () => <SearchBox />
