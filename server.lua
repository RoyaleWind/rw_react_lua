local startedAt = os.time()

RegisterNetEvent('rw_react_lua:server:requestIdentity', function()
	local src = source

	TriggerClientEvent('rw_react_lua:client:setIdentity', src, {
		serverId = src,
		name = GetPlayerName(src),
	})
end)

RegisterNetEvent('rw_react_lua:server:requestServerInfo', function()
	local src = source

	TriggerClientEvent('rw_react_lua:client:serverInfo', src, {
		resource = GetCurrentResourceName(),
		players = #GetPlayers(),
		maxPlayers = GetConvarInt('sv_maxclients', 48),
		uptime = os.time() - startedAt,
		timestamp = os.time(),
	})
end)