/**
 * 
 */

const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const process = require('process')
const fs = require('fs');
const path = require('path');

var domain = 'http://www.wfxs.org';
var title;

function CrawArticle(chapter) {
    console.log(chapter);
    request.get(domain+chapter.url, {encoding: "binary"}, (err, res, body) => {
        if (err || res.statusCode!=200) {
            return;
        }
        
        var html = iconv.decode(new Buffer(body, 'binary'), 'Big5');
        var $ = cheerio.load(html);
        var article = $('html').text();
        article = article.replace(/\n/g, '\r\n');
        chapter.name = (chapter.name).replace(/[<>:"\\\/\|\?\*]/g, '');
        fs.writeFileSync(path.join(title, chapter.name+'.txt'), article);
   });
}

function main() {
    var url = process.argv[2];
    if (url == undefined) {
        console.log('Usage: node app http://www.wfxs.org/html/.../');
        return;
    }
    console.log(`url: ${url}`);

    request.get(url, {encoding: "binary"}, (err, res, body) => {
        var html = iconv.decode(new Buffer(body, 'binary'), 'Big5');
        var $ = cheerio.load(html);

        title = $('h1[class="tc h10"]').text();
        var chapters = [];

        console.log(`title: ${title}`);
        fs.mkdir(title, (err) => {
            if (err) console.log(err);
        });
        
        $('dd').each((i, el) => {
            var chapter = {
                'name': $(el).text(),
                'url': $(el).find('a').attr('href')
            }
            
            CrawArticle(chapter);
        });

        console.log(`finish. ${$('dd').toArray().length} chapters crawled.`);
    });
}

main();
