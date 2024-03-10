import * as alt from 'alt-server';
import { availableSlots, winNumbers, winMultipliers } from '../shared/startup.js';

interface SlotInformation {
    slotPosition: alt.Vector3;
    slotModel: number;
};

interface Win {
    firstReel: number;
    secondReel: number;
    thirdReel: number;
};

const availableSlotPosition: SlotInformation[]= [
    { slotPosition: new alt.Vector3(1100.4827880859375, 230.40823364257812, -50.840919494628906), slotModel: 654385216 },
    { slotPosition: new alt.Vector3(1100.93896484375, 231.0016632080078, -50.840919494628906), slotModel: 161343630 },
    { slotPosition: new alt.Vector3(1101.220947265625, 231.69427490234375, -50.840919494628906), slotModel: 1096374064 },
    { slotPosition: new alt.Vector3(1101.32275390625, 232.43211364746094, -50.840919494628906), slotModel: 207578973 },
    { slotPosition: new alt.Vector3(1101.2294921875, 233.17190551757812, -50.840919494628906), slotModel: 3807744938 },
    { slotPosition: new alt.Vector3(1108.9384765625, 239.4796600341797, -50.8409309387207), slotModel: 2362925439 },
    { slotPosition: new alt.Vector3(1109.5357666015625, 239.02783203125, -50.8409309387207), slotModel: 2775323096 },
    { slotPosition: new alt.Vector3(1104.30224609375, 230.3182830810547, -50.8409309387207), slotModel: 161343630 },
    { slotPosition: new alt.Vector3(1104.5723876953125, 229.44512939453125, -50.8409309387207), slotModel: 654385216 },
    { slotPosition: new alt.Vector3(1105.0491943359375, 230.84498596191406, -50.8409309387207), slotModel: 2362925439 },
    { slotPosition: new alt.Vector3(1105.4862060546875, 229.4321746826172, -50.8409309387207), slotModel: 3863977906 },
    { slotPosition: new alt.Vector3(1105.7808837890625, 230.29733276367188, -50.8409309387207), slotModel: 2775323096 },
    { slotPosition: new alt.Vector3(1108.00537109375, 233.917724609375, -50.8409309387207), slotModel: 207578973 },
    { slotPosition: new alt.Vector3(1107.7353515625, 234.79087829589844, -50.8409309387207), slotModel: 3807744938 },
    { slotPosition: new alt.Vector3(1108.9193115234375, 233.90478515625, -50.8409309387207), slotModel: 1096374064 },
    { slotPosition: new alt.Vector3(1108.4822998046875, 235.3175811767578, -50.8409309387207), slotModel: 654385216 },
    { slotPosition: new alt.Vector3(1109.2139892578125, 234.7699432373047, -50.8409309387207), slotModel: 161343630 },
    { slotPosition: new alt.Vector3(1110.229248046875, 238.7427978515625, -50.8409309387207), slotModel: 3863977906 },
    { slotPosition: new alt.Vector3(1113.36962890625, 234.54864501953125, -50.8409309387207), slotModel: 161343630 },
    { slotPosition: new alt.Vector3(1110.97412109375, 238.64198303222656, -50.8409309387207), slotModel: 654385216 },
    { slotPosition: new alt.Vector3(1111.7161865234375, 238.73843383789062, -50.8409309387207), slotModel: 161343630 },
    { slotPosition: new alt.Vector3(1117.576171875, 228.87669372558594, -50.8409309387207), slotModel: 1096374064 },
    { slotPosition: new alt.Vector3(1121.5919189453125, 230.41064453125, -50.840919494628906), slotModel: 161343630 },
    { slotPosition: new alt.Vector3(1121.135009765625, 230.9998779296875, -50.840919494628906), slotModel: 654385216 },
    { slotPosition: new alt.Vector3(1120.853271484375, 231.68862915039062, -50.840919494628906), slotModel: 3863977906 },
    { slotPosition: new alt.Vector3(1120.7528076171875, 232.4274444580078, -50.840919494628906), slotModel: 2775323096 },
    { slotPosition: new alt.Vector3(1120.85302734375, 233.16207885742188, -50.840919494628906), slotModel: 2362925439 },
    { slotPosition: new alt.Vector3(1117.8709716796875, 229.74185180664062, -50.8409309387207), slotModel: 161343630 },
    { slotPosition: new alt.Vector3(1117.13916015625, 230.2895050048828, -50.8409309387207), slotModel: 654385216 },
    { slotPosition: new alt.Vector3(1116.3922119140625, 229.76280212402344, -50.8409309387207), slotModel: 3807744938 },
    { slotPosition: new alt.Vector3(1116.662353515625, 228.8896484375, -50.8409309387207), slotModel: 207578973 },
    { slotPosition: new alt.Vector3(1114.5535888671875, 233.66253662109375, -50.8409309387207), slotModel: 3863977906 },
    { slotPosition: new alt.Vector3(1114.848388671875, 234.5277099609375, -50.8409309387207), slotModel: 2775323096 },
    { slotPosition: new alt.Vector3(1114.1165771484375, 235.07534790039062, -50.8409309387207), slotModel: 2362925439 },
    { slotPosition: new alt.Vector3(1113.6397705078125, 233.6754913330078, -50.8409309387207), slotModel: 654385216 },
    { slotPosition: new alt.Vector3(1112.40673828125, 239.02163696289062, -50.8409309387207), slotModel: 1096374064 },
    { slotPosition: new alt.Vector3(1112.9991455078125, 239.47421264648438, -50.84092712402344), slotModel: 207578973 },
    { slotPosition: new alt.Vector3(1133.827392578125, 256.9097900390625, -52.04094696044922), slotModel: 654385216 },
    { slotPosition: new alt.Vector3(1133.952392578125, 256.10369873046875, -52.04094696044922), slotModel: 3863977906 },
    { slotPosition: new alt.Vector3(1131.0623779296875, 250.07757568359375, -52.04094314575195), slotModel: 1096374064 },
    { slotPosition: new alt.Vector3(1130.37646484375, 250.3577423095703, -52.04094314575195), slotModel: 207578973 },
    { slotPosition: new alt.Vector3(1131.65478515625, 249.62643432617188, -52.04094314575195), slotModel: 161343630 },
    { slotPosition: new alt.Vector3(1132.1092529296875, 249.03546142578125, -52.04094314575195), slotModel: 654385216 },
    { slotPosition: new alt.Vector3(1132.3961181640625, 248.33819580078125, -52.04094314575195), slotModel: 3863977906 },
    { slotPosition: new alt.Vector3(1132.4921875, 247.59841918945312, -52.04094314575195), slotModel: 2775323096 },
    { slotPosition: new alt.Vector3(1138.0703125, 252.667724609375, -52.04094696044922), slotModel: 207578973 },
    { slotPosition: new alt.Vector3(1138.195068359375, 251.86106872558594, -52.04094314575195), slotModel: 1096374064 },
    { slotPosition: new alt.Vector3(1138.99951171875, 251.73062133789062, -52.04094696044922), slotModel: 161343630 },
    { slotPosition: new alt.Vector3(1138.798583984375, 253.03631591796875, -52.04094696044922), slotModel: 3807744938 },
    { slotPosition: new alt.Vector3(1139.3721923828125, 252.45631408691406, -52.04094696044922), slotModel: 654385216 },
    { slotPosition: new alt.Vector3(1134.5560302734375, 257.27777099609375, -52.04094696044922), slotModel: 161343630 },
    { slotPosition: new alt.Vector3(1135.131591796875, 256.69903564453125, -52.04094696044922), slotModel: 2362925439 },
    { slotPosition: new alt.Vector3(1134.759033203125, 255.97341918945312, -52.04094696044922), slotModel: 2775323096 },
    { slotPosition: new alt.Vector3(1129.6400146484375, 250.45098876953125, -52.04094314575195), slotModel: 3807744938 },
];

