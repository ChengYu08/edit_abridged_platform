const express = require("express");
const app = express();
var path = require("path");
var logger = require("morgan");
const fs = require("fs-extra");

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.get("/write", function (req, res) {
  var name = req.query.name;
  var content = req.query.content;
  
  writeFile(`./public/html/${name}`, content ?? "");
  res.send(`${name}写入成功 \n 内容如下 ${content}`);
});

app.get("/read",  function (req, res)  {
  fs.readdirSync("./public/html").forEach(function (file) {
    console.log(file);
  })
    res.send("Hello World");

});

function writeFile(path, data) {
  fs.writeFile(path, data, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}

// log requests
app.use(logger("dev"));

// 挂载静态资源
app.use(express.static("./public"));

app.listen(3000);
