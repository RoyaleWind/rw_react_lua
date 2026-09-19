local identity = nil

local isOpen = false

local function round(value, decimals)
	local factor = 10 ^ decimals
	return math.floor(value * factor + 0.5) / factor
end

local function showNotification(message)
	BeginTextCommandThefeedPost('STRING')
	AddTextComponentSubstringPlayerName(message)
	EndTextCommandThefeedPostTicker(false, true)
end

local function startTelemetryStream()
	CreateThread(function()
		while isOpen do
			local ped = PlayerPedId()
			local coords = GetEntityCoords(ped)

			SendNUIMessage({
				action = 'tick',
				data = {
					health = GetEntityHealth(ped),
					armour = GetPedArmour(ped),
					speed = round(GetEntitySpeed(ped) * 3.6, 1),
					heading = round(GetEntityHeading(ped), 1),
					coords = {
						x = round(coords.x, 2),
						y = round(coords.y, 2),
						z = round(coords.z, 2),
					},
					clock = string.format(
						'%02d:%02d',
						GetClockHours(),
						GetClockMinutes()
					),
				},
			})

			Wait(Config.StreamInterval)
		end
	end)
end

local function setOpen(shouldShow)
	if isOpen == shouldShow then
		return
	end

	isOpen = shouldShow

	SetNuiFocus(shouldShow, shouldShow)
	SendNUIMessage({
		action = 'setVisible',
		data = shouldShow,
	})

	if shouldShow then
		startTelemetryStream()
	end
end

RegisterNUICallback('hideFrame', function(_, cb)
	setOpen(false)
	cb({})
end)

RegisterNUICallback('getPlayer', function(_, cb)
	local ped = PlayerPedId()
	local coords = GetEntityCoords(ped)

	if not identity then
		TriggerServerEvent('rw_react_lua:server:requestIdentity')
	end

	cb({
		ped = ped,
		coords = {
			x = round(coords.x, 2),
			y = round(coords.y, 2),
			z = round(coords.z, 2),
		},
		heading = round(GetEntityHeading(ped), 2),
		health = GetEntityHealth(ped),
		armour = GetPedArmour(ped),
		serverId = identity and identity.serverId or GetPlayerServerId(PlayerId()),
		name = identity and identity.name or GetPlayerName(PlayerId()),
	})
end)

RegisterNUICallback('notify', function(data, cb)
	local message = data and data.message

	if type(message) ~= 'string' or message == '' then
		cb({ ok = false, shownAt = 0 })
		return
	end

	showNotification(('[%s] %s'):format(data.style or 'info', message))

	cb({
		ok = true,
		shownAt = GetGameTimer(),
	})
end)

RegisterNUICallback('requestServerInfo', function(_, cb)
	TriggerServerEvent('rw_react_lua:server:requestServerInfo')
	cb({ pending = true })
end)

RegisterNetEvent('rw_react_lua:client:setIdentity', function(data)
	identity = data
end)

RegisterNetEvent('rw_react_lua:client:serverInfo', function(data)
	SendNUIMessage({
		action = 'serverInfo',
		data = data,
	})
end)

RegisterCommand(Config.Command, function()
	setOpen(not isOpen)
end, false)

RegisterCommand('rwping', function(_, args)
	SendNUIMessage({
		action = 'notice',
		data = {
			message = #args > 0 and table.concat(args, ' ')
				or 'Pushed from Lua with SendNUIMessage.',
			style = 'info',
		},
	})
end, false)

if Config.DefaultKey ~= '' then
	RegisterKeyMapping(Config.Command, Config.KeyLabel, 'keyboard', Config.DefaultKey)
end

CreateThread(function()
	TriggerServerEvent('rw_react_lua:server:requestIdentity')
end)
