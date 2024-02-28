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

let drawInterval: number | null = null;
let animDict: string = 'anim_casino_a@amb@casino@games@slots@male';

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
        closestSlotRotation == null
        ) return; 

    alt.emitServerRaw('serverSlots:spinSlot');
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

alt.onServer('clientSlot:spinSlot', async (reelObject1: alt.Object, reelObject2: alt.Object, reelObject3: alt.Object) => {
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

    await alt.Utils.waitFor(() => reelObject1.isSpawned && reelObject2.isSpawned && reelObject3.isSpawned);

    let slotHeading = native.getEntityHeading(closestSlot);

    for (let i = 1; i <= 300; i++) {
        let tempRot1 = native.getEntityRotation(reelObject1, 0);
        let tempRot2 = native.getEntityRotation(reelObject2, 0);
        let tempRot3 = native.getEntityRotation(reelObject3, 0);

        native.setEntityHeading(reelObject1, slotHeading);
        native.setEntityHeading(reelObject2, slotHeading);
        native.setEntityHeading(reelObject3, slotHeading);

        if (i < 180) {
            native.setEntityRotation(reelObject1, tempRot1.x + (getRandomInt(0, 360) - 180), tempRot1.y, tempRot1.z, 0, false);
        } else if (i == 180) {

        };

        await alt.Utils.wait(10);
    };
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


    alt.log("enterSlot")


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

