import * as alt from 'alt-server';

const availableSlotsPosition = new alt.Vector3(1100.93896484375, 231.0016632080078, -50.840919494628906);
const slotModel = 161343630;

alt.on('resourceStart', (isErrored: boolean) => {
    let slotColshape = new alt.ColshapeCircle(availableSlotsPosition.x, availableSlotsPosition.y, 1.5);
    slotColshape.setMeta("slotColshape", true);
});

alt.on('playerConnect', (player: alt.Player) => {
    player.model = 'mp_m_freemode_01';
    player.spawn(1100.93896484375, 231.0016632080078, -50.840919494628906);

    player.setMeta("inColshape", false);
});

alt.on('entityEnterColshape', (colshape: alt.Colshape, entity: alt.Entity) => {
    if (!(entity instanceof alt.Player)) return;
    if (colshape.getMeta("slotColshape") != true) return;
    if (entity.getMeta("inColshape") == true) return;

    entity.setMeta("inColshape", true);
    entity.emitRaw("clientSlots:closestSlot", availableSlotsPosition, slotModel);
});

alt.on('entityLeaveColshape', (colshape: alt.Colshape, entity: alt.Entity) => {
    if (!(entity instanceof alt.Player)) return;
    if (colshape.getMeta("slotColshape") != true) return;
    if (entity.getMeta("inColshape") != true) return;

    entity.setMeta("inColshape", false);
    entity.emitRaw("clientSlots:resetClosestSlot");
});

alt.onClient('serverSlots:enterSlot', (player: alt.Player, clientSlotPosition: alt.Vector3) => {
    if (clientSlotPosition.distanceTo(availableSlotsPosition) > 1) return;
    if (player.getMeta("inColshape") != true) return;

    alt.log('Player sitting.');
    player.emitRaw('clientSlots:enterSlot');
});




