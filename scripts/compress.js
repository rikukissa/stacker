const fs = require("fs");
const path = require("path");
const ChromeExtension = require("crx");
const name = require("../build/manifest.json").name;
const argv = require("minimist")(process.argv.slice(2));

const keyPath = argv.key || "key.pem";
const existsKey = fs.existsSync(keyPath);
const crx = new ChromeExtension({
  appId: argv["app-id"],
  codebase: argv.codebase,
  privateKey: existsKey ? fs.readFileSync(keyPath) : null
});

crx
  .load(path.join(__dirname, "../build"))
  .then(() => crx.loadContents())
  .then(archiveBuffer => {
    fs.writeFileSync(`${name}.zip`, archiveBuffer);
    console.log("wrote", `${name}.zip`);

    if (!argv.codebase || !existsKey) return;
    crx.pack(archiveBuffer).then(crxBuffer => {
      const updateXML = crx.generateUpdateXML();

      fs.writeFileSync("update.xml", updateXML);
      fs.writeFileSync(`${name}.crx`, crxBuffer);
    });
  })
  .catch(err => console.error(err));
