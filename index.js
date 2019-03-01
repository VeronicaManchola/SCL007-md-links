const { mdLinks } = require('./lib/md-links.js');
let providedDirectory = process.argv[2];
let validate = process.argv.indexOf("--validate");
let stats = process.argv.indexOf("--stats");
const fetch = require('node-fetch');
let colors = require('colors');

if (require.main === module) {
  mdLinks(providedDirectory).then(async results => {
    let urlBroken = [];
    const printValidate = async () => {
      if (validate > 0) {
        await Promise.all(results.map(element => {
          return fetch(element.href)
            .then(response => {
              if (response.ok !== true) {
                urlBroken.push(response.status)
              }
              if (validate === 3) {
                console.log("\n", element.file.cyan, "\n", "URL: " + response.url.underline.blue, "\n", "Status: " + response.statusText.green, "\n", "Code: " + ("" + response.status).yellow, "\n", "Text: " + element.text)
              }
            })
            .catch(error => {
              urlBroken.push(error.code)
              if (validate === 3) {
                console.log("\n", element.file.cyan, "\n", "URL: " + element.href.blue, "\n", "Error code: " + error.code.red)
              }
            })
        }));
      }
    }
    const printStats = async () => {
      if (stats === 3) {
        let urlArr = [];
        results.forEach(element => {
          urlArr.push(element.href)
        })
        if (validate === 4) {
          console.log("\n", "Total: " + urlArr.length, "\n", "Unique: " + new Set(urlArr).size, "\n", "Broken: " + urlBroken.length)
        } else {
          console.log("\n", "Total: " + urlArr.length, "\n", "Unique: " + new Set(urlArr).size)
        }
      }
    }
    const printData = async () =>{
      if (validate !== 4 && validate !== 3 && stats !== 3 ){
        results.map(element => {
          console.log("\n", element.file.cyan, "\n", "URL: " + element.href.underline.blue, "\n", "Line: " + ("" + element.line).green, "\n", "Text: " + element.text)
        })
      }
    }
    await printValidate();
    await printStats();
    await printData();
  });
}