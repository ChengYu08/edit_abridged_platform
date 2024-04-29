const express = require("express");
const app = express();
var path = require("path");
// var morgan = require("morgan");
const fs = require("fs-extra");
const bodyParser = require("body-parser");
const md5 = require("md5");

const logger = require("./utils/log");
// 设置跨域资源共享
const cors = require("cors");

const corsOptions = {
  origin: "*",
  methods: "*",
  allowedHeaders: "*",
};
app.use(cors(corsOptions));

// log requests
// app.use(morgan("dev"));

// 挂载静态资源
app.use(express.static("./public"));

// 统一对json返回加一层统一的状态码
const wrapResponse = require("./middleware/wrapResponse");
app.use(wrapResponse);

// 解决 请求为application/json 的时候数据接收为res.borderStyle:
app.use(bodyParser.json());

// 通过url 进行添加内容 因为url 传递内容 有长度限制
app.get("/write", function (req, res) {
  var content = req.query.content;
  var name = req.query.name;
  const time = new Date().toLocaleString();
  const id = md5(content);
  const configJson = fs.readJSONSync("./public/config.json");
  configJson[id] = {
    name: `${name ?? id}`,
    id,
    createTime: time,
    url: `http://${req.hostname}:${req.socket.localPort}/show/${id}`,
  };
  fs.writeJSONSync("./public/config.json", configJson);
  writeFile(`./public/files/${id}.html`, content ?? "");
  res.json({
    id,
    name: name ?? id,
    createTime: time,
    path: `http://${req.hostname}:${req.socket.localPort}/show/${id}`,
  });
});

app.post("/write", function (req, res) {
  const content = req.body.content;
  const name = req.body.name;
  const time = new Date().toLocaleString();
  const id = md5(content);
  const configJson = fs.readJSONSync("./public/config.json");
  configJson[id] = {
    name: `${name ?? id}`,
    createTime: time,
    id,
    url: `http://${req.hostname}:${req.socket.localPort}/show/${id}`,
  };
  fs.writeJSONSync("./public/config.json", configJson);
  writeFile(`./public/files/${id}.html`, content ?? "");
  res.json({
    id,
    name: name ?? id,
    createTime: time,
    path: `http://${req.hostname}:${req.socket.localPort}/show/${id}`,
  });
});


// 删除指定目录的
app.post("/delete", function (req, res) {
  const ids = req.body.ids ?? "";
  const idsArr = ids.split(",") ?? [];
  const deleteSuccessIds = [];
  let configJson = fs.readJSONSync("./public/config.json");
  idsArr.forEach((id) => {
    if(configJson[id]) {
      delete configJson[id];
      fs.removeSync(`./public/files/${id}.html`);
      deleteSuccessIds.push(id);
    }
  })
  fs.writeJSONSync("./public/config.json", configJson);
  res.json({
    deleteSuccessIds
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
    const content = fs.readFileSync(`./public/files/${id}.html`).toString();
    res.json({
      url: `http://${req.hostname}:${req.socket.localPort}/files/${id}.html`,
      content,
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
  });
}



app.listen(3001,() =>{
  logger.debug("server is running on port 3000");
  console.log("server is running on port 3000");
});
