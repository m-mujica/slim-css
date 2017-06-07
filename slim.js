var path = require("path");
var slim = require("steal-tools/lib/build/slim");

slim({
   config: path.join(__dirname, "package.json!npm")
});
