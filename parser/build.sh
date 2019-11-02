mkdir idk
cp interactive.js idk/
cp lang.js idk/
cp parser-constants.js idk/
cp parser.js idk/
cp tree.js idk/
cp regex-rules.js idk/
node node_modules/requirejs/bin/r.js -convert idk ./output
cp index.html output
rm -rf idk