const maxEntitiesInStream = availableSlotPosition.length;
const slotGroup = new alt.VirtualEntityGroup(maxEntitiesInStream);
const slotType = 'casinoSlot';


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

let serverSlots: Slot[] = [];

alt.on('requestSyncedScene', (player, sceneID) => {
    return true;
});

alt.on('startSyncedScene', (player, sceneID, startPos, startRot, animDict) => {
    return true;
});

alt.on('stopSyncedScene', (player, sceneID) => {
    return true;
});

alt.on('updateSyncedScene', (player, sceneID, startRate) => {
    return true;
});

class Slot {
    slotModel: number | null;
    slotPosition: alt.Vector3 | null;
    slotColshape: alt.ColshapeCircle | null;

    occupiedBy: alt.Player | null;
    playersInRange: alt.Player[];

    winNum: Win | null;
    isSpinning: boolean;

    slotEntity: alt.VirtualEntity | null;

    constructor(slotPosition, slotModel) {
        this.slotPosition = slotPosition;
        this.slotModel = slotModel;

        this.slotColshape = new alt.ColshapeCircle(this.slotPosition.x, this.slotPosition.y, 1.5);
        this.slotColshape.playersOnly = true;

        this.occupiedBy = null;
        this.playersInRange = [];

        this.isSpinning = false;
    }

