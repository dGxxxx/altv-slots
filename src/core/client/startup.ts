import * as alt from 'alt-client';
import * as native from 'natives';
import { availableSlots } from '../shared/startup.js';

const casinoIpls: string[] = [ 'hei_dlc_windows_casino', 'hei_dlc_casino_aircon', 'vw_dlc_casino_door', 'hei_dlc_casino_door', 'vw_casino_main' ];
const randomIdle: string[] = ['base_idle_a', 'base_idle_b', 'base_idle_c', 'base_idle_d', 'base_idle_e', 'base_idle_f'];
const randomEnter: string[] = ['enter_left', 'enter_right', 'enter_left_short', 'enter_right_short'];
const randomSpin: string[] = ['press_spin_a', 'press_spin_b', 'pull_spin_a', 'pull_spin_b'];
const randomSpinningIdle: string[] = ['spinning_a', 'spinning_b', 'spinning_c'];
const randomWin: string[] = [ 'win_a', 'win_b', 'win_c', 'win_d', 'win_e', 'win_f', 'win_g', 'win_spinning_wheel' ];
const randomLose: string[] = [ 'lose_a', 'lose_b', 'lose_c', 'lose_d', 'lose_e', 'lose_f', 'lose_cruel_a', 'lose_cruel_b' ];
const randomLeave: string[] = [ 'exit_left', 'exit_right' ];

let closestSlot: number | null = null;
let closestSlotModel: number | null = null;
let closestSlotCoord: alt.Vector3 | null = null;
let closestSlotRotation: alt.Vector3 | null = null;

let drawInterval: number | null = null;
let animDict: string = 'anim_casino_a@amb@casino@games@slots@male';

let isSpinning: boolean = false;
let isSeated: boolean = false;

function degreesToRadians(degrees: number) {
    return degrees * (Math.PI / 180);
};

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

alt.on('keyup', async (key: alt.KeyCode) => {
    if (key != 69) return;
    if (closestSlot == null ||
        closestSlotModel == null || 
        closestSlotCoord == null ||
        closestSlotRotation == null
        ) return; 

    if (isSeated) return;

    let slotHeading = native.getEntityHeading(closestSlot);

    let reelLocation1 = native.getOffsetFromCoordAndHeadingInWorldCoords(closestSlotCoord.x, closestSlotCoord.y, closestSlotCoord.z, native.getEntityHeading(closestSlot), -0.115, 0.047, 0.906)
    let reelLocation2 = native.getOffsetFromCoordAndHeadingInWorldCoords(closestSlotCoord.x, closestSlotCoord.y, closestSlotCoord.z, native.getEntityHeading(closestSlot), 0.005, 0.047, 0.906)
    let reelLocation3 = native.getOffsetFromCoordAndHeadingInWorldCoords(closestSlotCoord.x, closestSlotCoord.y, closestSlotCoord.z, native.getEntityHeading(closestSlot), 0.125, 0.047, 0.906)

    let clientObject1 = new alt.LocalObject(availableSlots[closestSlotModel].reelA, reelLocation1, new alt.Vector3(0, 0, degreesToRadians(slotHeading)), false);
    let clientObject2 = new alt.LocalObject(availableSlots[closestSlotModel].reelA, reelLocation2, new alt.Vector3(0, 0, degreesToRadians(slotHeading)), false);
    let clientObject3 = new alt.LocalObject(availableSlots[closestSlotModel].reelA, reelLocation3, new alt.Vector3(0, 0, degreesToRadians(slotHeading)), false);

    await alt.Utils.waitFor(() => clientObject1.isSpawned && clientObject2.isSpawned && clientObject3.isSpawned)
    .then(() => {
        let localObjPos1 = clientObject1.pos; 
        clientObject1.destroy();
        let localObjPos2 = clientObject2.pos; 
        clientObject2.destroy();
        let localObjPos3 = clientObject3.pos; 
        clientObject3.destroy();

        alt.emitServerRaw('serverSlots:enterSlot', slotHeading, localObjPos1, localObjPos2, localObjPos3);
    })
    .catch((e) => {
        alt.logError(e);
    });
});

alt.on('keyup', (key: alt.KeyCode) => {
    if (key != 32) return;

    if (closestSlot == null ||
        closestSlotModel == null || 
        closestSlotCoord == null ||
        closestSlotRotation == null) return; 

    if (!isSeated) return;
    if (isSpinning) return;

    alt.emitServerRaw('serverSlots:spinSlot');
});

