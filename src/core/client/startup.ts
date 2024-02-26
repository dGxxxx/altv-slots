import * as alt from 'alt-client';
import * as native from 'natives';

import { availableSlots } from '../shared/startup.js';

const casinoIpls: string[] = [ 'hei_dlc_windows_casino', 'hei_dlc_casino_aircon', 'vw_dlc_casino_door', 'hei_dlc_casino_door', 'vw_casino_main' ];
const randomIdle: string[] = ['base_idle_a', 'base_idle_b', 'base_idle_c', 'base_idle_d', 'base_idle_e', 'base_idle_f'];
const randomEnter: string[] = ['enter_left', 'enter_right', 'enter_left_short', 'enter_right_short'];
const randomSpin: string[] = ['press_spin_a', 'press_spin_b', 'pull_spin_a', 'pull_spin_b'];
const randomSpinningIdle: string[] = ['spinning_a', 'spinning_b', 'spinning_c'];

let closestSlot: number | null = null;
let closestSlotModel: number | null = null;
let closestSlotCoord: alt.Vector3 | null = null;
let closestSlotRotation: alt.Vector3 | null = null;

let reelLocation1: alt.Vector3 | null = null;
let reelLocation2: alt.Vector3 | null = null;
let reelLocation3: alt.Vector3 | null = null;

let drawInterval: number | null = null;
let animDict: string = 'anim_casino_a@amb@casino@games@slots@male';
let isSeatedAtSlot: boolean = false;
let isSpinning: boolean = false;

alt.on('connectionComplete', () => {
    for (let i = 0; i < casinoIpls.length; i++) {
        const casinoIpl = casinoIpls[i];
        const isIplLoaded = native.isIplActive(casinoIpl);
        if (isIplLoaded) continue;

        alt.log('1231231');
        alt.requestIpl(casinoIpl);
    };

    native.requestScriptAudioBank("DLC_VINEWOOD\\CASINO_SLOT_MACHINES_01", false, 0);
	native.requestScriptAudioBank("DLC_VINEWOOD\\CASINO_SLOT_MACHINES_02", false, 0);
	native.requestScriptAudioBank("DLC_VINEWOOD\\CASINO_SLOT_MACHINES_03", false, 0);
	native.requestScriptAudioBank("DLC_VINEWOOD\\CASINO_GENERAL", false, 0);
});

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

alt.on('keyup', (key: alt.KeyCode) => {
    if (key != 69) return;

    if (closestSlot == null ||
        closestSlotModel == null || 
        closestSlotCoord == null ||
        closestSlotRotation == null
        ) return; 
    
    if (isSeatedAtSlot) return;

    let slotHeading = native.getEntityHeading(closestSlot);

    reelLocation1 = native.getOffsetFromCoordAndHeadingInWorldCoords(closestSlotCoord.x, closestSlotCoord.y, closestSlotCoord.z, native.getEntityHeading(closestSlot), -0.115, 0.047, 0.906)
    reelLocation2 = native.getOffsetFromCoordAndHeadingInWorldCoords(closestSlotCoord.x, closestSlotCoord.y, closestSlotCoord.z, native.getEntityHeading(closestSlot), 0.005, 0.047, 0.906)
    reelLocation3 = native.getOffsetFromCoordAndHeadingInWorldCoords(closestSlotCoord.x, closestSlotCoord.y, closestSlotCoord.z, native.getEntityHeading(closestSlot), 0.125, 0.047, 0.906)

    let localObject1 = native.createObject(alt.hash(availableSlots[closestSlotModel].reelA), reelLocation1.x, reelLocation1.y, reelLocation1.z, false, false, false);
    let localObject2 = native.createObject(alt.hash(availableSlots[closestSlotModel].reelA), reelLocation2.x, reelLocation2.y, reelLocation2.z, false, false, false);
    let localObject3 = native.createObject(alt.hash(availableSlots[closestSlotModel].reelA), reelLocation3.x, reelLocation3.y, reelLocation3.z, false, false, false);

    native.setEntityHeading(localObject1, slotHeading);
    native.setEntityHeading(localObject2, slotHeading);
    native.setEntityHeading(localObject3, slotHeading);

    let localObjectCoords1 = native.getEntityCoords(localObject1, false);
    let localObjectCoords2 = native.getEntityCoords(localObject2, false);
    let localObjectCoords3 = native.getEntityCoords(localObject3, false);

    alt.emitServerRaw('serverSlots:enterSlot', closestSlotCoord, localObjectCoords1, localObjectCoords2, localObjectCoords3, closestSlotModel, slotHeading);

    native.deleteEntity(localObject1);
    native.deleteEntity(localObject2);
    native.deleteEntity(localObject3);
});

