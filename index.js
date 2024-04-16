const express = require("express");
const app = express();
var path = require("path");
var logger = require("morgan");
const fs = require("fs-extra");

const md5 = require("md5");

app.get("/write", function (req, res) {
  var content = req.query.content;
  var name = req.query.name;
  const id = md5(content);
  const configJson = fs.readJSONSync("./public/config.json");
  configJson[id] = {
    name: `${name??id}`,
    id,
    url: `http://${req.hostname}:${req.socket.localPort}/show/${id}`,
  };
  fs.writeJSONSync("./public/config.json", configJson);
  console.log(id);
  writeFile(`./public/files/${id}.html`, content ?? "");
  res.json({
    id,
    name: name??id,
    path: `http://${req.hostname}:${req.socket.localPort}/show/${id}`,
  });
});

// 接口用于网页浏览
app.get("/show/:id", function (req, res) {
  const id = req.params.id;
  const configJson = fs.readJSONSync("./public/config.json");
  if (configJson[id] == undefined) {
    res.send("网页不存在");
    return;
  }
  const content = fs.readFileSync(`./public/files/${id}.html`).toString();
  res.setHeader("Content-Type", "text/html");
  res.send(content);
});

// 读取指定文件路径
app.get("/read", function (req, res) {
  const id = req.query.id;
  if (fs.pathExistsSync(`./public/files/${id}.html`)) {
    res.json({
      url: `http://${req.hostname}:${req.socket.localPort}/files/${id}.html`,
    });
  } else {
    res.json({ url: null, message: "文件不存在" });
  }
});

// 获取列表
app.get("/list", function (req, res) {
  const currentList = fs.readJSONSync("./public/config.json");
  res.json(currentList);
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
