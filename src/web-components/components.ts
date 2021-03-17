import { KSLCustomElement } from './abstract/KSLCustomElement';
import { KSLAddButtonElement } from './KSLAddButtonElement';
import { KSLContainerElement } from './KSLContainerElement';
import { KSLButtonElement } from './KSLButtonElement';
import { KSLIconElement } from './KSLIconElement';
import { KSLTooltipElement } from './KSLTooltipElement';
import { KSLHighlightElement } from './KSLHighlightElement';
import { KSLPopoverElement } from './KSLPopoverElement';

declare global {
  interface HTMLElementTagNameMap {
    [KSLIconElement.is]: KSLIconElement;
    [KSLButtonElement.is]: KSLButtonElement;
    [KSLAddButtonElement.is]: KSLAddButtonElement;
    [KSLHighlightElement.is]: KSLHighlightElement;
    [KSLContainerElement.is]: KSLContainerElement;
    [KSLTooltipElement.is]: KSLTooltipElement;
    [KSLPopoverElement.is]: KSLPopoverElement;
  }
}

const webComponents: ReadonlyArray<typeof KSLCustomElement> = [
  KSLIconElement,
  KSLButtonElement,
  KSLAddButtonElement,
  KSLHighlightElement,
  KSLContainerElement,
  KSLTooltipElement,
  KSLPopoverElement,
];

export const webComponentTags: ReadonlyArray<string> = webComponents.map((component) => component.is);

/**
 * Define all web components if it is possible.
 *
 * @returns {Promise<void[]>}
 */
export function defineAllRequiredWebComponents(): Promise<void[]> {
  const allDefined = webComponents.map((webComponent) => webComponent.define());
  return Promise.all(allDefined);
}