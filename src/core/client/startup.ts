import * as alt from 'alt-client';
import * as native from 'natives';

const casinoIpls: string[] = [ 'hei_dlc_windows_casino', 'hei_dlc_casino_aircon', 'vw_dlc_casino_door', 'hei_dlc_casino_door', 'vw_casino_main' ];
const randomIdle: string[] = ['base_idle_a', 'base_idle_b', 'base_idle_c', 'base_idle_d', 'base_idle_e', 'base_idle_f'];
const randomEnter: string[] = ['enter_left', 'enter_right', 'enter_left_short', 'enter_right_short'];

let closestSlot: number | null = null;
let closestSlotModel: number | null = null;
let closestSlotCoord: alt.Vector3 | null = null;
let closestSlotRotation: alt.Vector3 | null = null;

let drawInterval: number | null = null;
let animDict: string = 'anim_casino_a@amb@casino@games@slots@male';

interface Slot {
    slotSound: string;
    slotTexture: string;
    slotName: string;
    reelA: string;
    reelB: string;
    slotTheme?: number;
    missChance: number;
    betAmounts: number[];
};

const availableSlots: { [key: number]: Slot } = {
    [2362925439]: {
        slotSound: 'dlc_vw_casino_slot_machine_ak_npc_sounds',
        slotTexture: 'CasinoUI_Slots_Angel',
        slotName: 'Angel And The Knight',
        reelA: 'vw_prop_casino_slot_01a_reels',
        reelB: 'vw_prop_casino_slot_01b_reels',
        missChance: Math.floor(Math.random() * (40 - 10 + 1)) + 10,
        betAmounts: [50, 100, 150, 250, 500]
    },
    [2775323096]: {
        slotSound: 'dlc_vw_casino_slot_machine_ir_npc_sounds',
        slotTexture: 'CasinoUI_Slots_Impotent',
        slotName: 'Impotent Rage',
        reelA: 'vw_prop_casino_slot_02a_reels',
        reelB: 'vw_prop_casino_slot_02b_reels',
        slotTheme: 2,
        missChance: Math.floor(Math.random() * (40 - 10 + 1)) + 10,
        betAmounts: [50, 100, 150, 250, 500]
    },
    [3863977906]: {
        slotSound: 'dlc_vw_casino_slot_machine_rsr_npc_sounds',
        slotTexture: 'CasinoUI_Slots_Ranger',
        slotName: 'Republican Space Rangers',
        reelA: 'vw_prop_casino_slot_03a_reels',
        reelB: 'vw_prop_casino_slot_03b_reels',
        missChance: Math.floor(Math.random() * (40 - 10 + 1)) + 10,
        betAmounts: [50, 100, 150, 250, 500]
    },
    [654385216]: {
        slotSound: 'dlc_vw_casino_slot_machine_fs_npc_sounds',
        slotTexture: 'CasinoUI_Slots_Fame',
        slotName: 'Fame Or Shame',
        reelA: 'vw_prop_casino_slot_04a_reels',
        reelB: 'vw_prop_casino_slot_04b_reels',
        missChance: Math.floor(Math.random() * (40 - 10 + 1)) + 10,
        betAmounts: [50, 100, 150, 250, 500]
    },
    [161343630]: {
        slotSound: 'dlc_vw_casino_slot_machine_ds_npc_sounds',
        slotTexture: 'CasinoUI_Slots_Deity',
        slotName: 'Deity Of The Sun',
        reelA: 'vw_prop_casino_slot_05a_reels',
        reelB: 'vw_prop_casino_slot_05b_reels',
        slotTheme: 5,
        missChance: Math.floor(Math.random() * (40 - 10 + 1)) + 10,
        betAmounts: [50, 100, 150, 250, 500]
    },
    [1096374064]: {
        slotSound: 'dlc_vw_casino_slot_machine_kd_npc_sounds',
        slotTexture: 'CasinoUI_Slots_Knife',
        slotName: 'Twilight Knife',
        reelA: 'vw_prop_casino_slot_06a_reels',
        reelB: 'vw_prop_casino_slot_06b_reels',
        slotTheme: 6,
        missChance: Math.floor(Math.random() * (40 - 10 + 1)) + 10,
        betAmounts: [50, 100, 150, 250, 500]
    },
    [207578973]: {
        slotSound: 'dlc_vw_casino_slot_machine_td_npc_sounds',
        slotTexture: 'CasinoUI_Slots_Diamond',
        slotName: 'Diamond Miner',
        reelA: 'vw_prop_casino_slot_07a_reels',
        reelB: 'vw_prop_casino_slot_07b_reels',
        slotTheme: 7,
        missChance: Math.floor(Math.random() * (40 - 10 + 1)) + 10,
        betAmounts: [50, 100, 150, 250, 500]
    },
    [3807744938]: {
        slotSound: 'dlc_vw_casino_slot_machine_hz_npc_sounds',
        slotTexture: 'CasinoUI_Slots_Evacuator',
        slotName: 'Evacuator',
        reelA: 'vw_prop_casino_slot_08a_reels',
        reelB: 'vw_prop_casino_slot_08b_reels',
        slotTheme: 8,
        missChance: Math.floor(Math.random() * (40 - 10 + 1)) + 10,
        betAmounts: [50, 100, 150, 250, 500]
    }
};

