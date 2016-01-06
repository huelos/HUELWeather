var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var Connection = require('tedious').Connection;


var windspeed = "";
var temp = "";
var winddir = "";
var pm10 = "";
var moisture = "";
var mysocket;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
	console.log("one user connected.");
	mysocket=socket;

  //数据库连接配置
  var config = {
    userName: 'sa',
    password: '123456',
    server: '192.168.188.54',
    // If you are on Windows Azure, you need this:
    options: {database: 'test'}
  };

  //新建一个连接
  var connection = new Connection(config);
  connection.on('connect', function(err) {
    // If no error, then good to proceed.
    if(err) return console.error(err);
    console.log("Connected");
    setInterval(function () {
      executeStatement();
    }, 2000);
  });

  //执行数据库操作的语句
  function executeStatement() {
    request = new Request("select top 1 e1,e3,e7,e8,e9 from dCurrent order by time desc;", function(err) {
    if (err) {
        console.log(err);} 
    });
    
  
    request.on('row', function(columns) {
      windspeed = columns[0].value;
      temp      = columns[1].value;
      winddir   = columns[2].value;
      pm10      = columns[3].value;
      moisture  = columns[4].value;
      
    });

    connection.execSql(request);

    mysocket.emit('weather',windspeed,temp,winddir,pm10,moisture);
    
  }//end of executeStatement
    
});//end of io.on



http.listen(3000, function(){
  console.log('listening on *:3000');
});