alt.on('keyup', (key: alt.KeyCode) => {
    if (key != 32) return;

    if (closestSlot == null ||
        closestSlotModel == null || 
        closestSlotCoord == null ||
        closestSlotRotation == null
        ) return; 
    
    if (!isSeatedAtSlot) return;
    if (isSpinning) return;

    alt.emitServerRaw('serverSlots:spinSlot');
});

alt.onServer('clientSlot:betterPositioning', async (reelEntity1: alt.Object, reelEntity2: alt.Object, reelEntity3: alt.Object, reelLocation1: alt.Vector3, reelLocation2: alt.Vector3, reelLocation3:alt.Vector3) => {
    await alt.Utils.waitFor(() => reelEntity1.isSpawned);
    await alt.Utils.waitFor(() => reelEntity2.isSpawned);
    await alt.Utils.waitFor(() => reelEntity3.isSpawned);

    native.setEntityCoords(reelEntity1, reelLocation1.x, reelLocation1.y, reelLocation1.z, false, false, false, false);
    native.setEntityCoords(reelEntity2, reelLocation2.x, reelLocation2.y, reelLocation2.z, false, false, false, false);
    native.setEntityCoords(reelEntity3, reelLocation3.x, reelLocation3.y, reelLocation3.z, false, false, false, false);
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

alt.onServer('clientSlots:spinSlot', async () => {
    if (closestSlot == null ||
        closestSlotCoord == null ||
        closestSlotModel == null ||
        closestSlotRotation == null) return;

    if (!isSeatedAtSlot) return;
    
    isSpinning = true;

    const spinScene = native.networkCreateSynchronisedScene(
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

    let randomAnimName = randomSpin[Math.floor(Math.random() * randomSpin.length)];
    native.networkAddPedToSynchronisedScene(
        alt.Player.local.scriptID,
        spinScene,
        animDict,
        randomAnimName,
        2.0,
        -1.5,
        13,
        16,
        1000.0,
        0
    );

    native.networkStartSynchronisedScene(spinScene);

    const animationDuration = native.getAnimDuration(animDict, randomAnimName);

    let leverScene;

    if (randomAnimName === 'pull_spin_a') {
        leverScene = native.networkCreateSynchronisedScene(
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

        native.networkAddMapEntityToSynchronisedScene(
            leverScene,
            native.getEntityModel(closestSlot),
            closestSlotCoord.x,
            closestSlotCoord.y,
            closestSlotCoord.z,
            2.0,
            'pull_spin_a_SLOTMACHINE',
            2.0,
            -1.5,
            13.0
        );

        native.networkStartSynchronisedScene(leverScene);
        await alt.Utils.wait(animationDuration * 320);
    } else if (randomAnimName === 'pull_spin_b') {
        leverScene = native.networkCreateSynchronisedScene(
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

        native.networkAddMapEntityToSynchronisedScene(
            leverScene,
            native.getEntityModel(closestSlot),
            closestSlotCoord.x,
            closestSlotCoord.y,
            closestSlotCoord.z,
            2.0,
            'pull_spin_b_SLOTMACHINE',
            2.0,
            -1.5,
            13.0
        );

        native.networkStartSynchronisedScene(leverScene);
        await alt.Utils.wait(animationDuration * 320);
    };

    await alt.Utils.wait(animationDuration * 180);
    playSlotSound('start_spin');

    await alt.Utils.wait(animationDuration * 500);
    const spinningScene = native.networkCreateSynchronisedScene(
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

    randomAnimName = randomSpinningIdle[Math.floor(Math.random() * randomSpinningIdle.length)];
    native.networkAddPedToSynchronisedScene(
        alt.Player.local.scriptID,
        spinningScene,
        animDict,
        randomAnimName,
        2.0,
        -1.5,
        13,
        16,
        2.0,
        0
    );

    native.networkStartSynchronisedScene(spinningScene);

    if (leverScene != null) native.networkStopSynchronisedScene(leverScene);
    native.freezeEntityPosition(closestSlot, true);
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
    if (closestSlot == null ||
        closestSlotCoord == null ||
        closestSlotModel == null ||
        closestSlotRotation == null) return;
    
    isSeatedAtSlot = true;

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

    if (drawInterval != null) {
        alt.clearInterval(drawInterval);
    };
    
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

