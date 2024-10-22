"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
function scrapeShopifyProductPage(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch();
        const page = yield browser.newPage();
        yield page.goto(url);
        function getFontUrl(fontFamily) {
            const styleSheets = document.styleSheets;
            for (let i = 0; i < styleSheets.length; i++) {
                try {
                    const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                    for (let j = 0; j < rules.length; j++) {
                        const rule = rules[j];
                        // Check if the rule is a @font-face rule
                        if (rule instanceof CSSFontFaceRule) {
                            const ruleFontFamily = rule.style.getPropertyValue('font-family').replace(/['"]/g, '').trim();
                            // If the font-family matches, return the src (font URL)
                            if (ruleFontFamily === fontFamily) {
                                const fontUrl = rule.style.getPropertyValue('src');
                                return fontUrl;
                            }
                        }
                    }
                }
                catch (e) {
                    console.warn('Cannot access stylesheet:', styleSheets[i], e);
                }
            }
            return ''; // If the font URL is not found
        }
        const data = yield page.evaluate(() => {
            const fonts = [];
            const fontElements = document.querySelectorAll('font');
            fontElements.forEach((fontElement) => {
                const fontFamily = getComputedStyle(fontElement).fontFamily;
                const fontWeight = getComputedStyle(fontElement).fontWeight;
                const fontUrl = getFontUrl(fontElement);
                fonts.push({
                    family: fontFamily,
                    variants: fontWeight,
                    letterSpacings: '0.01em',
                    fontWeight: fontWeight,
                    url: fontUrl,
                });
            });
            const primaryButton = document.querySelector('form[action*="/cart/add"] button');
            if (!primaryButton) {
                throw new Error("Could not find the primary button");
            }
            const buttonStyles = getComputedStyle(primaryButton);
            const primaryButtonData = {
                fontFamily: buttonStyles.fontFamily,
                fontSize: buttonStyles.fontSize,
                letterSpacing: buttonStyles.letterSpacing,
                textTransform: buttonStyles.textTransform,
                textDecoration: buttonStyles.textDecoration,
                textAlign: buttonStyles.textAlign,
                backgroundColor: buttonStyles.backgroundColor,
                color: buttonStyles.color,
                borderColor: buttonStyles.borderColor,
                borderWidth: buttonStyles.borderWidth,
                borderRadius: buttonStyles.borderRadius,
                lineHeight: buttonStyles.lineHeight
            };
            return {
                fonts, primaryButton: primaryButtonData
            };
        });
        yield browser.close();
        return data;
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://growgrows.com/en-us/products/plentiful-planets-sleepsuit';
    const scrapperData = yield scrapeShopifyProductPage(url);
    console.log(JSON.stringify(scrapperData));
}));
