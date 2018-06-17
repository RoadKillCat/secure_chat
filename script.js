'use strict';

let main_div    = document.getElementById('main');
let auth_div    = document.getElementById('auth_div');
let auth_input  = document.getElementById('auth_input');
let fail_div    = document.getElementById('fail');
let message_div = document.getElementById('out');
let users_div   = document.getElementById('users');
let demand_div  = document.getElementById('demand');
let details_but = document.getElementById('details_but');
let entry_input = document.getElementById('entry');
let name_input  = document.getElementById('name');
let color_input   = document.getElementById('color');

let ws_server = 'ws://35.207.51.171:8000/';
let known_user = 1; //assuming has logged on before
let my_uid;
let users;
let posts;
let post_ind = 0;

let websocket = new WebSocket(ws_server);

websocket.onerror = function(e){
    document.body.innerText = 'server error: likely server script is not running';
}

websocket.onmessage = function(e){
    let message = JSON.parse(e.data);
    switch (message['type']){
        case 'authenticate':
            if (message['data']){
                auth_div.style.display = 'none';
                main_div.style.display = 'block';
            } else {
                fail_div.style.display = 'block';
            }
            break;
        case 'whoami':
            my_uid = message['data'];
            if (!users) console.log('sequencing err');
            name_input.value = users[my_uid].name;
            color_input.value  = users[my_uid].color;
            break;
        case 'need_details':
            known_user = 0;
            break;
        case 'users_update':
            users = message['data'];
            display_users();
            break;
        case 'posts_update':
            posts = message['data'];
            display_posts();
            break;
        default:
            console.log('unknown message type');
    }
}

details_but.onclick = function(){
    let message = {
        type: 'update_details',
        data: {'name': name_input.value,
               'color':  color_input.value}
    }
    websocket.send(JSON.stringify(message));
    known_user = 1;
    demand_div.style.display = 'none';
}

function send_message(s){
    if (!known_user){
        demand_div.style.display = 'block';
    } else {
        let message = {
            type: 'new_message',
            data: entry_input.value
        };
        websocket.send(JSON.stringify(message));
    }
}

auth_input.onkeyup = function(e){
    if (e.keyCode==13){
        let message = {
            type: 'authenticate',
            data: auth_input.value
        };
        websocket.send(JSON.stringify(message));
    }
}

entry_input.onkeyup = function(e){
    if (e.keyCode==13){
        send_message(entry_input.value);
        entry_input.value='';
    }
}

color_input.oninput = e=> color_input.style.color=color_input.value;

function display_users(){
    while (users_div.firstChild)
    users_div.removeChild(users_div.firstChild);
    for (let uid in users){
        let el = document.createElement('div');
        el.style.color = users[uid]['color'];
        el.innerText = (users[uid]['online']?'\u2713':'\u2717')+users[uid]['name'];
        users_div.appendChild(el);
    }
}

function display_posts(){
    for (;post_ind<posts.length;post_ind++){
        let post = posts[post_ind];
        let uid = post['uid'];
        let el = document.createElement('div');
        el.style.color = users[uid]['color'];
        el.innerText = post['content'];
        out.appendChild(el);
    }
    document.title = posts[post_ind-1]['content'];
    document.body.scrollTop = document.body.scrollHeight;
}
