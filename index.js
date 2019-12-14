var net = require("net");
var util = require("util");
var config = require("./server")
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    console.log("index:", index);
    if (index > -1) {
    this.splice(index, 1);
    }
    };
var clientlist = [];
var zk_client = null;
var socket2machine = [];
var retryTimeout = 3000;	//三秒，定义三秒后重新连接
var retriedTimes = 0;	//记录重新连接的次数
var maxRetries = 10;	//最多重新连接十次
var server = net.createServer(function(socket){
    let client_addr = socket.address()
    console.log("marking connect:",util.inspect(client_addr));
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
                console.log("send msg to zk server:",msg);
                items = msg.split('@');
                console.log(items);
                item_length = items[0];
                cmd = items[1];
                machine_id = items[items.length-1];
                clientlist[machine_id] = socket;
                if (!socket2machine[socket]){
                    socket2machine[socket] = Array(machine_id);
                }
                else{
                    socket2machine[socket].push(machine_id);

                }
                zk_client.write(msg+"\r\n");

            }
        txt = msgs[msgs.length-1];
        }

    })
    socket.on('end',function(err){
        let client_addr = socket.address()
        console.log("marking disconnect",util.inspect(client_addr));
        machine_ids = socket2machine[socket] ;
        for (i=0;i<machine_ids.length;i++)
        {
            machine_id = machine_ids[i]
            console.log(machine_id)

        // clientlist.splice(clientlist.indexOf(machine_id), 1);
        // console.log(clientlist[machine_id]);
            delete clientlist[machine_id];
        }
        console.log("*******",clientlist);
    })
})
server.listen(config.local.port, function(){
    console.log("Creat server on http://0.0.0.0:"+config.local.port.toString());
    function reconnect() {
		if (retriedTimes >= maxRetries) {
			throw new Error('Max retries have been exceeded, I give up.');
		}
		retriedTimes +=1;
		setTimeout(connect, retryTimeout);
	}
    zk_client = new net.Socket();
    function connect()
    {
    zk_client.connect(config.zk.port,config.zk.addr,function(){
        console.log("已连接中控");
    
    })
}
reconnect();
        zk_client.on('error', function(err) {
            console.log('Error in connection:', err);
        });
    
        zk_client.on('close', function() {
                console.log('connection got closed, will try to reconnect');
                reconnect();
        });
    let txt = "";
    zk_client.on('data', function(data){
        console.log("receive from zk:",data);
        txt += data;
        msgs = txt.split("\r\n")
        console.log(msgs)
        if (msgs && msgs.length>1){
            for (i=0;i<msgs.length-1;i++)
            {
                msg = msgs[i];
                console.log("send to marking machine:",msg);
                items = msg.split('@');
                console.log(items);
                machine_id = items[items.length-1];
                marking_socket =clientlist[machine_id] 
                marking_socket.write(msg+"\r\n");

            }
        txt = msgs[msgs.length-1];
        }

    })
})