alt.on('keyup', (key: alt.KeyCode) => {
    if (key != 8) return;

    if (closestSlot == null ||
        closestSlotModel == null || 
        closestSlotCoord == null ||
        closestSlotRotation == null) return; 

    if (!isSeated) return;
    if (isSpinning) return;

    alt.emitServerRaw('serverSlots:leaveSlot');
});

alt.onServer('clientSlot:positionReels', async (reelObject1: alt.Object, reelObject2: alt.Object, reelObject3: alt.Object, slotReelLocation1: alt.Vector3, slotReelLocation2: alt.Vector3, slotReelLocation3:alt.Vector3) => {
    await alt.Utils.waitFor(() => reelObject1.isSpawned && reelObject2.isSpawned && reelObject3.isSpawned)
    .then(() => {
        native.setEntityCoords(reelObject1, slotReelLocation1.x, slotReelLocation1.y, slotReelLocation1.z, false, false, false, false);
        native.setEntityCoords(reelObject2, slotReelLocation2.x, slotReelLocation2.y, slotReelLocation2.z, false, false, false, false);
        native.setEntityCoords(reelObject3, slotReelLocation3.x, slotReelLocation3.y, slotReelLocation3.z, false, false, false, false);
    })
    .catch((e) => {
        alt.logError(e);
    });
});

alt.onServer('clientSlot:clunkSound', () => {
    const soundId = native.getSoundId();

    native.playSoundFromCoord(soundId, 'wheel_stop_clunk', closestSlotCoord.x, closestSlotCoord.y, closestSlotCoord.z, availableSlots[closestSlotModel].slotSound, false, 20, false);
    native.releaseSoundId(soundId);
});

alt.onServer('clientSlot:leaveSlot', async (slotPosition: alt.Vector3, slotModel: number) => {
    closestSlot = null;
    closestSlotCoord = null;
    closestSlotRotation = null;
    closestSlotModel = null;

    const slotEntity = native.getClosestObjectOfType(slotPosition.x, slotPosition.y, slotPosition.z, 2, slotModel, false, false, false);
    const slotRotation = native.getEntityRotation(slotEntity, 2);
    const randomAnim = randomLeave[Math.floor(Math.random() * randomLeave.length)];
    const animDuration = native.getAnimDuration(animDict, randomAnim);
    const leaveScene = native.networkCreateSynchronisedScene(
        slotPosition.x,
        slotPosition.y,
        slotPosition.z,
        slotRotation.x,
        slotRotation.y,
        slotRotation.z,
        2, 
        false, 
        false, 
        1.0, 
        0, 
        1.0
    );

    native.networkAddPedToSynchronisedScene(
        alt.Player.local.scriptID,
        leaveScene,
        animDict,
        randomAnim,
        2.0, 
        -1.5, 
        13, 
        16, 
        2.0, 
        0
    );

    native.networkStartSynchronisedScene(leaveScene);
    await alt.Utils.wait(animDuration * 700);
    native.networkStopSynchronisedScene(leaveScene);

    isSeated = false;
    isSpinning = false;
});

