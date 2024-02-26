export interface Slot {
    slotSound: string;
    slotTexture: string;
    slotName: string;
    reelA: string;
    reelB: string;
    slotTheme?: number;
    missChance: number;
    betAmounts: number[];
};

export const availableSlots: { [key: number]: Slot } = {
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