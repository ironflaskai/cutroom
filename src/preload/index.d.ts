import type { H3Api } from './index'

declare global {
  interface Window {
    h3: H3Api
  }
}

export {}
