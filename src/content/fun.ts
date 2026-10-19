import roundFeatherFontUrl from "../assets/icon/fonts/roundfeather-regular-1.001.ttf?url";
import FunPreferences from "$lib/extension/preferences/FunPreferences";

const preferences = new FunPreferences();
const url = (browser ?? chrome).runtime.getURL(roundFeatherFontUrl);
const avaliFontDefinitionStyleTag = document.createElement('style');

// language=CSS
avaliFontDefinitionStyleTag.textContent = `
    @font-face {
      font-family: Roundfeather;
      url('${url}') format('truetype');
    }
    
    :root {
      --font-family-base: Roundfeather, verdana, arial, helvetica, sans-serif !important;
      --font-family-monospace: Roundfeather, "Droid Sans Mono", monospace !important;
    }
  `;

function refreshAvaliFont(isFontEnabled: boolean) {
  if (!isFontEnabled) {
    avaliFontDefinitionStyleTag.remove();
    return;
  }

  document.head.append(avaliFontDefinitionStyleTag);
}

preferences.subscribe(settings => {
  refreshAvaliFont(settings.useAvaliFont ?? false);
});

preferences.useAvaliFont.get().then(refreshAvaliFont);