alt.on('connectionComplete', () => {
    for (let i = 0; i < casinoIpls.length; i++) {
        const casinoIpl = casinoIpls[i];
        const isIplLoaded = native.isIplActive(casinoIpl);
        if (isIplLoaded) continue;

        alt.requestIpl(casinoIpl);
    };

    native.requestScriptAudioBank("DLC_VINEWOOD\\CASINO_SLOT_MACHINES_01", false, 0);
	native.requestScriptAudioBank("DLC_VINEWOOD\\CASINO_SLOT_MACHINES_02", false, 0);
	native.requestScriptAudioBank("DLC_VINEWOOD\\CASINO_SLOT_MACHINES_03", false, 0);
	native.requestScriptAudioBank("DLC_VINEWOOD\\CASINO_GENERAL", false, 0);
});

alt.on('keyup', (key: alt.KeyCode) => {
    if (key != 69) return;

    if (closestSlot == null ||
        closestSlotModel == null || 
        closestSlotCoord == null ||
        closestSlotRotation == null
        ) return; 

    alt.emitServerRaw('serverSlots:enterSlot', closestSlotCoord);
});

alt.onServer('clientSlots:closestSlot', (slotPosition: alt.Vector3, slotModel: number) => {
    if (closestSlot != null) closestSlot = null;
    if (closestSlotCoord != null) closestSlot = null;
    if (closestSlotRotation != null) closestSlot = null;
    if (closestSlotModel != null) closestSlot = null;

    closestSlot = native.getClosestObjectOfType(slotPosition.x, slotPosition.y, slotPosition.z, 1.2, slotModel, false, false, false);

    if (closestSlot == 0) return;

    closestSlotCoord = native.getEntityCoords(closestSlot, false);
    closestSlotRotation = native.getEntityRotation(closestSlot, 2);
    closestSlotModel = slotModel;

    if (drawInterval != null) {
        alt.clearInterval(drawInterval);
    };

    drawInterval = alt.setInterval(() => {
        drawText(closestSlotCoord, "~b~E~w~ - Play " + availableSlots[slotModel].slotName);
    }, 0);
});

alt.onServer('clientSlots:resetClosestSlot', () => {
    if (closestSlot != null) closestSlot = null;
    if (closestSlotCoord != null) closestSlot = null;
    if (closestSlotRotation != null) closestSlot = null;
    if (closestSlotModel != null) closestSlot = null;

    if (drawInterval != null) {
        alt.clearInterval(drawInterval);
        drawInterval = null;
    };
});

