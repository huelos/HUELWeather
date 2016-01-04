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
      //console.log("Connected");
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
    
    /*
  request.on('row', function(columns) {
    
        columns.forEach(function(column) {
          if (column.value === null) {
            console.log('NULL');
          } else {
            result+= column.value + " ";
          }
        });
        console.log(result);
        result ="";
    
    
    });
  
    request.on('done', function(rowCount, more) {
    console.log(rowCount + ' rows returned');
    });
    */
  
    request.on('row', function(columns) {
      columns.forEach(function(column) {
        windspeed=column.value;
        temp=10;
        winddir=column.value;
        pm10=11;
        moisture=column.value;
        console.log(windspeed);
        console.log(winddir);
        console.log(temp);
      });
    });

    connection.execSql(request);
    // var msg = "<center><span class='left_span'>PM10:</span><span id='pm10' class='right_span'>"+pm10+"mg/m3</span></center><br><center><span class='left_span'>温度:</span><span id='temp' class='right_span'>"+temp+"摄氏度</span></center><br><center><span class='left_span'>湿度:</span><span id='moisture' class='right_span'>"+moisture+"0.1%RH</span></center><br><center><span class='left_span'>风速:</span><span id='windspeed' class='right_span'>"+windspeed+"m/s</span></center><br><center><span class='left_span'>风向:</span><span id='winddir' class='right_span'>"+winddir+"</span></center><br>"
    // mysocket.emit('weather',msg);

    mysocket.emit('weather',{'windspeed':windspeed,'temp':temp,'winddir':winddir,'pm10':pm10,'moisture':moisture});
    // mysocket.emit('windspeed', windspeed);
    // mysocket.emit('temp', temp);
    // mysocket.emit('winddir', winddir);
    // mysocket.emit('pm10', pm10);
    // mysocket.emit('moisture', moisture);
  }//end of executeStatement
    
});//end of io.on



http.listen(3000, function(){
  console.log('listening on *:3000');
});
