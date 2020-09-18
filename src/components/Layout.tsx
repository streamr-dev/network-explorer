import styled from 'styled-components/macro'

const Layout = styled.div`
  position: absolute;
  left: 32px;
  top: 32px;
  width: 375px;

  > * + * {
    margin-top: 24px;
  }
`

export default Layout
