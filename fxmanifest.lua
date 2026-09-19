fx_version 'cerulean'
game 'gta5'
lua54 'on'

name 'royalewind/rw_react_lua'
description 'React Lua Template by RoyaleWind'
author 'RoyaleWind'
version '1.0.0'

ui_page 'web/build/index.html'

files {
	'web/build/index.html',
	'web/build/**/*',
}

shared_script 'config.lua'

client_scripts {
	'client.lua',
}

server_scripts {
	'server.lua',
}
