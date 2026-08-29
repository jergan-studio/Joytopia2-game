# Joytopia 2 Game Template

A starter template for making games with **Joytopia 2** by Jergan Studio.

## Included

- Three.js game runtime
- 3D scene and lighting
- Starter grass world
- Included `jergplr.glb` player model
- WASD / Arrow Key movement
- Space jumping
- Third-person camera
- Responsive browser window

## Project Structure

```text
Joytopia2-game/
├── index.html
├── game.js
├── style.css
└── jergplr.glb
```

## Run

Because the game uses ES modules, run it from a local web server instead of opening `index.html` directly.

### VS Code

Install the **Live Server** extension, then right-click `index.html` and choose **Open with Live Server**.

### Python

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Making Your Game

Edit `game.js` to add:

- Maps and environments
- NPCs
- Items
- Enemies
- Physics
- UI
- Game modes
- Multiplayer systems
- Custom player controls

Replace or add models in the project folder and load them with `GLTFLoader`.

## License

This template is part of the Joytopia 2 project by Jergan Studio.
