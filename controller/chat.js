let chat = function(io) {
  io.on('connection', function(socket){
    console.log('connected');
    socket.on('chat message', msg => {
      socket.emit("chat message", msg);
    })
  })
}

let nsp = function(io) {
  const workspaceNsp = io.of(/^\/\w+$/);
  workspaceNsp.on('connection', socket => {
    const workspace = socket.nsp;
    socket.on("chat message", msg => {
      console.log(workspace.name + ' ' + msg);
      workspace.emit('chat message', msg);
    });
  })
}

module.exports = {chat,nsp};
// module.exports = nsp;