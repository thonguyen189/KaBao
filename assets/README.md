# KaBao V1 assets

Pixel-art style assets for the HTML5 mobile prototype.

## Images

- `images/logo-anti-mosquito.svg`: anti-mosquito logo for the main menu.
- `images/mosquito-flying.svg`: default flying mosquito.
- `images/mosquito-squashed.svg`: mosquito hit state.
- `images/slipper-hit.svg`: default hit item.
- `images/coin.svg`: coin reward.
- `images/plus-one-coin.svg`: small `+1` reward popup.
- `images/background-pattern.svg`: soft vertical gameplay background.
- `images/hit-burst.svg`: quick hit feedback burst.

## LIP Art Pack

The imported LIP art is organized by usage domain so runtime paths stay readable:

- `lip/backgrounds/`: scene backgrounds.
- `lip/branding/`: app icon, logo, splash and poster art.
- `lip/characters/kabao/`: Ka Bao source sheets and pose cutouts.
- `lip/effects/`: effect sheets and animation frames.
- `lip/icons/menu/`: transparent menu icons cut from `iconmenu-source.png`.
- `lip/mosquitoes/`: mosquito sheets and flying, hit, falling frames.
- `lip/ui/`: UI sheets and named HUD/button assets.
- `lip/weapons/`: weapon sheets and named frame sequences.

## Sounds

- `sounds/mosquito-loop.wav`: light mosquito buzz bed, intended to loop at low volume.
- `sounds/slap-hit.wav`: short slap impact.
- `sounds/coin-collect.wav`: coin reward chime.
- `sounds/game-start.wav`: start cue.
- `sounds/game-over.wav`: result cue.

Use `asset-manifest.json` as the stable lookup table when wiring the game.
