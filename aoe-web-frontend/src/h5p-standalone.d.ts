declare module 'h5p-standalone' {
  interface H5PStandaloneOptions {
    id: string
    h5pJsonPath: string
    frameJs: string
    frameCss: string
  }

  // The constructor resolves once the player is rendered and rejects if the package can't be played.
  export const H5P: new (anchorElement: HTMLElement, options: H5PStandaloneOptions) => Promise<void>
}
