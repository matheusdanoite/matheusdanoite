import React from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { styleReset, List, ListItem, Divider } from 'react95';
import original from 'react95/dist/themes/original';
import w95fa from './assets/fonts/w95fa.woff2';
import Desktop from './components/Desktop';
import ErrorBoundary from './components/ErrorBoundary';

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  
  @font-face {
    font-family: 'W95FA';
    src: url('${w95fa}') format('woff2');
    font-weight: 400;
    font-style: normal;
  }
  
  body, input, select, textarea {
    font-family: 'W95FA', 'ms_sans_serif', sans-serif;
  }
`;

function App() {
  return (
    <ThemeProvider theme={original}>
      <GlobalStyles />
      <div style={{ position: 'relative', zIndex: 0 }}>
        <ErrorBoundary>
          <Desktop />
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

export default App;
