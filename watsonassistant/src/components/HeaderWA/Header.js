import React from "react";
import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  SkipToContent,
} from "carbon-components-react/lib/components/UIShell";

const HeaderWA = () => (
  <Header aria-label="Carbon Tutorial">
    <SkipToContent />
    <HeaderName href="/" prefix="IBM">
      BRL Watson Chat
    </HeaderName>
    <HeaderGlobalBar />
  </Header>
);

export default HeaderWA;
