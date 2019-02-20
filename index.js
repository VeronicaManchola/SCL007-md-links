// module.exports = () => {
//   // ...
// };

const fs = require('fs');
const path = require('path');

let providedDirectory = process.argv[2];

const mdLinks = (providedDirectory) => {

  fs.lstat(providedDirectory, (err, stats) => {

    if (err) {
      return console.log("Se ha presentado un error. " + err + ". Intentalo de nuevo."); //Handle error
    }
 //stats.isFile() === true
    if ( path.extname(providedDirectory) === ".md") {
      return console.log("File is: " + path.resolve(providedDirectory));
    } else if (stats.isDirectory() === true) {
      let stillDirectory = path.resolve(providedDirectory);
      let dirListing = fs.readdirSync(stillDirectory);
      for(let i = 0; i < dirListing.length; i++){
        let newDirectory = path.join(providedDirectory, `${dirListing[i]}`);
        console.log(newDirectory);
        return mdLinks(newDirectory);
      }
    }
  });

}

mdLinks(providedDirectory);