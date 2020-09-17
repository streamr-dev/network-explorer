import React from 'react'
import styled from 'styled-components/macro'

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;

    & svg {
      width: 32px;
      height: 32px;
    }
`

const Logo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 38">
    <g fill="none" fillRule="evenodd">
      <path
        fill="#FF5C00"
        d="M23.76 1.76V.66a.66.66 0 0 0-.69-.66A14.27 14.27 0 0 0 9.51 13.67c.01.46.39.58.6.58h1.12c.35 0 .64-.28.66-.63A11.89 11.89 0 0 1 23.15 2.38c.46-.06.6-.32.6-.62m-10 12.49h1.06c.34 0 .62-.27.65-.61a8.32 8.32 0 0 1 7.74-7.7.6.6 0 0 0 .56-.62V4.23a.66.66 0 0 0-.7-.66 10.7 10.7 0 0 0-9.98 9.97c-.02.38.28.71.66.71m10.02-6.44V8.9c0 .45-.39.6-.58.63a4.76 4.76 0 0 0-4.14 4.13.66.66 0 0 1-.66.59h-1.06a.66.66 0 0 1-.66-.72 7.14 7.14 0 0 1 6.38-6.38c.39-.04.72.27.72.66zm12.48 15.92c-.3 0-.56-.15-.62-.61a11.89 11.89 0 0 0-11.24-11.26.66.66 0 0 1-.63-.66v-1.11c0-.22.12-.6.58-.61 7.38.3 13.32 6.2 13.67 13.56a.66.66 0 0 1-.66.69h-1.1zM23.75 13.7c0-.38.33-.68.7-.66a10.7 10.7 0 0 1 9.98 9.97c.02.38-.28.7-.66.7h-1.09a.6.6 0 0 1-.63-.55 8.32 8.32 0 0 0-7.69-7.74.66.66 0 0 1-.61-.65V13.7zm6.44 10.02H29.1c-.45 0-.6-.39-.63-.58a4.76 4.76 0 0 0-4.13-4.14.66.66 0 0 1-.59-.66V17.3c0-.39.33-.7.72-.66a7.13 7.13 0 0 1 6.38 6.38.66.66 0 0 1-.66.72zM1.76 14.25c.3 0 .56.15.62.6a11.89 11.89 0 0 0 11.24 11.27c.35.02.63.3.63.66v1.11c0 .22-.12.6-.58.61A14.27 14.27 0 0 1 0 14.94a.66.66 0 0 1 .66-.7h1.1zm12.49 10.01c0 .39-.33.69-.7.66a10.7 10.7 0 0 1-9.98-9.97.66.66 0 0 1 .66-.7h1.09a.6.6 0 0 1 .63.56 8.32 8.32 0 0 0 7.69 7.74c.34.02.61.3.61.65v1.06zM7.81 14.25H8.9c.45 0 .6.38.63.57a4.76 4.76 0 0 0 4.13 4.15c.34.04.59.32.59.65v1.07c0 .38-.33.7-.72.65a7.14 7.14 0 0 1-6.38-6.37.66.66 0 0 1 .66-.72zm6.44 22c0-.3.15-.56.61-.62a11.89 11.89 0 0 0 11.26-11.25c.02-.35.31-.62.66-.62h1.12c.22 0 .59.12.6.58A14.27 14.27 0 0 1 14.95 38a.66.66 0 0 1-.69-.66v-1.1zm10.02-12.5c.38 0 .68.33.66.71a10.7 10.7 0 0 1-9.97 9.97.66.66 0 0 1-.7-.66V32.7a.6.6 0 0 1 .55-.63 8.32 8.32 0 0 0 7.74-7.69c.03-.34.3-.61.65-.61h1.07zM14.25 30.2v-1.08c0-.45.39-.61.58-.63a4.76 4.76 0 0 0 4.14-4.14.66.66 0 0 1 .66-.58h1.06c.39 0 .7.33.66.71a7.13 7.13 0 0 1-6.38 6.38.66.66 0 0 1-.72-.66z"
      />
    </g>
  </svg>
)

const StreamrLogo = () => (
  <Container>
    <Logo />
  </Container>
)

export default StreamrLogo
