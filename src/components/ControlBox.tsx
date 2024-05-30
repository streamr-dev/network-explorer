import styled from 'styled-components'

import { SANS } from '../utils/styled'

export const ControlBoxBorderRadius = 10

const ControlBox = styled.div`
  background: #fcfcfc;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.08);
  border-radius: ${ControlBoxBorderRadius}px;
  font-family: ${SANS};
`

export default ControlBox