    enterRange(slotPlayer: alt.Player) {
        if (this.occupiedBy !== null) return;

        let isPlayingAlready = serverSlots.find(serverSlot => serverSlot.occupiedBy == slotPlayer);
        if (isPlayingAlready) return;

        let inAnotherRange = serverSlots.find(serverSlot => serverSlot.playersInRange.includes(slotPlayer));
        if (inAnotherRange) return;

        let alreadyInRange = this.playersInRange.find(rangePlayer => rangePlayer == slotPlayer);
        if (alreadyInRange) return;

        this.playersInRange.push(slotPlayer);
        slotPlayer.emitRaw('clientSlots:closestSlot', this.slotPosition, this.slotModel);
    };

    leaveRange(slotPlayer: alt.Player) {
        let rangePlayerIndex = this.playersInRange.findIndex(rangePlayer => rangePlayer == slotPlayer);
        if (rangePlayerIndex == -1) return;

        this.playersInRange.splice(rangePlayerIndex, 1);
        slotPlayer.emitRaw('clientSlots:resetClosestSlot', this.slotPosition, this.slotModel);
    };

    sitPlayer(slotPlayer: alt.Player) {
        if (slotPlayer.isDead) return;
        if (this.occupiedBy != null) return;

        let isPlayingAlready = serverSlots.find(serverSlot => serverSlot.occupiedBy == slotPlayer);
        if (isPlayingAlready) return;

        this.occupiedBy = slotPlayer;
        this.slotEntity = new alt.VirtualEntity(slotGroup, this.slotPosition, 50, { 
            entityType: slotType, 
            entityModel: this.slotModel, 
            entityPosition: this.slotPosition,
            firstX: 0,
            secondX: 0,
            thirdX: 0
        });

        this.occupiedBy.emitRaw('clientSlots:enterSlot');

        this.playersInRange.forEach(rangePlayer => {
            if (rangePlayer == this.occupiedBy) return;

            let rangePlayerIndex = this.playersInRange.findIndex(player => player == rangePlayer);
            this.playersInRange.splice(rangePlayerIndex, 1);

            rangePlayer.emitRaw('clientSlots:resetClosestSlot');
        });
    };

    async spinSlot(slotPlayer: alt.Player) {
        if (this.occupiedBy != slotPlayer) return;
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.winNum = {
            firstReel: getRandomInt(1, 16),
            secondReel: getRandomInt(1, 16),
            thirdReel: getRandomInt(1, 16)
        };

        let firstRnd = getRandomInt(1, 100);
        let secondRnd = getRandomInt(1, 100);
        let thirdRnd = getRandomInt(1, 100);

        if (firstRnd > 70 && this.winNum.firstReel != 16) this.winNum.firstReel += 0.5;
        if (secondRnd > 70 && this.winNum.secondReel != 16) this.winNum.secondReel += 0.5;
        if (thirdRnd > 70 && this.winNum.thirdReel != 16) this.winNum.thirdReel += 0.5;

        this.slotEntity.setStreamSyncedMeta("firstX", this.winNum.firstReel);
        this.slotEntity.setStreamSyncedMeta("secondX", this.winNum.secondReel);
        this.slotEntity.setStreamSyncedMeta("thirdX", this.winNum.thirdReel);

        this.slotEntity.setStreamSyncedMeta("spinningInfo", { isSpinning: true, spinningStart: alt.getNetTime() });
        this.occupiedBy.emitRaw('clientSlot:spinSlot');

        await alt.Utils.wait(6000);

        if (this.slotEntity !== null && this.slotEntity.valid) {
            let totalWin: number = 0;

            let aWin = winNumbers[this.winNum.firstReel];
            let bWin = winNumbers[this.winNum.secondReel];
            let cWin = winNumbers[this.winNum.thirdReel];
    
            if (aWin === bWin && bWin === cWin && aWin === cWin) {
                if (winMultipliers[aWin]) {
                    totalWin = 100 * winMultipliers[aWin];
                };
            } else if (aWin === '6' && bWin === '6') {
                totalWin = 100 * 5;
            } else if (aWin === '6' && cWin === '6') {
                totalWin = 100 * 5;
            } else if (bWin === '6' && cWin === '6') {
                totalWin = 100 * 5;
            } else if (aWin === '6') {
                totalWin = 100 * 2;
            } else if (bWin === '6') {
                totalWin = 100 * 2;
            } else if (cWin === '6') {
                totalWin = 100 * 2;
            };
    
            var isWin = totalWin > 0 ? true : false;
    
            if (isWin) {
                // Here you can do more stuff urself after the player won.
                alt.log('Player won!');
            } else {
                // Here you can do more stuff urself after the player lost.
                alt.log('Player lost!');
            };
    
            this.isSpinning = false;
            this.slotEntity.setStreamSyncedMeta("spinningInfo", { isSpinning: false, spinningStart: alt.getNetTime() });
            this.occupiedBy.emitRaw('clientSlot:spinFinished', isWin);
        }
    };

