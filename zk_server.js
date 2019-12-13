var net = require("net");
var util = require("util");

var clientlist = [];
var server = net.createServer(function(socket){
    let client_addr = socket.address()
    console.log("client connect:",util.inspect(client_addr));
    let txt = "";
    socket.on('data', function(data){
        console.log(data);
        txt += data;
        msgs = txt.split("\r\n")
        console.log(msgs)
        if (msgs && msgs.length>1){
            for (i=0;i<msgs.length-1;i++)
            {
                msg = msgs[i];
                socket.write(msg+"\r\n");
            }
        txt = msgs[msgs.length-1];
        }

    })
    socket.on('end',function(err){
        let client_addr = socket.address()
        console.log("client disconnect",util.inspect(client_addr));
    })
})
server.listen(8001, function(){
    console.log("Creat server on http://127.0.0.1:8001/");


   
})