#  🎰 alt:V Slots

Preview: https://streamable.com/2o6sa6

## Features:
- Created using server-side objects.
- Synced network scenes.
- Different scenes & sounds for wins and loses.
- All the slots inside the casino are playable.
- The money won is actually calculated based on the slot positions and not on some random value.
- Use `E` to sit at the slot, `Space` to spin the slots, and `Backspace` to leave the slot.

### Known Problems:
- Even if the objects are created on the server-side and their rotation is also changed on the server-side, only the netOwner can see the object actually rotating. I have no idea what can cause this. Any help is welcome. More details about the issue are here: [alt:V Issue](https://github.com/altmp/altv-issues/issues/2251)
- Sometimes (most of the time) the player which is playing, will be seen by other players "warping" into his position. I also have no idea what can cause this.
  
### What can be done to improve the code:
- A lot. Some of the things to be done are to use RMLUI instead of natives, etc.

## Information:
- This is not a drag and drop system. There are still changes that you have to make for this system to work for your server. This is more of a template / idea of how a casino slot system can be created.
- This was only tested using 2 players.
- This system was created using: [Typescript Boilerplate for alt:V](https://github.com/Stuyk/altv-typescript)

## Running the system:

```sh
npm install
```

```sh
npm run update
```

```sh
npm run dev
```

To close the server use: `CTRL + C` in the terminal.

### Contact:
- Discord: _dgx