    clearSlot() {
        if (this.slotColshape != null) {
            if (this.slotColshape.valid) {
                this.slotColshape.destroy();
                this.slotColshape = null;
            };
        };

        if (this.slotEntity != null) {
            if (this.slotEntity.valid) {
                this.slotEntity.destroy();
                this.slotEntity = null;
            };
        };
    };
};

alt.on('resourceStart', (isErrored: boolean) => {
    for (let index = 0; index < availableSlotPosition.length; index++) {
        const availableSlot = availableSlotPosition[index];
        
        let serverSlot = new Slot(availableSlot.slotPosition, availableSlot.slotModel);
        serverSlots.push(serverSlot);
    };
});

alt.on('playerDisconnect', (player: alt.Player, reason: string) => {
    let playerSlot = serverSlots.find(serverSlot => serverSlot.occupiedBy == player);
    if (!playerSlot) return;

    playerSlot.clearSlot();

    let currSlotPosition = playerSlot.slotPosition;
    let currSlotModel = playerSlot.slotModel;

    let playerSlotIndex = serverSlots.findIndex(serverSlot => serverSlot == playerSlot);
    if (playerSlotIndex == -1) return;

    serverSlots.splice(playerSlotIndex, 1);

    let serverSlot = new Slot(currSlotPosition, currSlotModel);
    serverSlots.push(serverSlot);
});

alt.on('playerDeath', (deadPlayer: alt.Player, killerPlayer: alt.Player) => {
    let playerSlot = serverSlots.find(serverSlot => serverSlot.occupiedBy == deadPlayer);
    if (!playerSlot) return;

    playerSlot.clearSlot();

    let currSlotPosition = playerSlot.slotPosition;
    let currSlotModel = playerSlot.slotModel;

    let playerSlotIndex = serverSlots.findIndex(serverSlot => serverSlot == playerSlot);
    if (playerSlotIndex == -1) return;

    serverSlots.splice(playerSlotIndex, 1);

    let serverSlot = new Slot(currSlotPosition, currSlotModel);
    serverSlots.push(serverSlot);

    deadPlayer.emitRaw('clientSlots:resetClosestSlot');
});

alt.on('playerConnect', (player: alt.Player) => {
    player.model = 'mp_m_freemode_01';
    player.spawn(1102.3984375, 229.2767181396484, -49.84078979492187);
});

alt.onClient('serverSlots:enterSlot', (player: alt.Player) => {
    let closestPlayerSlot = serverSlots.find(serverSlot => serverSlot.playersInRange.includes(player));
    if (!closestPlayerSlot) return;

    closestPlayerSlot.sitPlayer(player);
});

alt.onClient('serverSlots:spinSlot', (player: alt.Player) => {
    let playerSlot = serverSlots.find(serverSlot => serverSlot.occupiedBy == player);
    if (!playerSlot) return;

    playerSlot.spinSlot(player);
});

alt.onClient('serverSlots:leaveSlot', (player: alt.Player) => {
    let playerSlot = serverSlots.find(serverSlot => serverSlot.occupiedBy == player);
    if (!playerSlot) return;

    if (playerSlot.isSpinning) return;

    playerSlot.clearSlot();

    let currSlotPosition = playerSlot.slotPosition;
    let currSlotModel = playerSlot.slotModel;

    let playerSlotIndex = serverSlots.findIndex(serverSlot => serverSlot == playerSlot);
    if (playerSlotIndex == -1) return;

    serverSlots.splice(playerSlotIndex, 1);

    player.emitRaw('clientSlot:leaveSlot', currSlotPosition, currSlotModel);

    let serverSlot = new Slot(currSlotPosition, currSlotModel);
    serverSlots.push(serverSlot);
});

alt.on('entityEnterColshape', (colshape: alt.Colshape, entity: alt.Entity) => {
    if (!(entity instanceof alt.Player)) return;

    let foundSlot = serverSlots.find(serverSlot => serverSlot.slotColshape == colshape);
    if (foundSlot == null) return;

    let entityAsPlayer = entity as alt.Player;
    foundSlot.enterRange(entityAsPlayer);
});

alt.on('entityLeaveColshape', (colshape: alt.Colshape, entity: alt.Entity) => {
    if (!(entity instanceof alt.Player)) return;

    let foundSlot = serverSlots.find(serverSlot => serverSlot.slotColshape == colshape);
    if (foundSlot == null) return;

    let entityAsPlayer = entity as alt.Player;
    foundSlot.leaveRange(entityAsPlayer);
});





