import puppeteer from "puppeteer";
import { ScrapperData } from "./types/ScrapperData";
import { Font } from "./types/Font";
import { Button } from "./types/Button";


function getFontUrl(fontFamily : any) {
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
        } catch (e) {
            console.warn('Cannot access stylesheet:', styleSheets[i], e);
        }
    }

    return ''; // If the font URL is not found
}

async function scrapeShopifyProductPage(url : string) : Promise<ScrapperData> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const data = await page.evaluate(()=>{
        const fonts: Font[] = [];

        const fontElements = document.querySelectorAll('font');
        fontElements.forEach((fontElement) =>{
            const fontFamily = getComputedStyle(fontElement).fontFamily;
            const fontWeight = getComputedStyle(fontElement).fontWeight;
            const fontUrl = getFontUrl(fontElement)

            fonts.push({
                family : fontFamily,
                variants : fontWeight,
                letterSpacings : '0.01em',
                fontWeight : fontWeight,
                url : fontUrl,
            });
        });

        const primaryButton = document.querySelector('form[action*="/cart/add"] button');
        if(!primaryButton){
            throw new Error("Could not find the primary button")
        }

        const buttonStyles = getComputedStyle(primaryButton as Element);
        const primaryButtonData : Button = {
            fontFamily : buttonStyles.fontFamily,
            fontSize : buttonStyles.fontSize,
            letterSpacing : buttonStyles.letterSpacing,
            textTransform : buttonStyles.textTransform,
            textDecoration : buttonStyles.textDecoration,
            textAlign : buttonStyles.textAlign,
            backgroundColor : buttonStyles.backgroundColor,
            color : buttonStyles.color,
            borderColor : buttonStyles.borderColor,
            borderWidth : buttonStyles.borderWidth,
            borderRadius : buttonStyles.borderRadius,
            lineHeight : buttonStyles.lineHeight
        }

        return {
            fonts, primaryButton: primaryButtonData
        }
    })

    await browser.close();
    return data;
}

(async() => {
    const url = 'https://growgrows.com/en-us/products/plentiful-planets-sleepsuit'

    const scrapperData = await scrapeShopifyProductPage(url);

    console.log(JSON.stringify(scrapperData, null, 2))
})();