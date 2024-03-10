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

let streamedSlots: Map<number, { 
    streamedReel1: alt.LocalObject, 
    streamedReel2: alt.LocalObject, 
    streamedReel3: alt.LocalObject, 
    streamedBlurryReel1: alt.LocalObject,
    streamedBlurryReel2: alt.LocalObject,
    streamedBlurryReel3: alt.LocalObject
    }>  = new Map();

function isObjectSlot(object: alt.BaseObject) {
    if (!(object instanceof alt.VirtualEntity)) return false;
    if (object.getStreamSyncedMeta('entityType') !== 'casinoSlot') return false;

    return true;
};

function degreesToRadians(degrees: number): number {
    degrees = (degrees % 360 + 360) % 360;

    let radians = degrees * (Math.PI / 180);

    if (radians > Math.PI) {
        radians -= 2 * Math.PI;
    }

    return radians;
};

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function spinReels(object: alt.BaseObject, spinningStart: number) {
    let streamedSlot = streamedSlots.get(object.remoteID);  
    if (streamedSlot == null || streamedSlot == undefined) return;
    if (!(object instanceof alt.VirtualEntity)) return;

    let veObject = object as alt.VirtualEntity;
    let entityModel = veObject.getStreamSyncedMeta('entityModel') as number;
    let entityPosition = veObject.getStreamSyncedMeta('entityPosition') as alt.Vector3;
    let firstX = veObject.getStreamSyncedMeta('firstX') as number;
    let secondX = veObject.getStreamSyncedMeta('secondX') as number;
    let thirdX = veObject.getStreamSyncedMeta('thirdX') as number;

    streamedSlot.streamedReel1.alpha = 0;
    streamedSlot.streamedReel2.alpha = 0;
    streamedSlot.streamedReel3.alpha = 0;

    streamedSlot.streamedBlurryReel1.alpha = 1000;
    streamedSlot.streamedBlurryReel2.alpha = 1000;
    streamedSlot.streamedBlurryReel3.alpha = 1000;

    let spinInterval = alt.setInterval(() => {
        let currentTime = alt.getNetTime();
        let startTime = spinningStart;
        let timeDiff = currentTime - startTime;

        if (streamedSlot.streamedBlurryReel1.valid == false ||
            streamedSlot.streamedBlurryReel2.valid == false ||
            streamedSlot.streamedBlurryReel3.valid == false ||
            streamedSlot.streamedReel1.valid == false ||
            streamedSlot.streamedReel2.valid == false ||
            streamedSlot.streamedReel3.valid == false
            ) {
                if (spinInterval != null) {
                    alt.clearInterval(spinInterval);
                    spinInterval = null;
                }

                return;
            };

        let currentRot1 = native.getEntityRotation(streamedSlot.streamedBlurryReel1, 0);
        let currentRot2 = native.getEntityRotation(streamedSlot.streamedBlurryReel2, 0);
        let currentRot3 = native.getEntityRotation(streamedSlot.streamedBlurryReel3, 0);

        let firstRandom = currentRot1.x + getRandomInt(40, 100) / 10;
        let secondRandom = currentRot2.x + getRandomInt(40, 100) / 10;
        let thirdRandom = currentRot3.x + getRandomInt(40, 100) / 10;

        native.setEntityRotation(streamedSlot.streamedBlurryReel1, firstRandom, currentRot1.y, currentRot1.z, 0, true);
        native.setEntityRotation(streamedSlot.streamedBlurryReel2, secondRandom, currentRot2.y, currentRot2.z, 0, true);
        native.setEntityRotation(streamedSlot.streamedBlurryReel3, thirdRandom, currentRot3.y, currentRot3.z, 0, true); 

        if (timeDiff >= 2000) {
            if (streamedSlot.streamedBlurryReel1.alpha > 0) {
                streamedSlot.streamedBlurryReel1.alpha = 0;

                if (streamedSlot.streamedReel1.alpha == 0) {
                    let finalRot = native.getEntityRotation(streamedSlot.streamedBlurryReel1, 0);
                    
                    native.setEntityRotation(streamedSlot.streamedReel1, firstX * 22.5 - 180 + 0.0, finalRot.y, finalRot.z, 0, true);
                    streamedSlot.streamedReel1.alpha = 1000;

                    const soundId = native.getSoundId();
                    native.playSoundFromCoord(soundId, 'wheel_stop_clunk', entityPosition.x, entityPosition.y, entityPosition.z, availableSlots[entityModel].slotSound, false, 20, false);
                    native.releaseSoundId(soundId);
                }
            }
        };

        if (timeDiff >= 4000) {
            if (streamedSlot.streamedBlurryReel2.alpha > 0) {
                streamedSlot.streamedBlurryReel2.alpha = 0;

                if (streamedSlot.streamedReel2.alpha == 0) {
                    let finalRot = native.getEntityRotation(streamedSlot.streamedBlurryReel2, 0);
                    
                    native.setEntityRotation(streamedSlot.streamedReel2, secondX * 22.5 - 180 + 0.0, finalRot.y, finalRot.z, 0, true);
                    streamedSlot.streamedReel2.alpha = 1000;

                    const soundId = native.getSoundId();

                    native.playSoundFromCoord(soundId, 'wheel_stop_clunk', entityPosition.x, entityPosition.y, entityPosition.z, availableSlots[entityModel].slotSound, false, 20, false);
                    native.releaseSoundId(soundId);
                }
            }
        };

        if (timeDiff >= 6000) {
            if (streamedSlot.streamedBlurryReel3.alpha > 0) {
                streamedSlot.streamedBlurryReel3.alpha = 0;

                if (streamedSlot.streamedReel3.alpha == 0) {
                    let finalRot = native.getEntityRotation(streamedSlot.streamedBlurryReel3, 0);
                    
                    native.setEntityRotation(streamedSlot.streamedReel3, thirdX * 22.5 - 180 + 0.0, finalRot.y, finalRot.z, 0, true);
                    streamedSlot.streamedReel3.alpha = 1000;

                    const soundId = native.getSoundId();

                    native.playSoundFromCoord(soundId, 'wheel_stop_clunk', entityPosition.x, entityPosition.y, entityPosition.z, availableSlots[entityModel].slotSound, false, 20, false);
                    native.releaseSoundId(soundId);

                    if (spinInterval != null) {
                        alt.clearInterval(spinInterval);
                        spinInterval = null;
                    };
                }
            }
        };
    }, 10)
}

