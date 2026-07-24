--[[
Koala Hacks - Tower of Hell (v2)
use : loadstring(game:HttpGet("https://pastebin.com/raw/CLKFaUJR"))()
ver : 2

set DoNotRemoveClientAntiCheat to true if you get kicked or false if it was already true
]]--


local acsuc, acres = pcall(function()
	local mt = getrawmetatable(game)
	setreadonly(mt, false)

	local old = mt.__namecall
	mt.__namecall = function(self, ...)
		if getnamecallmethod() == "Kick" then
			return -- blocks client-side kick
		end
		return old(self, ...)
	end

	setreadonly(mt, true)
end)
pcall(function()
	if not acsuc then
		warn("Anti-Kick (Client) did not work use other executors or the scripts will be unstable")
	elseif game.Players.LocalPlayer.PlayerScripts:FindFirstChild("LocalScript") and game.Players.LocalPlayer.PlayerScripts:FindFirstChild("LocalScript2") and not DoNotRemoveClientAntiCheat then
		game.Players.LocalPlayer.PlayerScripts:FindFirstChild("LocalScript"):Destroy()
		game.Players.LocalPlayer.PlayerScripts:FindFirstChild("LocalScript2"):Destroy()
	end
end)

local KHLib = loadstring(game:HttpGet("https://pastebin.com/raw/BkRLnxZW"))():getKHLib("v2.1.x")

KHLib:Initialize()

function IsThereChar()
	if game.Players.LocalPlayer.Character and game.Players.LocalPlayer.Character.Humanoid and game.Players.LocalPlayer.Character.HumanoidRootPart then
		return true
	end
	return false
end

if IsThereChar() then
	game.Players.LocalPlayer.Character.HumanoidRootPart.Anchored = false
end

local UI = KHLib.New({
	Location = game.CoreGui,
	Title = "Tower of Hell (Koala Scripts)",
	DestroyOnClose = game:GetService("UserInputService").MouseEnabled,
})

game:GetService("UserInputService").InputBegan:Connect(function(Input, GPE)
	if not GPE and Input.KeyCode == Enum.KeyCode.LeftAlt then
		UI.Instance.Main.Visible = not UI.Instance.Main.Visible
	end
end)

local PlayerTab = UI:NewTab({
	ID = "PlayerTab",
	Name = "Player"
})
local PlrInvincible = PlayerTab:NewActionToggle({
	ID = "PlrInvincible",
	Text = "Invincible / Disable Killbricks"
})
local EnablePlrJumpHacks = PlayerTab:NewActionToggle({
	ID = "EnablePlrJumpHacks",
	Text = "Enable Jump Power Hacks (May get you banned)"
})
local PlrJumpPower = PlayerTab:NewActionSlider({
	ID = "PlrJumpPower",
	Text = "Player Jump Power",
	BypassInputMax = true,
	BypassInputMin = true,
	MaxValue = 300,
	MinValue = 50,
})
local InfiniteJump = PlayerTab:NewActionToggle({
	ID = "InfiniteJump",
	Text = "Infinite Jump"
})
local EnablePlrSpeedHacks = PlayerTab:NewActionToggle({
	ID = "EnablePlrSpeedHacks",
	Text = "Enable Speed Hacks"
})
local PlrSpeed = PlayerTab:NewActionSlider({
	ID = "PlrSpeed",
	Text = "Player Speed",
	BypassInputMax = true,
	BypassInputMin = true,
	MaxValue = 128,
	MinValue = 16,
})

local MiscTab = UI:NewTab({
	ID = "MiscTab",
	Name = "Miscellaneous"
})
local updateall = MiscTab:NewActionActivate({
	ID = "updateall",
	Text = "Update All Settings"
})
local AntiAFK = MiscTab:NewActionToggle({
	ID = "AntiAFK",
	Text = "Anti AFK"
})
local GetAllTools = MiscTab:NewActionActivate({
	ID = "GetAllTools",
	Text = "Get All Tools"
})

local ontween = false

function Update(ignore)
	if ontween == true then
		return
	end
	if PlrInvincible:GetUserInput() then
		game.ReplicatedStorage.GameValues.killbricksDisabled.Value = true
	elseif not ignore then
		game.ReplicatedStorage.GameValues.killbricksDisabled.Value = false
	end
	if InfiniteJump:GetUserInput() then
		game.ReplicatedStorage.GameValues.globalJumps.Value = 999999
	elseif not ignore then
		game.ReplicatedStorage.GameValues.globalJumps.Value = 0
	end
	if IsThereChar() and EnablePlrJumpHacks:GetUserInput() then
		game.Players.LocalPlayer.Character.Humanoid.JumpPower = PlrJumpPower:GetSliderAmount()
	elseif IsThereChar() and not ignore then
		game.Players.LocalPlayer.Character.Humanoid.JumpPower = 50
	end
	if IsThereChar() and EnablePlrSpeedHacks:GetUserInput()  then
		game.ReplicatedStorage.GameValues.globalSpeed.Value = PlrSpeed:GetSliderAmount()
	elseif IsThereChar() and not ignore then
		game.ReplicatedStorage.GameValues.globalSpeed.Value = 16
	end
end

EnablePlrJumpHacks:OnInputChanged(Update)
PlrJumpPower:OnInputChanged(Update)
PlrInvincible:OnInputChanged(Update)
InfiniteJump:OnInputChanged(Update)
EnablePlrSpeedHacks:OnInputChanged(Update)
PlrSpeed:OnInputChanged(Update)
updateall:OnActivated(Update)
GetAllTools:OnActivated(function()
	for i, v in pairs(game.ReplicatedStorage.Assets.Gear:GetChildren()) do
		v:Clone().Parent = game.Players.LocalPlayer.Backpack
	end
end)

