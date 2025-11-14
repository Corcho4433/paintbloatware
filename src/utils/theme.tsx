import {
  atomOneDark,
  atomOneLight,
  github,
  githubGist,
  monokai,
  nord,
  vs2015,
  xt256
} from 'react-syntax-highlighter/dist/esm/styles/hljs';

const themes = {
  atomOneDark,
  atomOneLight,
  github,
  monokai,
  nord,
  vs2015,
  xt256,
  githubGist
};


export const getThemeFromString = (theme: string) : { [key: string]: React.CSSProperties } => {
    return themes[theme as keyof typeof themes] || undefined;
};

export const getAvailableThemes = () : string[] => {
    return Object.keys(themes);
}

export default themes;
