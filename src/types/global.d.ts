declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
}

declare module '*.module.css';

declare module '*.jpg';
declare module '*.jpeg';
declare module '*.png';