local FarmTab = UI:NewTab({
	ID = "FarmTab",
	Name = "Farm"
})

local TweenSpeed = FarmTab:NewActionSlider({
	ID = "TweenSpeed",
	Text = "Tween Speed (Suggested Value : 5, Higher the faster but less safe, Lower the slower but more safe)",
	MaxValue = 30,
	MinValue = 5,
})

local SkipTower = FarmTab:NewActionToggle({
	ID = "SkipTower",
	Text = "Skip Tower after Farming (Only works for Private Servers and if you're the owner)"
})

function TweenTopFunc()
	if not IsThereChar() or ontween or not game.Workspace:FindFirstChild("tower") then
		return
	end
	ontween = true
	local prevkbd = game.ReplicatedStorage.GameValues.killbricksDisabled.Value
	game.ReplicatedStorage.GameValues.killbricksDisabled.Value = true
	local i = 0
	repeat
		i += 1
		local section = nil
		for i2, v in pairs(game.Workspace.tower.sections:GetChildren()) do
			if v.i.value == i then
				section = v
			end
		end
		if section and IsThereChar() then
			local findtotween = nil
			if section:FindFirstChild("stop") then
				findtotween = section.stop
			elseif section:FindFirstChild("start") then
				findtotween = section.start
			end
			local Tween = game:GetService("TweenService"):Create(
				game.Players.LocalPlayer.Character.HumanoidRootPart,
				TweenInfo.new(
					((findtotween.Position + Vector3.new(0, 5, 0)) - game.Players.LocalPlayer.Character.HumanoidRootPart.Position).Magnitude / TweenSpeed:GetSliderAmount(),
					Enum.EasingStyle.Linear
				),
				{ CFrame = CFrame.new(findtotween.Position + Vector3.new(0, 5, 0)) }
			)
			Tween:Play()
			Tween.Completed:Wait()
			task.wait(1)
		end
	until i == game.Workspace.tower.sections.finish.i.value
	local Tween = game:GetService("TweenService"):Create(
		game.Players.LocalPlayer.Character.HumanoidRootPart,
		TweenInfo.new(
			(game.Workspace.tower.sections.finish.FinishGlow.Position - game.Players.LocalPlayer.Character.HumanoidRootPart.Position).Magnitude / TweenSpeed:GetSliderAmount(),
			Enum.EasingStyle.Linear
		),
		{ CFrame = CFrame.new(game.Workspace.tower.sections.finish.FinishGlow.Position) }
	)
	Tween:Play()
	game.Workspace.tower.sections.finish.FinishGlow.CanCollide = false
	Tween.Completed:Wait()
	task.wait(1)
	if SkipTower:GetValue() then
		local TextChatService = game:GetService("TextChatService")
		local Channel = TextChatService.TextChannels:FindFirstChild("RBXGeneral")

		if Channel then
			Channel:SendAsync("/skip")
		end
	end
	game.Workspace.tower.sections.finish.FinishGlow.CanCollide = true
	game.ReplicatedStorage.GameValues.killbricksDisabled.Value = prevkbd
	ontween = false
end

local TweenTop = FarmTab:NewActionActivate({
	ID = "TweenTop",
	Text = "Tween to the Top"
})
TweenTop:OnActivated(TweenTopFunc)
local TweenTopAuto = FarmTab:NewActionToggle({
	ID = "TweenTopAuto",
	Text = "Auto Tween to the Top once Round Starts"
})

local HasUpdated = false

game.Players.LocalPlayer.CharacterAdded:Connect(function()
	Update()
end)

local LastTime = 0

-- Others

pcall(function()
	loadstring(game:HttpGet("https://pastebin.com/raw/Kwksvwsh"))():SetupInfoTab(UI, "Koala Scripts - Tower of Hell v2")
end)

-- NOTE: Anti AFK System
coroutine.wrap(function()
	while task.wait(60) do
		if AntiAFK:GetUserInput() then
			local VirtualUser = game:GetService("VirtualUser")
			VirtualUser:Button2Down(Vector2.new(0,0), workspace.CurrentCamera.CFrame)
			task.wait(1)
			VirtualUser:Button2Up(Vector2.new(0,0), workspace.CurrentCamera.CFrame)
		end
	end
end)()

while task.wait() do
	if UI.Instance.Main == nil then
		error("", 0)
	end
	if LastTime > game.ReplicatedStorage.GameValues.timeLinear.Value and HasUpdated == false then
		Update(true)
		HasUpdated = true
		task.wait(1)
		if TweenTopAuto:GetUserInput() then
			game.Workspace:WaitForChild("tower", 30)
			repeat
				task.wait()
			until not game.ReplicatedStorage.GameValues.towerRegenerating.Value and game.Workspace:FindFirstChild("tower") and game.Workspace:FindFirstChild("tower"):FindFirstChild("sections") and game.Workspace:FindFirstChild("tower"):FindFirstChild("sections"):FindFirstChild("finish")
			task.wait(1)
			local suc, res = pcall(TweenTopFunc)
			if not suc then
				warn(res)
			end
		end
	elseif HasUpdated == true then
		print("wow!")
		HasUpdated = false
	end
	LastTime = game.ReplicatedStorage.GameValues.timeLinear.Value
end
