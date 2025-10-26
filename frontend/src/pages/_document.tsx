import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="mask-icon" href="/favicon.svg" color="#FF4500" />
        <meta name="theme-color" content="#FF4500" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