alt.onServer('clientSlots:enterSlot', async () => {
    if (alt.hash('mp_f_freemode_01') === alt.Player.local.model) {
        animDict = 'anim_casino_a@amb@casino@games@slots@female';
    };

    const enterScene = native.networkCreateSynchronisedScene(
        closestSlotCoord.x,
        closestSlotCoord.y,
        closestSlotCoord.z,
        closestSlotRotation.x,
        closestSlotRotation.y,
        closestSlotRotation.z,
        2,
        true,
        false,
        1.0,
        0,
        1.0
    );

    await alt.Utils.requestAnimDict(animDict);

    const randomAnimName = randomEnter[Math.floor(Math.random() * randomEnter.length)];
    native.networkAddPedToSynchronisedScene(
        alt.Player.local,
        enterScene,
        animDict,
        randomAnimName,
        2.0,
        -1.5,
        13,
        16,
        2.0,
        0
    );

    native.networkStartSynchronisedScene(enterScene);

    let animDuration = native.getAnimDuration(animDict, randomAnimName);
    await alt.Utils.wait(animDuration * 1000);

    playSlotSound('welcome_stinger');

    const idleScene = native.networkCreateSynchronisedScene(
        closestSlotCoord.x,
        closestSlotCoord.y,
        closestSlotCoord.z,
        closestSlotRotation.x,
        closestSlotRotation.y,
        closestSlotRotation.z,
        2,
        false,
        true,
        1.0,
        0,
        1.0
    );

    await alt.Utils.requestAnimDict(animDict);
    const randomIdleAnim = randomIdle[Math.floor(Math.random() * randomIdle.length)];

    native.networkAddPedToSynchronisedScene(
        alt.Player.local.scriptID,
        idleScene,
        animDict,
        randomIdleAnim,
        2.0,
        -1.5,
        13,
        16,
        2.0,
        0
    );

    native.networkStartSynchronisedScene(idleScene);
    hintText('Spin ~INPUT_JUMP~ \t Leave ~INPUT_FRONTEND_RRIGHT~');
});

function playSlotSound(audioName: string): void {
    const soundId = native.getSoundId();

    native.playSoundFromCoord(soundId, audioName, closestSlotCoord.x, closestSlotCoord.y, closestSlotCoord.z, availableSlots[closestSlotModel].slotSound, false, 20, false);
    native.releaseSoundId(soundId);
}

function drawText(coords: alt.Vector3, text: string): void {
    native.setTextScale(0.35, 0.35);
    native.setTextFont(4);
    native.setTextColour(255, 255, 255, 215);
    native.beginTextCommandDisplayText("STRING");
    native.setTextCentre(true);
    native.addTextComponentSubstringPlayerName(text);
    native.setDrawOrigin(coords.x, coords.y, coords.z + 1, false);
    native.endTextCommandDisplayText(0.0, 0.0, 0);

    const lenghtFactor = text.length / 370;

    native.drawRect(0.0, 0.0 + 0.0125, 0.017 + lenghtFactor, 0.03, 0, 0, 0, 75, false);
    native.clearDrawOrigin();
};

function hintText(hintText) {
    native.beginTextCommandDisplayHelp("STRING");
    native.addTextComponentSubstringPlayerName(hintText);
    native.endTextCommandDisplayHelp(0, true, true, -1);
};

async function startIdleScene(currentAnimation: string): Promise<void> {
    const duration = native.getAnimDuration(animDict, currentAnimation) * 800;
    await alt.Utils.wait(duration);

    const idleScene = native.networkCreateSynchronisedScene(
        closestSlotCoord.x,
        closestSlotCoord.y,
        closestSlotCoord.z,
        closestSlotRotation.x,
        closestSlotRotation.y,
        closestSlotRotation.z,
        2,
        false,
        true,
        1.0,
        0,
        1.0
    );

    await alt.Utils.requestAnimDict(animDict);

    const randomAnimName = randomIdle[Math.floor(Math.random() * randomIdle.length)];

    native.networkAddPedToSynchronisedScene(
        alt.Player.local,
        idleScene,
        animDict,
        randomAnimName,
        2.0,
        -1.5,
        13,
        16,
        2.0,
        0
    );

    native.networkStartSynchronisedScene(idleScene);
};

