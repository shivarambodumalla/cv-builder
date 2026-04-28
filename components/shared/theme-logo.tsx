interface ThemeLogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function ThemeLogo({ className = "h-7", iconOnly = false }: ThemeLogoProps) {
  const light = iconOnly ? "/img/CV-Edge-Logo-square.svg" : "/img/CV-Edge-Logo.svg";
  const dark = iconOnly ? "/img/cvEdge_icon_dark.svg" : "/img/cvEdge_logo_dark.svg";

  return (
    <>
      <img src={light} alt="CVEdge logo" title="CVEdge — Free ATS Resume Scanner" className={`${className} dark:hidden`} />
      <img src={dark} alt="CVEdge logo" title="CVEdge — Free ATS Resume Scanner" className={`${className} hidden dark:block`} />
    </>
  );
}
