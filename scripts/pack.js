const fs = require("fs");
const ChromeExtension = require("crx");
const path = require("path");

const argv = require("minimist")(process.argv.slice(2));

const keyPath = argv.key || "key.pem";
const existsKey = fs.existsSync(keyPath);

const crx = new ChromeExtension({
  privateKey: existsKey ? fs.readFileSync(keyPath) : null
});

crx
  .load(path.join(__dirname, "../build"))
  .then(() => crx.pack())
  .then(crxBuffer => {
    fs.writeFileSync("./build/stacker.crx", crxBuffer);
  })
  .catch(err => console.error(err));
