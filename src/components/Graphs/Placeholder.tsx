import React from 'react'
import styled from 'styled-components'

import empty from './assets/empty.png'
import empty2x from './assets/empty@2x.png'
import { SANS, MEDIUM } from '../../utils/styled'

type Props = {
  showImage?: boolean,
}

const UnstyledGraphPlaceholder = ({ showImage, ...props }: Props) => (
  <div {...props}>
    <img
      src={empty}
      srcSet={empty2x}
      alt="No data"
      style={{
        opacity: showImage ? 1 : 0,
      }}
    />
  </div>
)

const GraphPlaceholder = styled(UnstyledGraphPlaceholder)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #A3A3A3;
  font-family: ${SANS};
  font-weight: ${MEDIUM};
  text-transform: uppercase;

  img {
    max-width: 150px;
    opacity: 0;
    transition: 300ms opacity ease-in-out;
  }
`

export default GraphPlaceholder