alt.on('streamSyncedMetaChange', (object, changedKey, newValue) => {
    if (!isObjectSlot(object)) return;

    switch (changedKey) {
        case 'spinningInfo':
            let streamedSlot = streamedSlots.get(object.remoteID);    
            if (streamedSlot == null || streamedSlot == undefined) return;

            let veObject = object as alt.VirtualEntity;
            let firstX = veObject.getStreamSyncedMeta('firstX') as number;
            let secondX = veObject.getStreamSyncedMeta('secondX') as number;
            let thirdX = veObject.getStreamSyncedMeta('thirdX') as number;

            if (newValue.isSpinning) { 
                spinReels(object, newValue.spinningStart);
            } else {
                let currentRot1 = native.getEntityRotation(streamedSlot.streamedBlurryReel1, 0);
                let currentRot2 = native.getEntityRotation(streamedSlot.streamedBlurryReel2, 0);
                let currentRot3 = native.getEntityRotation(streamedSlot.streamedBlurryReel3, 0);

                native.setEntityRotation(streamedSlot.streamedBlurryReel1, firstX * 22.5 - 180 + 0.0, currentRot1.y, currentRot1.z, 0, true);
                native.setEntityRotation(streamedSlot.streamedBlurryReel2, secondX * 22.5 - 180 + 0.0, currentRot2.y, currentRot2.z, 0, true);
                native.setEntityRotation(streamedSlot.streamedBlurryReel3, thirdX * 22.5 - 180 + 0.0, currentRot3.y, currentRot3.z, 0, true); 

            break;
        }
    }
})