alt.onServer('clientSlot:spinFinished', async (isWin: boolean) => {
    const soundId = native.getSoundId();
    let randomAnim;

    if (isWin) {
        native.playSoundFromCoord(soundId, 'small_win', closestSlotCoord.x, closestSlotCoord.y, closestSlotCoord.z, availableSlots[closestSlotModel].slotSound, false, 20, false);
        native.releaseSoundId(soundId);

        randomAnim = randomWin[Math.floor(Math.random() * randomWin.length)];
        const winScene = native.networkCreateSynchronisedScene(
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

        native.networkAddPedToSynchronisedScene(
            alt.Player.local.scriptID,
            winScene,
            animDict,
            randomAnim,
            2.0, 
            -1.5, 
            13, 
            16, 
            2.0, 
            0
        );

        native.networkStartSynchronisedScene(winScene);
    } else {
        native.playSoundFromCoord(soundId, 'no_win', closestSlotCoord.x, closestSlotCoord.y, closestSlotCoord.z, availableSlots[closestSlotModel].slotSound, false, 20, false);
        native.releaseSoundId(soundId);

        randomAnim = randomLose[Math.floor(Math.random() * randomLose.length)];
        const loseScene = native.networkCreateSynchronisedScene(
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

        native.networkAddPedToSynchronisedScene(
            alt.Player.local.scriptID,
            loseScene,
            animDict,
            randomAnim,
            2.0, 
            -1.5, 
            13, 
            16, 
            2.0, 
            0
        );

        native.networkStartSynchronisedScene(loseScene);
    };

    let animDuration = native.getAnimDuration(animDict, randomAnim);
    await alt.Utils.wait(animDuration * 800);

    isSpinning = false;

    const randomIdleAnim = randomIdle[Math.floor(Math.random() * randomIdle.length)];
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
});

alt.onServer('clientSlots:closestSlot', (slotPosition: alt.Vector3, slotModel: number) => {
    closestSlot = null;
    closestSlotCoord = null;
    closestSlotRotation = null;
    closestSlotModel = null;

    if (drawInterval != null) {
        alt.clearInterval(drawInterval);
        drawInterval = null;
    };

    closestSlot = native.getClosestObjectOfType(slotPosition.x, slotPosition.y, slotPosition.z, 1.2, slotModel, false, false, false);

    if (closestSlot == 0) {
        alt.logError("Can't find closest slot. Return.");
        closestSlot = null;

        return
    };

    closestSlotCoord = native.getEntityCoords(closestSlot, false);
    closestSlotRotation = native.getEntityRotation(closestSlot, 2);
    closestSlotModel = slotModel;

    drawInterval = alt.setInterval(() => {
        drawText(closestSlotCoord, "~b~E~w~ - Play " + availableSlots[slotModel].slotName);
    }, 0);
});

alt.onServer('clientSlot:spinSlot', async () => {
    if (closestSlot == null ||
        closestSlotCoord == null ||
        closestSlotModel == null ||
        closestSlotRotation == null) return;

    if (!native.hasAnimDictLoaded(animDict)) {
        await alt.Utils.requestAnimDict(animDict);
    };

    const soundId = native.getSoundId();
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

    const randomAnimName = randomSpin[Math.floor(Math.random() * randomSpin.length)];

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

    native.playSoundFromCoord(soundId, 'start_spin', closestSlotCoord.x, closestSlotCoord.y, closestSlotCoord.z, availableSlots[closestSlotModel].slotSound, false, 20, false);
    native.releaseSoundId(soundId);

    isSpinning = true;

    const delayMultiplier = (randomAnimName === 'pull_spin_a' || randomAnimName === 'pull_spin_b') ? 320 : 180;
    const animationDuration = native.getAnimDuration(animDict, randomAnimName);

    await alt.Utils.wait(animationDuration * delayMultiplier);

    const rIdle = randomSpinningIdle[Math.floor(Math.random() * randomSpinningIdle.length)];
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

    native.networkAddPedToSynchronisedScene(alt.Player.local.scriptID, 
        spinningScene, 
        animDict, 
        rIdle,
        2.0, 
        -1.5, 
        13, 
        16, 
        2.0, 
        0
    );

    native.networkStartSynchronisedScene(spinningScene);
});

alt.onServer('clientSlots:resetClosestSlot', () => {
    closestSlot = null;
    closestSlotCoord = null;
    closestSlotRotation = null;
    closestSlotModel = null;

    if (drawInterval != null) {
        alt.clearInterval(drawInterval);
        drawInterval = null;
    };
});

alt.onServer('clientSlots:enterSlot', async () => {
    if (closestSlot == null ||
        closestSlotModel == null || 
        closestSlotCoord == null ||
        closestSlotRotation == null
        ) return; 

    if (alt.hash('mp_f_freemode_01') === alt.Player.local.model) {
        animDict = 'anim_casino_a@amb@casino@games@slots@female';
    };

    if (!native.hasAnimDictLoaded(animDict)) {
        await alt.Utils.requestAnimDict(animDict);
    };

    if (drawInterval != null) {
        alt.clearInterval(drawInterval);
        drawInterval = null;
    };

    const soundId = native.getSoundId();
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

    native.playSoundFromCoord(soundId, 'welcome_stinger', closestSlotCoord.x, closestSlotCoord.y, closestSlotCoord.z, availableSlots[closestSlotModel].slotSound, false, 20, false);
    native.releaseSoundId(soundId);

    const animTime = native.getAnimDuration(animDict, randomAnimName);
    await alt.Utils.wait(animTime * 1000);

    const randomIdleAnim = randomIdle[Math.floor(Math.random() * randomIdle.length)];
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

    isSeated = true;
});

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
