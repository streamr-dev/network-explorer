import styled from 'styled-components/macro'

import ControlBox from './ControlBox'

const Layout = styled.div`
  position: absolute;
  left: 32px;
  top: 32px;
  width: 375px;

  > ${ControlBox} + * {
    margin-top: 24px;
  }
`

export default Layout
