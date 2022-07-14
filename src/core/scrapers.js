var scrapeEngine = require('cheerio');

class Scraper{

    constructor() {
      this.scraper = null;
    }

    getTransverser(){
        return this.scraper;
    }
    
    loadPage(pagehtml) {
        if(!pagehtml) return false;
        this.scraper = scrapeEngine.load(pagehtml);
        return true;
    }

    locateGetElement(tag){
        if(!tag) return null;
        return this.scraper(tag);
    }

    locateGetText(tag){
        if(!tag) return null;
        this.scraper(tag).text();
    }

    locateGetValue(tag){
        if(!tag) return null;
        this.scraper(tag).value;
    }

    locateGetAttribute(tag, attribute){
        if(!tag || !attribute) return null;
        return this.scraper(tag).attr(attribute);
    }

  };

  
module.exports = Scraper;
