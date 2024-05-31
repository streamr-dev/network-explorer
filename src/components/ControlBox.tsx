import styled from 'styled-components'

import { SANS } from '../utils/styled'

export const ControlBoxBorderRadius = 10

export const DefaultControlBoxBackgroundColor = '#fcfcfc'

export const ControlBoxShadow = '0 0 6px rgba(0, 0, 0, 0.08)'

const ControlBox = styled.div`
  background: ${DefaultControlBoxBackgroundColor};
  box-shadow: ${ControlBoxShadow};
  border-radius: ${ControlBoxBorderRadius}px;
  font-family: ${SANS};
`

export default ControlBox
