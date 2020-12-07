const puppeteer = require('puppeteer');
const db = require("./models");

async function scraperEvents(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const [el] = await page.$x('//*[@id="post-70150"]/div[1]/header/h1');
    const src = await el.getProperty('textContent');
    let eventsTxt = await src.jsonValue();
    browser.close();
    return eventsTxt
}
async function scraperUpdates(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const [el] = await page.$x('/html/body/div[1]/main/div/div[1]/div[2]');
    const src = await el.getProperty('textContent');
    const updateTxt = await src.jsonValue();
    browser.close();
    return updateTxt
}

async function scraperNews(url, list) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    
    const [el] = await page.$x('//*[@id="content"]/div/div[1]/div[3]/div[4]/div[1]/p[2]/em');
    const src = await el.getProperty('textContent');
    let newsTxt = await src.jsonValue()
    browser.close()
    return newsTxt
    
}

scraperUpdates('https://pokemongolive.com/post/?hl=en')
.then((updatesTxt) =>{
    db.information.findOrCreate({
        where: {
        updates: updatesTxt
        }
    })
});
scraperEvents('https://pokemongohub.net/post/news/celebrate-pokemon-the-movie-secrets-of-the-jungle-with-a-collaboration-event-featuring-shiny-celebi-in-special-research-and-jessie-and-jamess-return-to-pokemon-go/')
.then((eventsTxt) =>{
    db.information.findOrCreate({
        where: {
        events: eventsTxt
        }
    })
});
scraperNews('https://thesilphroad.com//')
.then((newsTxt) =>{
    db.information.findOrCreate({
        where: {
        news: newsTxt
        }
    })
});

module.exports.scraperEvents
module.exports.scraperNews
module.exports.scraperUpdates