alt.on('worldObjectStreamIn', async (object: alt.WorldObject) => {
    if (!isObjectSlot(object)) return;

    let veObject = object as alt.VirtualEntity;
    let entityModel = veObject.getStreamSyncedMeta('entityModel') as number;
    let entityPosition = veObject.getStreamSyncedMeta('entityPosition') as alt.Vector3;

    let firstX = veObject.getStreamSyncedMeta('firstX') as number;
    let secondX = veObject.getStreamSyncedMeta('secondX') as number;
    let thirdX = veObject.getStreamSyncedMeta('thirdX') as number;

    await alt.Utils.waitFor(() => native.getClosestObjectOfType(entityPosition.x, entityPosition.y, entityPosition.z, 2, entityModel, false, false, false) !== 0);

    let veClosestSlot = native.getClosestObjectOfType(entityPosition.x, entityPosition.y, entityPosition.z, 2, entityModel, false, false, false);
    let slotHeading = native.getEntityHeading(veClosestSlot);

    let reelLocation1 = native.getOffsetFromCoordAndHeadingInWorldCoords(entityPosition.x, entityPosition.y, entityPosition.z, native.getEntityHeading(veClosestSlot), -0.115, 0.047, 0.906)
    let reelLocation2 = native.getOffsetFromCoordAndHeadingInWorldCoords(entityPosition.x, entityPosition.y, entityPosition.z, native.getEntityHeading(veClosestSlot), 0.005, 0.047, 0.906)
    let reelLocation3 = native.getOffsetFromCoordAndHeadingInWorldCoords(entityPosition.x, entityPosition.y, entityPosition.z, native.getEntityHeading(veClosestSlot), 0.125, 0.047, 0.906)

    let veObject1 = new alt.LocalObject(availableSlots[entityModel].reelA, reelLocation1, new alt.Vector3(0, 0, degreesToRadians(slotHeading)), false);
    let veObject2 = new alt.LocalObject(availableSlots[entityModel].reelA, reelLocation2, new alt.Vector3(0, 0, degreesToRadians(slotHeading)), false);
    let veObject3 = new alt.LocalObject(availableSlots[entityModel].reelA, reelLocation3, new alt.Vector3(0, 0, degreesToRadians(slotHeading)), false);

    await alt.Utils.waitFor(() => veObject1.isSpawned && veObject2.isSpawned && veObject3.isSpawned)
    .then(() => {
        native.setEntityRotation(veObject1, firstX * 22.5 - 180 + 0.0, 0, slotHeading, 0, true);
        native.setEntityRotation(veObject2, secondX * 22.5 - 180 + 0.0, 0, slotHeading, 0, true);
        native.setEntityRotation(veObject3, thirdX * 22.5 - 180 + 0.0, 0, slotHeading, 0, true);
    })
    .catch((e) => {
        alt.logError(e);
    });

    let veBlurryObject1 = new alt.LocalObject(availableSlots[entityModel].reelB, reelLocation1, new alt.Vector3(0, 0, degreesToRadians(slotHeading)), false);
    let veBlurryObject2 = new alt.LocalObject(availableSlots[entityModel].reelB, reelLocation2, new alt.Vector3(0, 0, degreesToRadians(slotHeading)), false);
    let veBlurryObject3 = new alt.LocalObject(availableSlots[entityModel].reelB, reelLocation3, new alt.Vector3(0, 0, degreesToRadians(slotHeading)), false);

    await alt.Utils.waitFor(() => veBlurryObject1.isSpawned && veBlurryObject2.isSpawned && veBlurryObject3.isSpawned)
    .then(() => {
        veBlurryObject1.alpha = 0;
        veBlurryObject2.alpha = 0;
        veBlurryObject3.alpha = 0;
    })
    .catch((e) => {
        alt.logError(e);
    });

    streamedSlots.set(veObject.remoteID, { 
        streamedReel1: veObject1, 
        streamedReel2: veObject2, 
        streamedReel3: veObject3, 
        streamedBlurryReel1: veBlurryObject1, 
        streamedBlurryReel2: veBlurryObject2,
        streamedBlurryReel3: veBlurryObject3
    });

    let spinningInfo = veObject.getStreamSyncedMeta('spinningInfo') as { isSpinning: boolean, spinningStart: number };
    if (spinningInfo == null && spinningInfo == undefined) return;

    if (spinningInfo.isSpinning) {
        spinReels(object, spinningInfo.spinningStart);
    };
})

alt.on('worldObjectStreamOut', async (object: alt.WorldObject) => {
    if (!isObjectSlot(object)) return;

    let streamedSlot = streamedSlots.get(object.remoteID);
    if (streamedSlot.streamedBlurryReel1.valid) streamedSlot.streamedBlurryReel1.destroy();
    if (streamedSlot.streamedBlurryReel2.valid) streamedSlot.streamedBlurryReel2.destroy();
    if (streamedSlot.streamedBlurryReel3.valid) streamedSlot.streamedBlurryReel3.destroy();
    if (streamedSlot.streamedReel1.valid) streamedSlot.streamedReel1.destroy();
    if (streamedSlot.streamedReel2.valid) streamedSlot.streamedReel2.destroy();
    if (streamedSlot.streamedReel3.valid) streamedSlot.streamedReel3.destroy();

    streamedSlots.delete(object.remoteID);

})

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

    alt.emitServerRaw('serverSlots:enterSlot');
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
