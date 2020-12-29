var https = require('https');
const cheerio = require('cheerio');
const superagent     = require('superagent')
const Throttle    = require('superagent-throttle')

let throttle = new Throttle({
    active: true,     // set false to pause queue
    rate: 5,          // how many requests can be sent every `ratePer`
    ratePer: 10000,   // number of ms in which `rate` requests may be sent
    concurrent: 2     // how many requests can be sent concurrently
  })

module.exports = async (countryID)=>{
    return new Promise ((resolve,reject)=>{
        //scraping
        let stats = [];
        superagent.get('https://www.bricklink.com/browseStores.asp?countryID='+countryID)
            .use(throttle.plugin())
            .end(async(err, res) => {
                if(err){
                    reject(err);
                }
                const data = res.text;
                if(checkForQuotaLimit(data)){
                    return reject("Quota limit exceeded");
                }
                let regex = /store\.asp\?p=([a-zA-Z_0-9\.\-]*)/gm;
                let groups = data.match(regex);
                let allStores = [];
                try{
                    groups.forEach((i)=>{
                        allStores.push(i.split("store.asp?p=")[1]);
                    });
                }catch(e){
                    console.log(e);
                }
                let stats = [];
               await allStores.forEach(async (store, index)=> {
                   await getStoreInfo(store,countryID).then((data)=>{
                       stats.push(data);
                       if(stats.length===allStores.length){try{
                           stats.sort((a, b) => (a.n4totalLots < b.n4totalLots) ? 1 : -1);
                       }catch(err){
                           console.trace(err);
                       }
                           resolve(stats);
                           return;
                       }
                   });
                });
            });
    })
};

async function getStoreInfo(store,countryID){
    return new Promise ((resolve, reject) => {
        superagent.get('https://store.bricklink.com/' + store + '?p=' + store)
            .use(throttle.plugin())
            .end(async(err, res) => {
                if(err){
                    resolve(getStoreInfo(store).then((data)=>{return data}));
                }
                const storeData = res.text;
                if(checkForQuotaLimit(storeData)){
                    reject("Quota limit exceeded");
                }
                if (storeData) {
                    try{
                        let html = storeData;
                        let names = html.match(/name:[\t]*'(.+)',/g);
                        let name = names[0].split("'")[1];
                        let username = names[1].split("'")[1];
                        let _n4totalLots = html.match(/\tn4totalLots:((.)*),/g)[0].split(/(\d+)/g);
                        let n4totalLots = Number(_n4totalLots.slice(_n4totalLots.length - 2, _n4totalLots.length - 1));
                        let _n4totalItems = html.match(/\tn4totalItems:((.)*),/g)[0].split(/(\d+)/g);
                        let n4totalItems = Number(_n4totalItems.slice(_n4totalItems.length - 2, _n4totalItems.length - 1));
                        let _n4totalViews = html.match(/\tn4totalViews:((.)*),/g)[0].split(/(\d+)/g);
                        let n4totalViews = Number(_n4totalViews.slice(_n4totalViews.length - 2, _n4totalViews.length - 1));
                        let obj = {
                            name: name,
                            countryID:countryID,
                            username: username,
                            lastUpdated: new Date,
                            n4totalLots: n4totalLots,
                            n4totalItems: n4totalItems,
                            n4totalViews: n4totalViews
                        };
                        resolve(obj);
                    }catch(err){
                        console.trace(err);
                    }
                }
            });
    })

}
function checkForQuotaLimit(html){
    const cheerioLoad = cheerio.load(html);
    if(cheerioLoad("body").html().trim()==="<h1>Object Moved</h1>This object may be found <a href=\"https://www.bricklink.com/v2/error.page?code=429&amp;msg=Quota%20Exceeded\">here</a>."){
        return true;
    }else if(cheerioLoad("#blErrorTitle").text()){
        console.log(cheerioLoad(".blErrorDetail pre").text());
        return true;
    }
    return false;
}