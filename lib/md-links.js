#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const marked = require('marked');

const mdLinks = (providedDirectory) => {

  const newPromise = new Promise((resolve, reject) => {
    fs.lstat(providedDirectory, (err, stats) => {

      if (err) {
        return reject(new Error("Se ha presentado un error. " + err + ". Intentalo de nuevo.")); //Handle error
      }

      if (path.extname(providedDirectory) === ".md") {
        let isFile = path.resolve(providedDirectory);
        let result = readFile(isFile);
        let array = result;
        let finalRes = [];
        array.forEach(element => {
            finalRes = finalRes.concat(element.map(link => ({...link, file: isFile})));
        })
        return resolve(finalRes);
      } else if (stats.isDirectory() === true) {
        let stillDirectory = path.resolve(providedDirectory);
        let dirListing = fs.readdirSync(stillDirectory);
        let promises = [];
        for (let i = 0; i < dirListing.length; i++) {
          let newDirectory = path.join(providedDirectory, `${dirListing[i]}`);
          promises.push(mdLinks(newDirectory));
        }
        Promise.all(promises)
        .then(arrRes => {
          let finalRes =[];
          arrRes.forEach(element => {
            finalRes = finalRes.concat(element);
          })
          return resolve(finalRes);
        });
      }else{
        return resolve([]);
      }
    })
  })
    .catch(console.error)

  return newPromise
}

const readFile = (file) => {

  let stringFile = fs.readFileSync(file).toString().split('\n');

  return stringFile.map((element, index) => markdownLinkExtractor(element, index + 1));

  function markdownLinkExtractor(markdown, lineNum) {
    let links = [];

    let renderer = new marked.Renderer();

    // Taken from https://github.com/markedjs/marked/issues/1279
    let linkWithImageSizeSupport = /^!?\[((?:\[[^\[\]]*\]|\\[\[\]]?|`[^`]*`|[^\[\]\\])*?)\]\(\s*(<(?:\\[<>]?|[^\s<>\\])*>|(?:\\[()]?|\([^\s\x00-\x1f()\\]*\)|[^\s\x00-\x1f()\\])*?(?:\s+=(?:[\w%]+)?x(?:[\w%]+)?)?)(?:\s+("(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*\)/;

    marked.InlineLexer.rules.normal.link = linkWithImageSizeSupport;
    marked.InlineLexer.rules.gfm.link = linkWithImageSizeSupport;
    marked.InlineLexer.rules.breaks.link = linkWithImageSizeSupport;

    renderer.link = function (href, title, text, line) {
      links.push({
        href: href,
        title: title,
        text: text,
        line: lineNum
      });
    };
    renderer.image = function (href, title, text, line) {
      // Remove image size at the end, e.g. ' =20%x50'
      href = href.replace(/ =\d*%?x\d*%?$/, "");
      links.push({
        href: href,
        title: title,
        text: text,
        line: lineNum
      });
    };
    marked(markdown, { renderer: renderer });

    return links;
  };
}

module.exports = {mdLinks};
