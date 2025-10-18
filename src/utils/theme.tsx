
import {
  dracula,
  vscDarkPlus,
  oneDark,
  atomDark,
  tomorrow,
  okaidia,
  darcula,
  materialDark,
  nord,
  nightOwl,
  coldarkDark,
  duotoneDark,
  solarizedDarkAtom
} from 'react-syntax-highlighter/dist/esm/styles/prism';

const themes = {
  dracula,
  vscDarkPlus,
  oneDark,
  atomDark,
  tomorrow,
  okaidia,
  darcula,
  materialDark,
  nord,
  nightOwl,
  coldarkDark,
  duotoneDark,
  solarizedDarkAtom
};

export const getThemeFromString = (theme: string) : { [key: string]: React.CSSProperties } => {
    return themes[theme as keyof typeof themes] || dracula;
};

export const getAvailableThemes = () : string[] => {
    return Object.keys(themes);
}

export default themes;
